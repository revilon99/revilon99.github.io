/*
pong-music/youtube.js
Oliver Cass (c) 2020
All Rights Reserved

Code that when pasted into the developer console of a youtube site
allows any song to be played and visualized with the pong program

Better to copy and paste the minified code
*/


/*
CollisionPhysics.js
Oliver Cass (c) 2020
All Rights Reserved
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
		this.pointIntersectsLineVertical(A, rect.x2, timeLimit, this.temp, 'right');
		if(this.temp.t < response.t) response.copy(this.temp);
		
		//Left Border
		this.pointIntersectsLineVertical(A, rect.x1, timeLimit, this.temp, 'left');
		if(this.temp.t < response.t) response.copy(this.temp);
		
		//Top Border
		this.pointIntersectsLineHorizontal(A, rect.y1, timeLimit, this.temp, 'top');
		if(this.temp.t < response.t) response.copy(this.temp);
		
		//Bottom Border
		this.pointIntersectsLineHorizontal(A, rect.y2, timeLimit, this.temp, 'bottom');
		if(this.temp.t < response.t) response.copy(this.temp);
	}
	
	this.pointIntersectsLineVertical = function(A, x, timeLimit, response, side){
		response.reset();
		
		if(A.velX == 0 && (A.velR||0) == 0) return;
		
		var distance;
		if(side == 'left'){
			distance = x - A.x + A.radius;
			
			if(A.x - A.radius < x) return;
			
		}else if(side == 'right'){
			distance = x - A.x - A.radius;
			
			if(A.x + A.radius > x) return;
		}else{
			if(x > A.x) distance = x - A.x - A.radius;
			else distance = x - A.x + A.radius;
		}
		
		
		var t = distance / (A.velX + A.velR);
		if(t > 0 && t <= timeLimit){
            response.t = t;
            response.nVelX = -A.velX;
            response.nVelY = A.velY;
        }
	}
	
	this.pointIntersectsLineHorizontal = function(A, y, timeLimit, response, side){
		response.reset();
		
		if(A.velY == 0 && (A.velR||0) == 0) return;
		
		var distance;
		
		if(side == 'top'){
			distance = y - A.y + A.radius;
			
			if(A.y - A.radius < y) return;
		}else if(side == 'bottom'){
			distance = y - A.y - A.radius;
			
			if(A.y + A.radius > y) return;
		}else{
			if(y > A.y) distance = y - A.y - A.radius;
			else distance = y - A.y + A.radius;
		}
		
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

/*
Build Canvas Above Video
*/

var running = true;

var newDiv = document.createElement('div');
newDiv.id = 'pong';
newDiv.style.width = '100%';
newDiv.style.height = '500px';
newDiv.style.backgroundColor = "#000";
newDiv.style.position = "relative";
newDiv.style.borderBottom = "10px solid #f9f9f9";

var canvas = document.createElement('canvas');
canvas.id = "canvas";
canvas.style.width = "100%";
canvas.style.height = "100%";

var playpause = document.createElement('div');
playpause.style = `position: absolute;
				   right: 1vh;
				   top: 1vh;
				   background: transparent;
				   box-sizing: border-box;
				   width: 0;
				   height: 8vh;
				   border-color: transparent transparent transparent #ffffff;
				   transition: 100ms all ease;
				   cursor: pointer;
				   border-style: double;
				   border-width: 0px 0 0px 7vh;`;

playpause.addEventListener('click', play, false);

function play(e){
	if(!setup) init_music();
	running = !running;
	if(running){
		playpause.style.borderStyle = "double";
		playpause.style.borderWidth = "0px 0 0px 7vh";
		darken.style.display = "none";
	}else{
		playpause.style.borderStyle = "solid";
		playpause.style.borderWidth = "4vh 0 4vh 6vh";
		darken.style.display = "inline-block";
	}
}

