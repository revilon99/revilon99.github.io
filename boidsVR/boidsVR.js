/*
boidsVR.js
Oliver Cass (c) 2020-2021
All Rights Reserved
*/

var BoidsVR = new (function(){
	this.boids = {}; //boids elements (will be filled with arrays)
	this.obstacles = [];
	
	this.scene; //scene element (needs to be defined in page script onload function)
	
	this.up = new THREE.Vector3(0, 1, 0); //y is up
	this.cameraPos = new THREE.Vector3(0, 1.8, 0); //avg height of person (should be defined by camera)
	
	//game state variables
	this.running = false;
	this.self_seek = false;
	this.seperationGlobal = true;
	this.alignmentGlobal = true;
	this.cohesionGlobal = true;
	
	//temp global variables to reduce garbage collection
	this.steer = new THREE.Vector3();
	this.diff = new THREE.Vector3();
	this.ahead = new THREE.Vector3();
	this.ahead2 = new THREE.Vector3();
	
	this.params = { //default values - incase not loaded by index.html
		numBoids: 600.0,
		areaRad :  40.0,
		sepFac  :  70.0,	   aliFac:   1.5,	cohFac: 0.3,
		bouFac  :   1.0,	attackFac:   1.0,	avoFac: 3.0,
		maxSpeed:   0.3,	 maxForce: 0.004,
		minRad  :   3.2,	   sepRad:   1.5,	aliRad  :   3.7,
		cohRad  :   6.5,	   seeRad:   7.0,
		
		minRadSq: 0.3*0.3,
		sepRadSq: 1.5*1.5,
		aliRadSq: 3.7*3.7,
		cohRadSq: 6.5*6.5,
		types   : {} // specific properties of types of boids, must have same object name as boids elements
	};
	
	this.calculateLocalBoids = function(boidsArray){
		for(var i = 0; i < this.boids[boidsArray].length; i++){
			for(var j = i + 1; j < this.boids[boidsArray].length; j++){
				if(this.boids[boidsArray][i].el.object3D.position.distanceToSquared(this.boids[boidsArray][j].el.object3D.position) < this.getParameter('searchRadSq', boidsArray)){
					this.boids[boidsArray][i].localBoids.push(this.boids[boidsArray][j]);
					this.boids[boidsArray][j].localBoids.push(this.boids[boidsArray][i]);
				}
			}
		}
	}

	this.seperation = function(boid){
		boid.seperation.set(0, 0, 0);

		var count = 0;
		for(var b of boid.localBoids){
			var dist = boid.el.object3D.position.distanceToSquared(b.el.object3D.position);
			if(dist < this.getParameter('sepRadSq', boid.data)){
				this.diff.subVectors(boid.el.object3D.position, b.el.object3D.position); //always resets global vec anyway
				this.diff.normalize();
				this.diff.divideScalar(dist);
				boid.seperation.add(this.diff);
				count++;
			}
		}

		if(count > 0) boid.seperation.divide(count);
		
		if(boid.seperation.length() > 0){
			boid.seperation.normalize();
			boid.seperation.multiplyScalar(this.getParameter('maxSpeed', boid.data));
			boid.seperation.sub(boid.vel);
			boid.seperation.clampScalar(-this.getParameter('maxForce', boid.data), this.getParameter('maxForce', boid.data));
		}else boid.seperation.set(0, 0, 0)
	}

	this.alignment = function(boid){
		boid.alignment.set(0, 0, 0);
	  
		var count = 0;
		for(var b of boid.localBoids){
			var dist = boid.el.object3D.position.distanceToSquared(b.el.object3D.position);
			if(dist < this.getParameter('aliRadSq', boid.data) && dist > this.getParameter('minRadSq', boid.data)){
				boid.alignment.add(b.vel);
				count++;
			}
		}

		if(count > 0){
			boid.alignment.divideScalar(count);
			boid.alignment.normalize();
			boid.alignment.multiplyScalar(this.getParameter('maxSpeed', boid.data));
			boid.alignment.sub(boid.vel);
			boid.alignment.clampScalar(-this.getParameter('maxForce', boid.data), this.getParameter('maxForce', boid.data));
		}
	}

	this.cohesion = function(boid){
		this.steer.set(0, 0, 0); //set global this.steer variable to 0 (actually target..)
	  
		var count = 0;
		for(var b of boid.localBoids){
			var dist = boid.el.object3D.position.distanceToSquared(b.el.object3D.position);
			if(dist < this.getParameter('cohRadSq', boid.data) && dist > this.getParameter('minRadSq', boid.data)){
				this.steer.add(b.el.object3D.position);
				count++;
			}
		}

		if(count > 0){
			this.steer.divideScalar(count);
			this.seek(boid, this.steer, boid.cohesion);
			return;
		}
		boid.cohesion.copy(this.steer);
	}

	this.boundary = function(boid){ // Need to make more flexible
		this.steer.set(0, 0, 0) //set global this.steer variable to 0
		
		var loc = boid.el.object3D.position;
		
		if(loc.y < 7) this.steer.y = 10 - loc.y;
		if(loc.lengthSq() > 2*this.getParameter('areaRadSq', boid.data)) this.steer.sub(loc);
		this.steer.normalize();
		this.steer.multiplyScalar(this.getParameter('maxSpeed', boid.data));
		this.steer.clampScalar(-this.getParameter('maxForce', boid.data), this.getParameter('maxForce', boid.data));
		boid.boundary.copy(this.steer);
	}

	this.avoidance = function(boid){
		if(this.obstacles.length < 1) return; //nothing to avoid
		
		this.steer.copy(boid.vel);
		this.steer.multiplyScalar(this.getParameter('seeRad', boid.data));
		this.ahead.addVectors(this.steer, boid.el.object3D.position);
		
		this.steer.multiplyScalar(0.5);
		this.ahead2.addVectors(this.steer, boid.el.object3D.position);
		
		for(var obstacle of this.obstacles){
			if(Collision.checkCollision(this.ahead, obstacle) || Collision.checkCollision(this.ahead2, obstacle)){
				this.steer.copy(obstacle.el.object3D.position);			
				switch(obstacle.data.shape){
					case 'cylinder':
						this.steer.y = boid.el.object3D.position.y;
				}
				
				boid.avoidance.subVectors(this.ahead, this.steer);
				boid.avoidance.normalize();
				boid.avoidance.clampScalar(-this.getParameter('maxForce', boid.data), this.getParameter('maxForce', boid.data));
				return;
			}
		}
		
		boid.avoidance.set(0, 0, 0);
	}

	this.seek = function(boid, target, returnVec){
		returnVec.subVectors(target, boid.el.object3D.position);
		returnVec.normalize();
		returnVec.multiplyScalar(this.getParameter('maxSpeed', boid.data));
		returnVec.sub(boid.vel);
		returnVec.clampScalar(-this.getParameter('maxForce', boid.data), this.getParameter('maxForce', boid.data));
	}

	this.attack = function(){
		this.self_seek = true;
		this.alignmentGlobal = false;
		this.cohesionGlobal  = false;
		setTimeout(function(){ this.self_seek = false; }, 3000);
		setTimeout(function(){ this.this.stopFlocking();   }, 12000);
	}

	this.getParameter = function(param, type){ //object name of type (string), parameter name (string)
		if(this.params.types[type] != undefined && this.params.types[type][param] != undefined) return this.params.types[type][param]
		return this.params[param];
	}
	this.setParameter = function(param, type, value){
		if(this.params.types[type] == undefined) this.params.types[type] = {};
		this.params.types[type][param] = value;
	}

	this.startFlocking = function(){
		this.seperationGlobal = true;
		this.alignmentGlobal  = true;
		this.cohesionGlobal   = true;
	}
	this.stopFlocking = function(){
		this.seperationGlobal = false;
		this.alignmentGlobal  = false;
		this.cohesionGlobal   = false;
	}

});

