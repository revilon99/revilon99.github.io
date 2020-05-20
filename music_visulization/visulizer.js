/*
visulizer.js
Oliver Cass (c) 2020
All Rights Reserved

Based on example from:
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
*/

var audioCtx, analyser, bufferLength, dataArray, source;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function start(){
	audioCtx = new AudioContext();

	var audio = document.getElementById('audio');
	var input = audioCtx.createMediaElementSource(audio);

	input.connect(audioCtx.destination);

	analyser = audioCtx.createAnalyser();

	input.connect(analyser);

	dataArray = new Uint8Array(analyser.fftSize);

	draw();
}

function draw(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);	
	analyser.getByteTimeDomainData(dataArray);
	
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#ff0000";
	ctx.beginPath();
	
	var sliceWidth = canvas.width * 1.0 / analyser.fftSize;
	var x = 0;
	
	for(var i = 0; i < analyser.fftSize; i++){
		var v = dataArray[i] / 128.0;
		var y = v * canvas.height/2;
		
		if(i === 0){
			ctx.moveTo(x, y);
		}else{
			ctx.lineTo(x, y);
		}
		
		x += sliceWidth;
	}
	
	ctx.lineTo(canvas.width, canvas.height/2);
	ctx.stroke();

	requestAnimationFrame(draw);
}