var darken = document.createElement('div');
darken.style = 	`position: absolute;
				 display: none;
				 left: 0px;
				 top: 0px;
				 width: calc(100% - 15vh);
				 height: calc(100% - 15vh);
				 background-color: #000000bd;
				 overflow-y: auto;
				 padding: 5vh 10vh 10vh 5vh;`
				 
var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
#pong h1, #pong h2, #pong h3, #pong a{
  font-family: 'Arial';
  color: white;
  margin: 0;
  font-size: 3em;
}
#pong h1{
  margin: 2vh 0 1vh;
}
#pong h2{
  padding-left: 1vh;
}
#pong h3{
  padding-left: 2vh;
}
#pong a{
  display: inline-block;
  color: white;
  font-size: 30px;
  float: right;
}

#pong .slider {
  display: inline-block;
  -webkit-appearance: none;
  width: 90%;
  margin: 10px 10px 20px 0;
  height: 25px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

#pong .slider:hover {
  opacity: 1;
}

#pong .slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  background: #4CAF50;
  cursor: pointer;
}

#pong .slider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  background: #4CAF50;
  cursor: pointer;
}

#pong div::-webkit-scrollbar{
  display: none;
}
div#fullscreen {
	cursor: pointer;
	width: 8vh;
	height: 8vh;
  
	position: absolute;
	top: 1vh;
	right: 10vh;

	background:
		linear-gradient(to right, white 1vh, transparent 1vh) 0 0,
		linear-gradient(to right, white 1vh, transparent 1vh) 0 100%,
		linear-gradient(to left, white 1vh, transparent 1vh) 100% 0,
		linear-gradient(to left, white 1vh, transparent 1vh) 100% 100%,
		linear-gradient(to bottom, white 1vh, transparent 1vh) 0 0,
		linear-gradient(to bottom, white 1vh, transparent 1vh) 100% 0,
		linear-gradient(to top, white 1vh, transparent 1vh) 0 100%,
		linear-gradient(to top, white 1vh, transparent 1vh) 100% 100%;

	background-repeat: no-repeat;
	background-size: 2.5vh 2.5vh;
}

div#fullscreen:hover{
	background:
		linear-gradient(to right, white 1.2vh, transparent 1.2vh) 0 0,
		linear-gradient(to right, white 1.2vh, transparent 1.2vh) 0 100%,
		linear-gradient(to left, white 1.2vh, transparent 1.2vh) 100% 0,
		linear-gradient(to left, white 1.2vh, transparent 1.2vh) 100% 100%,
		linear-gradient(to bottom, white 1.2vh, transparent 1.2vh) 0 0,
		linear-gradient(to bottom, white 1.2vh, transparent 1.2vh) 100% 0,
		linear-gradient(to top, white 1.2vh, transparent 1.2vh) 0 100%,
		linear-gradient(to top, white 1.2vh, transparent 1.2vh) 100% 100%;
	
	background-repeat: no-repeat;
	background-size: 3vh 3vh;
}

canvas#colour-bar{
	width: 100%;
}
`;
document.getElementsByTagName('head')[0].appendChild(style);
var params = {};
darken.innerHTML = `
<h1>Pong Music Visualizer</h1>
<h2>Min Radius</h2>
<input type="range" min="0" max="100" value="40" class="slider" id="minRadius">
<a id="minRadius_a"></a>
<h2>Max Radius</h2>
<input type="range" min="0" max="100" value="80" class="slider" id="maxRadius">
<a id="maxRadius_a"></a>
<h2>Max Speed</h2>
<input type="range" min="0" max="80" scale="10" value="50" class="slider" id="maxSpeed">
<a id="maxSpeed_a"></a>
<h2>Music Force</h2>
<input type="range" min="0" max="100" value="40" class="slider" id="music">
<a id="music_a"></a>
<h2>Overlap Force</h2>
<input type="range" min="0" max="20" scale="10" value="10" class="slider" id="overlapForce">
<a id="overlapForce_a"></a>
<div id="fullscreen" onclick="fullscreen()"></div>