const Collision = new (function(){
	steer = new THREE.Vector3();
	
	this.checkCollision = function(point, obstacle){
		switch(obstacle.data.shape){
			case 'cylinder':
				return this.cylinderCheck(point, obstacle);
			case 'sphere':
				return this.sphereCheck(point, obstacle);
			default:
				return false;
		}
	}

	this.cylinderCheck = function(point, obstacle){
		var distSq_xz = (point.x - obstacle.el.object3D.position.x)*(point.x - obstacle.el.object3D.position.x) + (point.z - obstacle.el.object3D.position.z)*(point.z - obstacle.el.object3D.position.z);
		if(distSq_xz < ((obstacle.data.radius + obstacle.data.clearance)*(obstacle.data.radius + obstacle.data.clearance))){
			if(point.y > obstacle.el.object3D.position.y - obstacle.data.height/2 && 
			   point.y < obstacle.el.object3D.position.y + obstacle.data.height/2) return true;
		}
		
		return false;
	}

	this.sphereCheck = function(point, obstacle){
		steer.subVectors(point, obstacle.el.object3D.position);
		var distSq = steer.lengthSq();
		
		if(distSq < (obstacle.data.radius + obstacle.data.clearance)*(obstacle.data.radius + obstacle.data.clearance)) return true;
		return false;
		
	}
});


