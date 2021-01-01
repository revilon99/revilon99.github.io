/*
boidsVR/ocean-demo.js
Oliver Cass (c) 2020
All Rights Reserved
*/
var debug = 1;

window.onload = function(){
	document.getElementById('playpause').addEventListener('click', function(e){
		BoidsVR.running = !BoidsVR.running;
		if(BoidsVR.running) {
			e.target.classList.remove('paused');
			document.getElementById('darken').style.display = "none";
		}else{
			e.target.classList.add('paused');
			document.getElementById('darken').style.display = "initial";
		}
	}, false);
	
	var inputs = document.getElementsByClassName('slider');
    for(var i of inputs){
        if(document.getElementById(i.id + "_a")) document.getElementById(i.id + "_a").innerHTML = i.value / (i.getAttribute('scale')||1);
        i.addEventListener('input', slider, false);
        BoidsVR.params[i.id] = i.value / (i.getAttribute('scale')||1);
    }
	
	scene = document.getElementById('scene');
		
	calculate();
	
	for(var i = 0; i < debug*BoidsVR.params.areaRadSq/20; i++){
		var newRock = document.createElement('a-entity');
		newRock.setAttribute('gltf-model', randomRock());
		newRock.object3D.position.set(Math.random()*BoidsVR.params.areaRad*2 - BoidsVR.params.areaRad, -0.5, Math.random()*BoidsVR.params.areaRad*2 - BoidsVR.params.areaRad);
		newRock.object3D.rotateY(Math.random()*2*Math.PI);
		scene.appendChild(newRock);
	}
	
	for(var i = 0; i < debug*BoidsVR.params.areaRadSq*1.3; i++){
		var newCoral = document.createElement('a-entity');
		newCoral.setAttribute('gltf-model', randomCoral());
		newCoral.setAttribute('random-color', '');
		newCoral.object3D.position.set((Math.random()*BoidsVR.params.areaRad*2 - BoidsVR.params.areaRad), 0, (Math.random()*BoidsVR.params.areaRad*2 - BoidsVR.params.areaRad));
		newRock.object3D.rotateY(Math.random()*2*Math.PI);
		scene.appendChild(newCoral);
	}

	for(var i = 0; i < BoidsVR.params.numBoids; i++){
		var newBoid = document.createElement('a-entity');
		var newFish = randomFish();
		newBoid.setAttribute('gltf-model', newFish);
		newBoid.setAttribute('boid', newFish);
		if(newFish==="#Tuna") newBoid.setAttribute('scale', '1.5 1.5 1.5');
		newBoid.setAttribute('animation-mixer', 'timeScale: 2');
		newBoid.object3D.position.set(Math.random()*BoidsVR.params.areaRad*2 - BoidsVR.params.areaRad, 2 + Math.random()*BoidsVR.params.areaRad, Math.random()*BoidsVR.params.areaRad*2 - BoidsVR.params.areaRad);
		newBoid.object3D.up = BoidsVR.up;
		scene.appendChild(newBoid);
	}
	
	BoidsVR.setParameter('maxSpeed', '#Dory', 0.8);
	BoidsVR.setParameter('maxSpeed', '#ClownFish', 0.5);
	// predator-pray mechanics need work
	// BoidsVR.setParameter('predator', '#Tuna', ['#ClownFish']);
	// BoidsVR.setParameter('pray', '#ClownFish', ['#Tuna']);
	BoidsVR.setParameter('sepRadSq', '#Tuna', 70);
	
	BoidsVR.running = true;
}

function calculate(){
	BoidsVR.params.minRadSq = BoidsVR.params.minRad * BoidsVR.params.minRad;
	BoidsVR.params.sepRadSq = BoidsVR.params.sepRad * BoidsVR.params.sepRad;
	BoidsVR.params.aliRadSq = BoidsVR.params.aliRad * BoidsVR.params.aliRad;
	BoidsVR.params.cohRadSq = BoidsVR.params.cohRad * BoidsVR.params.cohRad;
	
	BoidsVR.params.searchRad = Math.max(BoidsVR.params.sepRad, BoidsVR.params.aliRad, BoidsVR.params.cohRad);
	BoidsVR.params.searchRadSq = BoidsVR.params.searchRad * BoidsVR.params.searchRad;
	
	BoidsVR.params.areaRadSq = BoidsVR.params.areaRad * BoidsVR.params.areaRad;
	
	if(BoidsVR.boids.length > 0 && BoidsVR.params.numBoids > 0){
		if(BoidsVR.params.numBoids > BoidsVR.boids.length){
			for(var i = 0; i < BoidsVR.params.numBoids - BoidsVR.boids.length; i++){
				var newBoid = document.createElement('a-entity');
				newBoid.setAttribute('gltf-model', randomFish());
				newBoid.setAttribute('boid', '');
				newBoid.object3D.position.set(Math.random()*BoidsVR.params.areaRad*2 - BoidsVR.params.areaRad, 2 + Math.random()*BoidsVR.params.areaRad, Math.random()*BoidsVR.params.areaRad*2 - BoidsVR.params.areaRad);
				newBoid.object3D.up = up;
				scene.appendChild(newBoid);
			}
		}else if(BoidsVR.params.numBoids < BoidsVR.boids.length){
			for(var i = BoidsVR.params.numBoids - 1; i < BoidsVR.boids.length; i++){
				try{
					BoidsVR.boids[i].el.parentNode.removeChild(BoidsVR.boids[i].el);
				}catch(e){}
			}
			BoidsVR.boids.splice(BoidsVR.params.numBoids - 1, BoidsVR.boids.length - BoidsVR.params.numBoids);
		}
	}
}

var running = false;

function slider(e){
    if(document.getElementById(e.target.id + "_a")) document.getElementById(e.target.id + "_a").innerHTML = e.target.value / (e.target.getAttribute('scale')||1);
    BoidsVR.params[e.target.id] = e.target.value / (e.target.getAttribute('scale')||1);
    calculate();
}

var fish = [
	'BrownFish',
	'BrownFish',
	'ClownFish',
	'ClownFish',
	'ClownFish',
	'ClownFish',
	'Dory',
	'Dory',
	'Dory',
	'Tuna'
];

function randomFish(){
	var r = Math.floor(Math.random()*fish.length);
	return '#' + fish[r];
}

function randomRock(){
	var r = Math.ceil(Math.random()*6);
	r = ('0' + r).slice(-2);
	return '#rock-' + r;
}

function randomCoral(){
	var r = Math.ceil(Math.random()*7);
	return '#coral-' + r;
}

AFRAME.registerComponent('random-color', {
	init: function () {
		// Wait for model to load.
		this.el.addEventListener('model-loaded', () => {
			// Grab the mesh / scene.
			const obj = this.el.getObject3D('mesh');
			obj.children[0].material.color.r = (80 + Math.floor(Math.random()*127))/255;
			obj.children[0].material.color.g = (80 + Math.floor(Math.random()*127))/255;
			obj.children[0].material.color.b = (80 + Math.floor(Math.random()*127))/255;
			
		});
	}
});