<h1>Color Bar (RGB)</h1>

<h2>r sin Coefficient</h2>
<input type="range" min="0" max="100" scale="10" value="40" class="slider" id="rCoeff">
<a id="rCoeff_a"></a>
<h2>g sin Coefficient</h2>
<input type="range" min="0" max="100" scale="10" value="60" class="slider" id="gCoeff">
<a id="gCoeff_a"></a>
<h2>b sin Coefficient</h2>
<input type="range" min="0" max="100" scale="10" value="30" class="slider" id="bCoeff">
<a id="bCoeff_a"></a>

<h2>RGB Range (0 - 255)</h2>
<input type="range" min="0" max="255" value="127" class="slider" id="range">
<a id="range_a"></a>
<h2>RGB Offset (0 - 255)</h2>
<input type="range" min="0" max="255" value="100" class="slider" id="offset">
<a id="offset_a"></a>

<h2>r scale</h2>
<input type="range" min="0" max="5" value="1" class="slider" id="rScale">
<a id="rScale_a"></a>
<h2>r Coefficient</h2>
<input type="range" min="0" max="100" scale="10" value="13" class="slider" id="rCo">
<a id="rCo_a"></a>

<h2>g scale</h2>
<input type="range" min="0" max="10" value="1" class="slider" id="gScale">
<a id="gScale_a"></a>
<h2>g Coefficient</h2>
<input type="range" min="0" max="100" scale="10" value="10" class="slider" id="gCo">
<a id="gCo_a"></a>

<h2>b scale</h2>
<input type="range" min="0" max="10" value="1" class="slider" id="bScale">
<a id="bScale_a"></a>
<h2>b Coefficient</h2>
<input type="range" min="0" max="100" scale="10" value="10" class="slider" id="bCo">
<a id="bCo_a"></a>

