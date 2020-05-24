/*
balls.js
Oliver Cass (c) 2020
All Rights Reserved
*/

//https://stackoverflow.com/questions/44167012/html5-audio-to-play-a-playlist-of-local-mp3-files

var balls = [];
var MIN_RADIUS = 40;
var MAX_RADIUS = 80;

var MAX_SPEED = 5;

const DELTA_R = 0.01;
const DELTA_RAD = 65;

var audioCtx, analyser, freqDataArray, smooth, source;

var running = true;

var Ball = function(x, y){
    this.x = x||(Math.random() * canvas.clientWidth);
    this.y = y||(Math.random() * canvas.clientHeight);

    this.velX = 2 * Math.random() * MAX_SPEED - MAX_SPEED;
    this.velY = 2 * Math.random() * MAX_SPEED - MAX_SPEED;

    this.colour = Math.random();

    this.earliestCollisionResponse = new Collision();

    this.temp = new Collision();
    this.me = new Collision();
    this.other = new Collision();

    this.ballIntersect = function(ball, timeLimit){
        CollisionPhysics.pointIntersectsMovingPoint(this, ball, timeLimit, this.me, this.other);

        if(this.other.t < ball.earliestCollisionResponse.t) ball.earliestCollisionResponse.copy(this.other);
        if(this.me.t < this.earliestCollisionResponse.t) this.earliestCollisionResponse.copy(this.me)
    }

    this.borderIntersect = function(timeLimit){
        CollisionPhysics.pointIntersectsRectangleOuter(this, {x1: 0, x2: canvas.clientWidth, y1: 0, y2: canvas.clientHeight}, timeLimit, this.temp);
        if(this.temp.t < this.earliestCollisionResponse.t) this.earliestCollisionResponse.copy(this.temp);
    }

    this.pointCollision = function(x, y, point_size){
        return ((x - this.x)*(x - this.x) + (y - this.y)*(y - this.y) < (this.radius + point_size)*(this.radius + point_size))
    }

    this.ballCollision = function(ball){
        return ((this.x - ball.x)*(this.x - ball.x) + (this.y - ball.y)*(this.y - ball.y) < (this.radius + ball.radius)*(this.radius + ball.radius));
    }

    this.setRadius = function(){
        var newRadius = this.init_radius - DELTA_RAD*(smooth[Math.floor(this.colour*smooth.length)]/255);
		if(newRadius < 5) newRadius = 5;
        this.velR = newRadius - this.radius;
    }

    this.update = function(time){
        if(this.velX > MAX_SPEED) this.velX = MAX_SPEED;
        if(this.velY > MAX_SPEED) this.velY = MAX_SPEED;

        if(this.earliestCollisionResponse.t <= time){
            this.x = this.earliestCollisionResponse.getNewX(this.x, this.velX);
            this.y = this.earliestCollisionResponse.getNewY(this.y, this.velY);
            this.velX = this.earliestCollisionResponse.nVelX;
            this.velY = this.earliestCollisionResponse.nVelY;
        }else{
            this.x += this.velX * time;
            this.y += this.velY * time;
        }

        this.radius += this.velR * time;

        this.earliestCollisionResponse.reset();
    }

    this.render = function(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = colour(this.colour);
        ctx.fill();
        ctx.closePath();
    }

    this.canSpawn = function(){
        var canspawn = true;
        if(this.x < this.radius || this.x > canvas.clientWidth - this.radius ||
           this.y < this.radius || this.y > canvas.clientHeight - this.radius) canspawn = false;

        for(var b of balls){
            if(b == this) continue;
            if(b == null) continue;
            if(this.ballCollision(b)) canspawn = false;
        }

        return canspawn;
    }

    this.radius = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS);

    while(!this.canSpawn()){
        this.radius -= DELTA_R;
        if(this.radius < MIN_RADIUS) delete_ball(this);
    }

    this.init_radius = this.radius;
}

const EPSILON_TIME = 0.00000001;

