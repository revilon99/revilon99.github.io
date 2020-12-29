/*
boidsVR.js
Oliver Cass (c) 2020
All Rights Reserved
*/

var boids = {}; //boids elements (will be filled with arrays)

var scene; //scene element (needs to be defined in page script)

var up = new THREE.Vector3(0, 1, 0); //y is up
var cameraPos = new THREE.Vector3(0, 1.8, 0); //avg height of person (should be defined by camera)

//game state variables
var self_seek = false;
var running = false;

//temp global variables to reduce garbage collection
var steer = new THREE.Vector3();
var diff = new THREE.Vector3();

var params = {}; //parameters object
params = { //default values - incase not loaded by index.html
	numBoids: 600.0,
	areaRad :  40.0,
	sepFac  :  70.0,	   aliFac:   1.5,	cohFac: 0.3,
	bouFac  :   1.0,	attackFac:   1.0,
	maxSpeed:   0.3,	 maxForce: 0.004,
	minRad  :   3.2,	   sepRad:   1.5,
	aliRad  :   3.7,	   cohRad:   6.5,
	
	minRadSq: 0.3*0.3,
	sepRadSq: 1.5*1.5,
	aliRadSq: 3.7*3.7,
	cohRadSq: 6.5*6.5
}

//boid property - can be added to any <a-entity>
AFRAME.registerComponent('boid', {
	schema: {type: 'string', default: 'default'},
	
	init: function() {		
		this.vel = new THREE.Vector3(Math.random()*params.maxSpeed*2 - params.maxSpeed, Math.random()*params.maxSpeed*2 - params.maxSpeed, Math.random()*params.maxSpeed*2 - params.maxSpeed);
		this.acc = new THREE.Vector3();
		
		this.seperation = new THREE.Vector3();
		this.alignment = new THREE.Vector3();
		this.cohesion = new THREE.Vector3();
		this.boundary = new THREE.Vector3();
		this.attack = new THREE.Vector3();
		this.localBoids = [];
		
		if(boids[this.data] == undefined) boids[this.data] = [];
		
		boids[this.data].push(this);
	},
	
	tick: function(time, timeDelta){
		if(!running) return;
		if(boids[this.data].indexOf(this) === 0) calculateLocalBoids();
		
		seperation(this);
		alignment(this);
		cohesion(this);
		boundary(this);
		
		if(self_seek) seek(this, cameraPos, this.attack);
		else this.attack.multiplyScalar(0);
		
		this.seperation.multiplyScalar(params.sepFac);
		this.alignment.multiplyScalar(params.aliFac);
		this.cohesion.multiplyScalar(params.cohFac);
		this.boundary.multiplyScalar(params.bouFac);
		this.attack.multiplyScalar(params.attackFac);
		
		this.acc.add(this.seperation);
		this.acc.add(this.alignment);
		this.acc.add(this.cohesion);
		this.acc.add(this.boundary);
		this.acc.add(this.attack);
		
		this.vel.add(this.acc);
		this.vel.clampScalar(-params.maxSpeed, params.maxSpeed);
		
		if(this.el.object3D.position.y < 2 && this.vel.y < 0) this.vel.y = this.vel.y / ((3 - this.el.object3D.position.y));
		
		this.acc.multiplyScalar(0);
		
		this.el.object3D.lookAt(this.el.object3D.position.x + this.vel.x, this.el.object3D.position.y + this.vel.y, this.el.object3D.position.z + this.vel.z);
		this.el.object3D.rotateX(Math.PI / 2);
		
		this.el.setAttribute('position', {
			x: this.el.object3D.position.x + this.vel.x,
			y: this.el.object3D.position.y + this.vel.y,
			z: this.el.object3D.position.z + this.vel.z
		});
		
		this.localBoids = [];
	}
});

AFRAME.registerComponent('cursor-listener', {
	init: function () {
		this.el.addEventListener('click', attack);
	}
});