<canvas id="colour-bar" width="1000" height="100"></canvas>
`;
				 
newDiv.appendChild(canvas);
newDiv.appendChild(darken);
newDiv.appendChild(playpause);

document.getElementById('primary').insertBefore(newDiv, document.getElementById('primary').children[0]);

function slider(e){
    if(document.getElementById(e.target.id + "_a")) document.getElementById(e.target.id + "_a").innerHTML = e.target.value / (e.target.getAttribute('scale')||1);
    params[e.target.id] = e.target.value / (e.target.getAttribute('scale')||1);
    calculate();
}


var inputs = document.getElementsByClassName('slider');
for(var i of inputs){
	if(document.getElementById(i.id + "_a")) document.getElementById(i.id + "_a").innerHTML = i.value / (i.getAttribute('scale')||1);
	i.addEventListener('input', slider, false);
	params[i.id] = i.value / (i.getAttribute('scale')||1);
}

var colorBar = document.getElementById('colour-bar');
var barCtx = colorBar.getContext('2d');

function calculate(){
	if(params.minRadius > params.maxRadius) params.minRadius = params.maxRadius;
	if(params.music > params.minRadius) params.music = params.minRadius;
	
	for(var i = 0; i < colorBar.width; i++){
		barCtx.fillStyle = colour(i / colorBar.width);
		barCtx.fillRect(i, 100, 1, -20);
	}
}

calculate();

/*
init canvas
*/

function fullscreen(){
	if(canvas.webkitRequestFullScreen) {
		canvas.webkitRequestFullScreen();
	} else {
		canvas.mozRequestFullScreen();
	}
	init_canvas();
	play();
}

var ctx = canvas.getContext('2d');

var width, height;

function init_canvas(){
      var dpr = window.devicePixelRatio || 1;
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
	  width = rect.width;
	  height = rect.height;
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

/*
balls.js
Oliver Cass (c) 2020
All Rights Reserved
*/

var balls = [];

const DELTA_R = 0.001;

var audioCtx, analyser, freqDataArray, smooth, source;

var Ball = function(x, y){
    this.x = x||(Math.random() * canvas.clientWidth);
    this.y = y||(Math.random() * canvas.clientHeight);

    this.velX = 2 * Math.random() * params.maxSpeed - params.maxSpeed;
    this.velY = 2 * Math.random() * params.maxSpeed - params.maxSpeed;

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
        var newRadius = this.init_radius - params.music*(smooth[Math.floor(this.colour*smooth.length)]/255);
		if(newRadius < 5) newRadius = 5;
        this.velR = newRadius - this.radius;
    }

    this.update = function(time){
        if(this.velX > params.maxSpeed) this.velX = params.maxSpeed;
        if(this.velX < -params.maxSpeed) this.velX = -params.maxSpeed;
        if(this.velY > params.maxSpeed) this.velY = params.maxSpeed;
        if(this.velY < -params.maxSpeed) this.velY = -params.maxSpeed;

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

    this.radius = params.minRadius + Math.random() * (params.maxRadius - params.minRadius);

    while(!this.canSpawn()){
        this.radius -= DELTA_R;
        if(this.radius < params.minRadius) delete_ball(this);
    }

    this.init_radius = this.radius;
}

const EPSILON_TIME = 0.00000001;

function tick(){
    var timeLeft = 1.0;
	
	var rect = canvas.getBoundingClientRect();
	if(width != rect.width && rect.width > 200) init_canvas();

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
	//Potentially make porportional to distance of overlap
    for(var b of balls){
        if(b == null) continue;
		for(var b2 of balls){
			if(b2 == null || b == b2) continue;
			if(b.ballCollision(b2)){
				var dx = b2.x - b.x;
				var dy = b2.y - b.y;
				var dxSq = dx*dx;
				var dySq = dy*dy;
				var hypSq = dxSq + dySq;
				var hyp = Math.sqrt(hypSq);
				b.velX += -(dx/hyp)*params.overlapForce;
				b.velY += -(dy/hyp)*params.overlapForce;
			}
		}
		
        if(b.x - b.radius < 0) b.velX += params.overlapForce;
        if(b.x + b.radius > canvas.clientWidth) b.velX -= params.overlapForce;
        if(b.y - b.radius < 0) b.velY += params.overlapForce;
        if(b.y + b.radius > canvas.clientHeight) b.velY -= params.overlapForce;
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
	
	barCtx.clearRect(0, 0, colorBar.width, colorBar.height);
	for(var i = 0; i < colorBar.width; i++){
		barCtx.fillStyle = colour(i / colorBar.width);
		barCtx.fillRect(i, 100, 1, -20 - 80*smooth[Math.floor((i/colorBar.width)*smooth.length)]/255);
	}
}

canvas.addEventListener('click', function(e){
    if(!setup) init_music();
    var mouse = getMousePos(canvas, e);
    
    for(var b of balls) {
        if(b == null) continue;
        if(b.pointCollision(mouse.x, mouse.y, params.minRadius)) {
            delete_ball(b);
            return;
        }
    }

    if(mouse.x > params.minRadius && mouse.x < canvas.clientWidth - params.minRadius ||
       mouse.y > params.minRadius && mouse.y < canvas.clientHeight - params.minRadius) balls.push(new Ball(mouse.x, mouse.y));
       
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
    var r = Math.sin(params.rCoeff*i);
    var g = Math.sin(params.gCoeff*i);
    var b = Math.cos(params.bCoeff*i);

	for(var j = 0; j < params.rScale; j++){
		r *= r;
	}
	for(var j = 0; j < params.gScale; j++){
		g *= g;
	}
	for(var j = 0; j < params.bScale; j++){
		b *= b;
	}

    r = (params.rCo*r)*params.range + params.offset;
    g = (params.gCo*g)*params.range + params.offset;
    b = (params.bCo*b)*params.range + params.offset;

    return `rgb(${r}, ${g}, ${b})`;
}

init_canvas();