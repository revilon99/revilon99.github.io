/*
musicVR.js
Oliver Cass (c) 2020
All Rights Reserved
*/

var scene;

var audioCtx, analyser, freqDataArray, smooth, source;

var params = {};
params.numBalls = 100;
params.deltaRad = 1;
params.minRadius = 0.2;
params.maxRadius = 2;
params.areaRad = 50;

var running = false;

window.onload = function(){
	document.getElementById('audio').onplay = function(){
		audioCtx = new AudioContext();
		var audio = document.getElementById('audio');
		var input = audioCtx.createMediaElementSource(audio);
		input.connect(audioCtx.destination);
		analyser = audioCtx.createAnalyser();
		input.connect(analyser);
		freqDataArray = new Uint8Array(analyser.frequencyBinCount);
		
		document.getElementById('intro').style.display = "none";
		running = true;
	}
}

AFRAME.registerComponent('music-scene', {
	init: function(){
		scene = this.el;
	
		for(var i = 0; i < params.numBalls; i++){
			var newBall = document.createElement('a-sphere');
			newBall.setAttribute('radius', Math.random()*(params.maxRadius - params.minRadius) + params.minRadius);
			newBall.setAttribute('music', '');
			newBall.object3D.position.set(Math.random()*params.areaRad*2 - params.areaRad, Math.random()*params.areaRad*2 - params.areaRad, Math.random()*params.areaRad*2 - params.areaRad);
			scene.appendChild(newBall);
		}
	},
	tick: function(){
		if(!running) return;
		
		analyser.getByteFrequencyData(freqDataArray); 
		smooth = rollingAverage(freqDataArray, 100);	
	}
});

AFRAME.registerComponent('music', {
	schema: {
		type: 'number',
		default: -1
	},
	init: function(){
		if(isNaN(this.data) || this.data < 0) this.data = Math.random();
		this.el.setAttribute('color', colour(this.data));
		
		this.radius = this.el.getAttribute('radius');
	},
	
	tick: function(time, timeDelta){
		if(!running) return;
		
		var dRad = params.deltaRad*(smooth[Math.floor(this.data*smooth.length)]/255);
		this.el.object3D.scale.x = 1 + dRad;
		this.el.object3D.scale.y = 1 + dRad;
		this.el.object3D.scale.z = 1 + dRad;
	}
});

function colour(i){
    var r = Math.sin(4*i);
    var g = Math.sin(6*i);
    var b = Math.cos(3*i);

    r = (1.3*r*r)*127 + 100;
    g = (g*g)*127 + 100;
    b = (b*b)*127 + 100;
	
	r = Math.floor(r);
	g = Math.floor(g);
	b = Math.floor(b);

    return `rgb(${r}, ${g}, ${b})`;
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