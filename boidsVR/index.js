/*
boidsVR/index.js
Oliver Cass (c) 2020
All Rights Reserved
*/

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

	for(var i = 0; i < BoidsVR.params.numBoids; i++){
		var newBoid = document.createElement('a-cone');
		newBoid.setAttribute('radius-bottom', '0.4');
		newBoid.setAttribute('radius-top', '0');
		newBoid.setAttribute('height', '0.9');
		newBoid.setAttribute('color', randomColour());
		newBoid.setAttribute('boid', '');
		newBoid.object3D.position.set(Math.random()*BoidsVR.params.areaRad*2 - BoidsVR.params.areaRad, 2 + Math.random()*BoidsVR.params.areaRad, Math.random()*BoidsVR.params.areaRad*2 - BoidsVR.params.areaRad);
		newBoid.object3D.up = BoidsVR.up;
		scene.appendChild(newBoid);
	}
	
	BoidsVR.running = true;
}

const randomColour = function(){
	return 'rgb(' + (128 + Math.floor(Math.random()*127)) + ", " + (128 + Math.floor(Math.random()*127)) + ", " + (128 + Math.floor(Math.random()*127)) + ")";
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
				var newBoid = document.createElement('a-cone');
				newBoid.setAttribute('radius-bottom', '0.4');
				newBoid.setAttribute('radius-top', '0');
				newBoid.setAttribute('height', '0.9');
				newBoid.setAttribute('color', randomColour());
				newBoid.setAttribute('boid', '');
				newBoid.object3D.position.set(Math.random()*BoidsVR.params.areaRad*2 - BoidsVR.params.areaRad, 2 + Math.random()*BoidsVR.params.areaRad, Math.random()*BoidsVR.params.areaRad*2 - BoidsVR.params.areaRad);
				newBoid.object3D.up = BoidsVR.up;
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


function slider(e){
    if(document.getElementById(e.target.id + "_a")) document.getElementById(e.target.id + "_a").innerHTML = e.target.value / (e.target.getAttribute('scale')||1);
    BoidsVR.params[e.target.id] = e.target.value / (e.target.getAttribute('scale')||1);
    calculate();
}