/*
pong-music/youtube.js
Oliver Cass (c) 2020
All Rights Reserved

Code that when pasted into the developer console of a youtube site
allows any song to be played and visualized with the pong program

Better to copy and paste the minified code
*/


const T_EPSILON = 0.00000005;

var Collision = function(){
    this.reset = function(){
        this.t = Infinity;
    }

    this.copy = function(col){
        this.t = col.t;
        this.nVelX = col.nVelX;
        this.nVelY = col.nVelY;
    }

    this.getNewX = function(curX, velX){
        if(this.t > T_EPSILON) return curX + velX * (this.t - T_EPSILON);
        else return curX;
    }
    this.getNewY = function(curY, velY){
        if(this.t > T_EPSILON) return curY + velY * (this.t - T_EPSILON);
        else return curY;
    }

    this.getImpactX = function(curX, speedX){
        return curX + speedX * this.t;
    }
    this.getImpactY = function(curY, speedY){
        return curY + speedY * this.t;
    }

    this.reset();
}

var CollisionPhysics = new (function(){
	this.temp = new Collision();
	
	this.pointIntersectsRectangleOuter = function(A, rect, timeLimit, response){
		response.reset();
		
		//Right Border
		this.pointIntersectsLineVertical(A, rect.x2, timeLimit, this.temp);
		if(this.temp.t < response.t) response.copy(this.temp);
		
		//Left Border
		this.pointIntersectsLineVertical(A, rect.x1, timeLimit, this.temp);
		if(this.temp.t < response.t) response.copy(this.temp);
		
		//Top Border
		this.pointIntersectsLineHorizontal(A, rect.y1, timeLimit, this.temp);
		if(this.temp.t < response.t) response.copy(this.temp);
		
		//Bottom Border
		this.pointIntersectsLineHorizontal(A, rect.y2, timeLimit, this.temp);
		if(this.temp.t < response.t) response.copy(this.temp);
	}
	
	this.pointIntersectsLineVertical = function(A, x, timeLimit, response){
		response.reset();
		
		if(A.velX == 0 && (A.velR||0) == 0) return;
		
		var distance;
		if(x > A.x) distance = x - A.x - A.radius;
		else distance = x - A.x + A.radius;
		
		var t = distance / (A.velX + A.velR);
		if(t > 0 && t <= timeLimit){
            response.t = t;
            response.nVelX = -A.velX;
            response.nVelY = A.velY;
        }
	}
	
	this.pointIntersectsLineHorizontal = function(A, y, timeLimit, response){
		response.reset();
		
		if(A.velY == 0 && (A.velR||0) == 0) return;
		
		var distance;
		if(y > A.y) distance = y - A.y - A.radius;
		else distance = y - A.y + A.radius;
		
		var t = distance / (A.velY + A.velR);
		if(t > 0 && t <= timeLimit){
            response.t = t;
            response.nVelX = A.velX;
            response.nVelY = -A.velY;
        }		
	}
	
	this.pointIntersectsMovingPoint = function(A, B, timeLimit, aResponse, bResponse){
		aResponse.reset();
		bResponse.reset();
		
		var t = this.pointIntersectsMovingPointDetection(A, B);
		
		if(t > 0 && t <= timeLimit){
			this.pointIntersectsMovingPointResponse(A, B, aResponse, bResponse, t);
		}
	}
	
	this.pointIntersectsMovingPointDetection = function(A, B){
		var x = A.x - B.x;
		var y = A.y - B.y;
		var r = A.radius + B.radius;
		var xdot = A.velX - B.velX;
		var ydot = A.velY - B.velY;
		var rdot = A.velR + B.velR;
		
		var xSq = x*x;
		var ySq = y*y;
		var xdotSq = xdot*xdot;
		var ydotSq = ydot*ydot;
		var rSq = r*r;
		var rdotSq = rdot*rdot;
		
		var discriminant = (x*xdot + y*ydot - r*rdot)*(x*xdot + y*ydot - r*rdot) - (xdotSq + ydotSq - rdotSq)*(xSq + ySq - rSq);
		if(discriminant < 0) return Infinity;
		
		var minusB = - (x*xdot + y*ydot - r*rdot);
		var denom = xdotSq + ydotSq - rdotSq;
		var rootDis = Math.sqrt(discriminant);
		
		var sol1 = (minusB + rootDis) / denom;
		var sol2 = (minusB - rootDis) / denom;
		
		if(sol1 > 0 && sol2 > 0) return Math.min(sol1, sol2);
        else if(sol1 > 0) return sol1;
        else if(sol2 > 0) return sol2;
        else return Infinity;
	}
	
	this.pointIntersectsMovingPointResponse = function(A, B, aResponse, bResponse, t){
		aResponse.t = t;
		bResponse.t = t;
		
		var aImpactX = aResponse.getImpactX(A.x, A.velX);
		var aImpactY = aResponse.getImpactY(A.y, A.velY);
		var bImpactX = bResponse.getImpactX(B.x, B.velX);
		var bImpactY = bResponse.getImpactY(B.y, B.velY);
		
		var lineAngle = Math.atan2(bImpactY - aImpactY, bImpactX - aImpactX);
		
		var result = this.rotate(A.velX, A.velY, lineAngle);
		var aSpeedP = result[0];
		var aSpeedN = result[1];
		
		result = this.rotate(B.velX, B.velY, lineAngle);
		var bSpeedP = result[0];
		var bSpeedN = result[1];
		
		//Collision possible only if aSpeedP - bSpeedP > 0
        //Needed if the two balls overlap in their initial positions
        //Do not declare collision, so that they continue their
        //Course of movement until they are separated
        if(aSpeedP - bSpeedP <= 0){
            aResponse.reset();
            bResponse.reset();
            return;
        }
		
		//Assume that mass is proportional to the cube of the radius
        var aMass = A.radius * A.radius * A.radius;
        var bMass = B.radius * B.radius * B.radius;
        var diffMass = aMass - bMass;
        var sumMass = aMass + bMass;
		
		var aSpeedPAfter, aSpeedNAfter, bSpeedPAfter, bSpeedNAfter;

        aSpeedPAfter = (diffMass*aSpeedP + 2*bMass*bSpeedP) / sumMass;
        bSpeedPAfter = (2*aMass*aSpeedP - diffMass*bSpeedP) / sumMass;

        aSpeedNAfter = aSpeedN;
        bSpeedNAfter = bSpeedN;

        result = this.rotate(aSpeedPAfter, aSpeedNAfter, -lineAngle);
        aResponse.nVelX = result[0];
        aResponse.nVelY = result[1];
        result = this.rotate(bSpeedPAfter, bSpeedNAfter, -lineAngle);
        bResponse.nVelX = result[0];
        bResponse.nVelY = result[1];
	}
	
	this.rotate = function(x, y, theta){
       var sinTheta = Math.sin(theta);
       var cosTheta = Math.cos(theta);
       return [
            x * cosTheta + y * sinTheta,
            -x * sinTheta + y * cosTheta
       ];
   }
})();
var newDiv = document.createElement('div');
newDiv.id = 'pong';
newDiv.style.width = '100%';
newDiv.style.height = '500px';
newDiv.style.backgroundColor = "#000";
newDiv.style.position = "relative";
var canvas = document.createElement('canvas');
canvas.id = "canvas";
canvas.style.width = "100%";
canvas.style.height = "100%";
newDiv.appendChild(canvas);
document.getElementById('primary').insertBefore(newDiv, document.getElementById('primary').children[0]);

var ctx = canvas.getContext('2d');

function init_canvas(){
      var dpr = window.devicePixelRatio || 1;
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
}
canvas.onresize = init_canvas;

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect(); // abs. size of element

	return {
		x: ((evt.clientX||evt.touches[0].clientX) - rect.left),   // scale mouse coordinates after they have
		y: ((evt.clientY||evt.touches[0].clientY)  - rect.top)     // been adjusted to be relative to element
	}
}


var balls = [];
var MIN_RADIUS = 40;
var MAX_RADIUS = 80;

var MAX_SPEED = 5;

const DELTA_R = 0.01;
const DELTA_RAD = 40;

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

var setup = false;
function init_music(){
    setup = true;
    try{
        audioCtx = new AudioContext();

        var audio = document.querySelector('video');
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

init_canvas();