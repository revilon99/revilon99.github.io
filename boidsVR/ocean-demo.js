/*
boidsVR/ocean-demo.js
Oliver Cass (c) 2020
All Rights Reserved
*/
window.onload = function(){
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
	
	var inputs = document.getElementsByClassName('slider');
    for(var i of inputs){
        if(document.getElementById(i.id + "_a")) document.getElementById(i.id + "_a").innerHTML = i.value / (i.getAttribute('scale')||1);
        i.addEventListener('input', slider, false);
        params[i.id] = i.value / (i.getAttribute('scale')||1);
    }
	
	scene = document.getElementById('scene');
		
	calculate();
	
	for(var i = 0; i < params.areaRadSq/20; i++){
		var newRock = document.createElement('a-entity');
		newRock.setAttribute('gltf-model', randomRock());
		newRock.object3D.position.set(Math.random()*params.areaRad*2 - params.areaRad, -0.5, Math.random()*params.areaRad*2 - params.areaRad);
		scene.appendChild(newRock);
	}
	
	for(var i = 0; i < params.areaRadSq*1.3; i++){
		var newCoral = document.createElement('a-entity');
		newCoral.setAttribute('gltf-model', randomCoral());
		newCoral.setAttribute('random-color', '');
		newCoral.object3D.position.set((Math.random()*params.areaRad*2 - params.areaRad), 0, (Math.random()*params.areaRad*2 - params.areaRad));
		scene.appendChild(newCoral);
	}

	for(var i = 0; i < params.numBoids; i++){
		var newBoid = document.createElement('a-entity');
		var newFish = randomFish();
		newBoid.setAttribute('gltf-model', newFish);
		newBoid.setAttribute('boid', newFish);
		newBoid.setAttribute('animation-mixer', 'timeScale: 2');
		newBoid.object3D.position.set(Math.random()*params.areaRad*2 - params.areaRad, 2 + Math.random()*params.areaRad, Math.random()*params.areaRad*2 - params.areaRad);
		newBoid.object3D.up = up;
		scene.appendChild(newBoid);
	}
	
	running = true;
}

function calculate(){
	params.minRadSq = params.minRad * params.minRad;
	params.sepRadSq = params.sepRad * params.sepRad;
	params.aliRadSq = params.aliRad * params.aliRad;
	params.cohRadSq = params.cohRad * params.cohRad;
	
	params.searchRad = Math.max(params.sepRad, params.aliRad, params.cohRad);
	params.searchRadSq = params.searchRad * params.searchRad;
	
	params.areaRadSq = params.areaRad * params.areaRad;
	
	if(boids.length > 0 && params.numBoids > 0){
		if(params.numBoids > boids.length){
			for(var i = 0; i < params.numBoids - boids.length; i++){
				var newBoid = document.createElement('a-entity');
				newBoid.setAttribute('gltf-model', randomFish());
				newBoid.setAttribute('boid', '');
				newBoid.object3D.position.set(Math.random()*params.areaRad*2 - params.areaRad, 2 + Math.random()*params.areaRad, Math.random()*params.areaRad*2 - params.areaRad);
				newBoid.object3D.up = up;
				scene.appendChild(newBoid);
			}
		}else if(params.numBoids < boids.length){
			for(var i = params.numBoids - 1; i < boids.length; i++){
				try{
					boids[i].el.parentNode.removeChild(boids[i].el);
				}catch(e){}
			}
			boids.splice(params.numBoids - 1, boids.length - params.numBoids);
		}
	}
}

var running = false;

function slider(e){
    if(document.getElementById(e.target.id + "_a")) document.getElementById(e.target.id + "_a").innerHTML = e.target.value / (e.target.getAttribute('scale')||1);
    params[e.target.id] = e.target.value / (e.target.getAttribute('scale')||1);
    calculate();
}

var fish = [
	'BrownFish',
	'ClownFish',
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