function calculateLocalBoids(){
	for(var boidsArray in boids){
		for(var i = 0; i < boids[boidsArray].length; i++){
			for(var j = i + 1; j < boids[boidsArray].length; j++){
				if(boids[boidsArray][i].el.object3D.position.distanceToSquared(boids[boidsArray][j].el.object3D.position) < params.searchRadSq){
					boids[boidsArray][i].localBoids.push(boids[boidsArray][j]);
					boids[boidsArray][j].localBoids.push(boids[boidsArray][i]);
				}
			}
		}
	}
}

function seperation(boid){
	boid.seperation.set(0, 0, 0);

	var count = 0;
	for(var b of boid.localBoids){
		var dist = boid.el.object3D.position.distanceToSquared(b.el.object3D.position);
		if(dist < params.sepRadSq){
			diff.subVectors(boid.el.object3D.position, b.el.object3D.position); //always resets global vec anyway
			diff.normalize();
			diff.divideScalar(dist);
			boid.seperation.add(diff);
			count++;
		}
	}

	if(count > 0) boid.seperation.divide(count);
	
	if(boid.seperation.length() > 0){
		boid.seperation.normalize();
		boid.seperation.multiplyScalar(params.maxSpeed);
		boid.seperation.sub(boid.vel);
		boid.seperation.clampScalar(-params.maxForce, params.maxForce);
	}else boid.seperation.set(0, 0, 0)
}

function alignment(boid){
	boid.alignment.set(0, 0, 0);
  
	var count = 0;
	for(var b of boid.localBoids){
		var dist = boid.el.object3D.position.distanceToSquared(b.el.object3D.position);
		if(dist < params.aliRadSq && dist > params.minRadSq){
			boid.alignment.add(b.vel);
			count++;
		}
	}

	if(count > 0){
		boid.alignment.divideScalar(count);
		boid.alignment.normalize();
		boid.alignment.multiplyScalar(params.maxSpeed);
		boid.alignment.sub(boid.vel);
		boid.alignment.clampScalar(-params.maxForce, params.maxForce);
	}
}

function cohesion(boid){
	steer.set(0, 0, 0); //set global steer variable to 0 (actually target..)
  
	var count = 0;
	for(var b of boid.localBoids){
		var dist = boid.el.object3D.position.distanceToSquared(b.el.object3D.position);
		if(dist < params.cohRadSq && dist > params.minRadSq){
			steer.add(b.el.object3D.position);
			count++;
		}
	}

	if(count > 0){
		steer.divideScalar(count);
		seek(boid, steer, boid.cohesion);
		return;
	}
	boid.cohesion.copy(steer);
}

function boundary(boid){
	steer.set(0, 0, 0) //set global steer variable to 0
	
	var loc = boid.el.object3D.position;
	
	if(loc.y < 7) steer.y = 10 - loc.y;
	if(loc.lengthSq() > 2*params.areaRadSq) steer.sub(loc);
	steer.normalize();
	steer.multiplyScalar(params.maxSpeed);
	steer.clampScalar(-params.maxForce, params.maxForce);
	boid.boundary.copy(steer);
}

function seek(boid, target, returnVec){
	returnVec.subVectors(target, boid.el.object3D.position);
	returnVec.normalize();
	returnVec.multiplyScalar(params.maxSpeed);
	returnVec.sub(boid.vel);
	returnVec.clampScalar(-params.maxForce, params.maxForce);
}

function attack(){
	self_seek = true;
	params.cohFac = 0;
	params.aliFac = 0;
	setTimeout(function(){ self_seek = false; }, 3000);
	setTimeout(function(){  
		params.cohFac = document.getElementById('cohFac').value/document.getElementById('cohFac').getAttribute('scale');
		params.aliFac = document.getElementById('aliFac').value/document.getElementById('aliFac').getAttribute('scale');
	}, 12000);
}