function tick(){
    var timeLeft = 1;

    analyser.getByteFrequencyData(freqDataArray);
    smooth = rollingAverage(freqDataArray, 100);

    if(running) {
    for(var b of balls) {
        if(b == null) continue;
        b.setRadius();
    }

    do{
        var tMin = timeLeft;

        //Ball-Ball Collision
        for(var i = 0; i < balls.length; i++){
            for(var j = 0; j < balls.length; j++){
                if(i < j){
                    if(balls[i] == null || balls[j] == null) continue;
                    balls[i].ballIntersect(balls[j], tMin);
                    if(balls[i].earliestCollisionResponse.t < tMin) 
                        tMin = balls[i].earliestCollisionResponse.t;
                }
            }
        }
        

        //Ball-Wall Collision
        for(var b of balls){
            if(b == null) continue;
            b.borderIntersect(timeLeft);
            if(b.earliestCollisionResponse.t < tMin)
                tMin = b.earliestCollisionResponse.t;
        }

        for(var b of balls) {
            if(b == null) continue;
            b.update(tMin);
        }

        timeLeft -= tMin;
    }while(timeLeft > EPSILON_TIME);}

    //Quick solution to the (rare but obvious) problem where balls get stuck
    for(var b of balls){
        if(b == null) continue;
        if(b.x - b.radius < 0) b.x = b.radius + 1;
        if(b.x + b.radius > canvas.clientWidth) b.x = canvas.clientWidth - b.radius - 1;
        if(b.y - b.radius < 0) b.y = b.radius + 1;
        if(b.y + b.radius > canvas.clientHeight) b.y = canvas.clientHeight - b.radius - 1;
    }
    
    render();
    
    //remove null balls
    for(var i = 0; i < balls.length; i++) if(balls[i]==null) balls.splice(i--, 1);

    requestAnimationFrame(tick);
}

function render(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

     //render all balls
    for(var b of balls){
        if(b == null) continue;
        b.render();
    }
}

canvas.addEventListener('click', function(e){
    if(!setup) init_music();
    var mouse = getMousePos(canvas, e);
    
    for(var b of balls) {
        if(b == null) continue;
        if(b.pointCollision(mouse.x, mouse.y, MIN_RADIUS)) {
            delete_ball(b);
            return;
        }
    }

    if(mouse.x > MIN_RADIUS && mouse.x < canvas.clientWidth - MIN_RADIUS ||
       mouse.y > MIN_RADIUS && mouse.y < canvas.clientHeight - MIN_RADIUS) balls.push(new Ball(mouse.x, mouse.y));
       
}, false);

function delete_ball(ball){
    balls[balls.indexOf(ball)] = null;
}

document.getElementById('playpause').addEventListener('click', function(e){
    running = !running;
    if(running) {
        e.target.classList.remove('paused');
        document.getElementById('darken').style.display = "none";
    }else{
        e.target.classList.add('paused');
        document.getElementById('darken').style.display = "initial";
    }
}, false);

var setup = false;
function init_music(){
    setup = true;
    try{
        document.getElementById('audio').play();

        audioCtx = new AudioContext();

        var audio = document.getElementById('audio');
        var input = audioCtx.createMediaElementSource(audio);

        input.connect(audioCtx.destination);

        analyser = audioCtx.createAnalyser();

        input.connect(analyser);

        freqDataArray = new Uint8Array(analyser.frequencyBinCount);
    }catch(e){
        setup = false;
    }

    requestAnimationFrame(tick);
}

function rollingAverage(data, n){
    var smooth = [];
    for(var i = 0; i < data.length; i++){
        var sum = 0;
        var count = 0;
        for(var j = i - Math.floor(n/2); j < i + Math.floor(n/2); j++){
            if(data[j]){
                if(data[j] > 0) sum += data[j];
                count++;
            }
        }
        if(count < 1) count = 1;
        smooth[i] = sum / count;
    }
    return smooth;
}


function colour(i){
    var r = Math.sin(4*i);
    var g = Math.sin(6*i);
    var b = Math.cos(3*i);

    r = (1.3*r*r)*127 + 100;
    g = (g*g)*127 + 100;
    b = (b*b)*127 + 100;

    return `rgb(${r}, ${g}, ${b})`;
}