//boid property - can be added to any <a-entity>
AFRAME.registerComponent('boid', {
	schema: {type: 'string', default: 'default'},
	
	init: function() {		
		this.vel = new THREE.Vector3(Math.random()*BoidsVR.getParameter('maxSpeed', this.data)*2 - BoidsVR.getParameter('maxSpeed', this.data), Math.random()*BoidsVR.getParameter('maxSpeed', this.data)*2 - BoidsVR.getParameter('maxSpeed', this.data), Math.random()*BoidsVR.getParameter('maxSpeed', this.data)*2 - BoidsVR.getParameter('maxSpeed', this.data));
		this.acc = new THREE.Vector3();
		
		this.seperation = new THREE.Vector3();
		this.alignment = new THREE.Vector3();
		this.cohesion = new THREE.Vector3();
		this.avoidance = new THREE.Vector3();
		this.boundary = new THREE.Vector3();
		this.attack = new THREE.Vector3();
		this.localBoids = [];
		
		if(BoidsVR.boids[this.data] == undefined) BoidsVR.boids[this.data] = [];
		
		BoidsVR.boids[this.data].push(this);
	},
	
	tick: function(time, timeDelta){
		if(!BoidsVR.running) return;
		if(BoidsVR.boids[this.data].indexOf(this) === 0 && !(!BoidsVR.seperationGlobal && !alignmentGlobal && !cohesionGlobal)) BoidsVR.calculateLocalBoids(this.data);
		
		if(BoidsVR.seperationGlobal) BoidsVR.seperation(this);
		if(BoidsVR.alignmentGlobal)  BoidsVR.alignment(this);
		if(BoidsVR.cohesionGlobal)   BoidsVR.cohesion(this);
		BoidsVR.boundary(this);
		BoidsVR.avoidance(this);
		
		if(BoidsVR.self_seek) BoidsVR.seek(this, cameraPos, this.attack);
		else this.attack.multiplyScalar(0);
		
		
		this.seperation.multiplyScalar(BoidsVR.getParameter('sepFac', this.data));
		this.alignment.multiplyScalar(BoidsVR.getParameter('aliFac', this.data));
		this.cohesion.multiplyScalar(BoidsVR.getParameter('cohFac', this.data));
		this.boundary.multiplyScalar(BoidsVR.getParameter('bouFac', this.data));
		this.attack.multiplyScalar(BoidsVR.getParameter('attackFac', this.data));
		this.avoidance.multiplyScalar(BoidsVR.getParameter('avoFac', this.data));
		
		if(BoidsVR.seperationGlobal) this.acc.add(this.seperation);
		if(BoidsVR.alignmentGlobal) this.acc.add(this.alignment);
		if(BoidsVR.cohesionGlobal) this.acc.add(this.cohesion);
		this.acc.add(this.boundary);
		this.acc.add(this.attack);
		this.acc.add(this.avoidance);
		
		this.vel.add(this.acc);
		this.vel.clampScalar(-BoidsVR.getParameter('maxSpeed', this.data), BoidsVR.getParameter('maxSpeed', this.data));
		
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

AFRAME.registerComponent('boid-obstacle', {
	schema: {
		shape: 		{type: 'string', default: 'sphere'},
		clearance: 	{type: 'number', default: 0.5},
		radius:		{type: 'number', default: 1.0},
		height:		{type: 'number', default: 1.0}
	},
	
	init: function () {
		if(this.el.getAttribute('radius')) this.data.radius = this.el.getAttribute('radius')*1.0;
		if(this.el.getAttribute('height')) this.data.height = this.el.getAttribute('height')*1.0;
		BoidsVR.obstacles.push(this);
	}
});