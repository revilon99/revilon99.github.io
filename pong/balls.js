/*
balls.js
Oliver Cass (c) 2020
All Rights Reserved
*/

var balls = [];
var MIN_RADIUS;
var MAX_RADIUS;

var MAX_SPEED;

const DELTA_R = 0.01;

var running = true;

var Ball = function(x, y){
    this.x = x||(Math.random() * canvas.clientWidth);
    this.y = y||(Math.random() * canvas.clientHeight);

    this.velX = 2 * Math.random() * MAX_SPEED - MAX_SPEED;
    this.velY = 2 * Math.random() * MAX_SPEED - MAX_SPEED;

    this.colour = randomColour();

    this.earliestCollisionResponse = new Collision();

    this.temp = new Collision();
    this.me = new Collision();
    this.other = new Collision();

    this.ballIntersect = function(ball, timeLimit){
        CollisionPhysics.pointIntersectsMovingPoint(
        this.x, this.y, this.velX, this.velY, this.radius,
        ball.x, ball.y, ball.velX, ball.velY, ball.radius,
        timeLimit, this.me, this.other);

        if(this.other.t < ball.earliestCollisionResponse.t) ball.earliestCollisionResponse.copy(this.other);
        if(this.me.t < this.earliestCollisionResponse.t) this.earliestCollisionResponse.copy(this.me)
    }

    this.borderIntersect = function(timeLimit){
        CollisionPhysics.pointIntersectsRectangleOuter(
            this.x, this.y, this.velX, this.velY, this.radius,
            0, 0, canvas.clientWidth, canvas.clientHeight,
            timeLimit, this.temp);
        if(this.temp.t < this.earliestCollisionResponse.t) this.earliestCollisionResponse.copy(this.temp);
    }

    this.pointCollision = function(x, y, point_size){
        return ((x - this.x)*(x - this.x) + (y - this.y)*(y - this.y) < (this.radius + point_size)*(this.radius + point_size))
    }

    this.ballCollision = function(ball){
        return ((this.x - ball.x)*(this.x - ball.x) + (this.y - ball.y)*(this.y - ball.y) < (this.radius + ball.radius)*(this.radius + ball.radius));
    }

    this.update = function(time){
        if(this.velX > MAX_SPEED) this.velX = MAX_SPEED;
        if(this.velY > MAX_SPEED) this.velY - MAX_SPEED;

        if(this.earliestCollisionResponse.t <= time){
            this.x = this.earliestCollisionResponse.getNewX(this.x, this.velX);
            this.y = this.earliestCollisionResponse.getNewY(this.y, this.velY);
            this.velX = this.earliestCollisionResponse.nVelX;
            this.velY = this.earliestCollisionResponse.nVelY;
        }else{
            this.x += this.velX * time;
            this.y += this.velY * time;
        }

        this.earliestCollisionResponse.reset();
    }

    this.render = function(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.colour;
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
}

const EPSILON_TIME = 0.0001;

function tick(){
    var timeLeft = 1;

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
    }while(timeLeft > EPSILON_TIME);

    //Quick solution the (rare but obvious) problem where balls get stuck
    //Just delete it if the center of the ball exceeds the boundary
    for(var b of balls){
        if(b == null) continue;
        if(b.x < 0) delete_ball(b);
        if(b.x > canvas.clientWidth) delete_ball(b);
        if(b.y < 0) delete_ball(b);
        if(b.y > canvas.clientHeight) delete_ball(b);
    }
    
    render();
    if(running) requestAnimationFrame(tick);
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
    //obviously sould splice array, but life is too short to solve sync errors
    //TODO:
    //Either:
    //Splice and only edit balls array in the tick thread
    //Remove all nulls at every 100 ticks or so.
}