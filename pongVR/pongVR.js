/*
pongVR.js
Oliver Cass (c) 2020
All Rights Reserved
*/

var scene;
var params = {};

//temp
params.numBalls = 100;
params.maxSpeed = 0.1;
params.minRadius = 0.2;
params.maxRadius = 2;
params.areaRad = 50;
params.force = 0.01;
params.maxForce = 0.1;

var balls = [];

var running = false;

var origin = new THREE.Vector3(0, 1, 0);


AFRAME.registerComponent('pong', {
	init: function() {
		scene = this.el;
		
		for(var i = 0; i < params.numBalls; i++){
			var newBall = document.createElement('a-sphere');
			newBall.setAttribute('radius', Math.random()*(params.maxRadius - params.minRadius) + params.minRadius);
			newBall.setAttribute('color', randomColour());
			newBall.setAttribute('ball', '');
			newBall.object3D.position.set(Math.random()*params.areaRad*2 - params.areaRad, Math.random()*params.areaRad*2 - params.areaRad, Math.random()*params.areaRad*2 - params.areaRad);
			scene.appendChild(newBall);
		}
		
		running = true;
	}
});

AFRAME.registerComponent('ball', {
	init: function() {
		this.vel = new THREE.Vector3(Math.random()*params.maxSpeed*2 - params.maxSpeed, Math.random()*params.maxSpeed*2 - params.maxSpeed, Math.random()*params.maxSpeed*2 - params.maxSpeed);
		
		balls.push(this);
	},
	
	tick: function(time, timeDelta) {
		var pos = this.el.object3D.position;
		
		var acc = new THREE.Vector3();
		
		//Keep in areaRad
		if(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z > params.areaRad*params.areaRad){
			var seek = new THREE.Vector3().subVectors(origin, pos);
			seek.normalize();
			seek.multiplyScalar(params.force);
			acc.add(seek);
		}
		
		//Ball Collision
		for(var b of balls){
			if(b === this) continue;
			
			if(ballCollision(this, b)){
				var seek = new THREE.Vector3().subVectors(pos, b.el.object3D.position);
				seek.normalize();
				seek.multiplyScalar(params.force);
				acc.add(seek);
			}
		}
		
		this.vel.add(acc);
		this.vel.clampScalar(-params.maxSpeed, params.maxSpeed);
				
		this.el.setAttribute('position', {
			x: pos.x + this.vel.x,
			y: pos.y + this.vel.y,
			z: pos.z + this.vel.z
		});
	}
});

function ballCollision(A, B){
	var a = A.el.object3D.position;
	var b = B.el.object3D.position;
	var x = a.x - b.x;
	var y = a.y - b.y;
	var z = a.z - b.z;
	var r = A.el.getAttribute('radius') + B.el.getAttribute('radius');
	r = parseInt(r);
	return (x*x + y*y + z*z) < r*r;
}

const randomColour = function(){
  return 'rgb(' + (128 + Math.floor(Math.random()*127)) + ", " + (128 + Math.floor(Math.random()*127)) + ", " + (128 + Math.floor(Math.random()*127)) + ")";
}