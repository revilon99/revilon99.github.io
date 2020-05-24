/*
visulizer.js
Oliver Cass (c) 2020
All Rights Reserved

Based on example from:
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
*/

var audioCtx, analyser, byteDataArray, freqDataArray, source;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function start(){
	audioCtx = new AudioContext();

	var audio = document.getElementById('audio');
	var input = audioCtx.createMediaElementSource(audio);

	input.connect(audioCtx.destination);

	analyser = audioCtx.createAnalyser();

	input.connect(analyser);

	byteDataArray = new Uint8Array(analyser.fftSize);
	freqDataArray = new Uint8Array(analyser.frequencyBinCount);

	draw();
}

function draw(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);	
	analyser.getByteTimeDomainData(byteDataArray);
	analyser.getByteFrequencyData(freqDataArray);
    
    var smooth;

	smooth = rollingAverage(byteDataArray, 400);	
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#ff0000";
	ctx.beginPath();
	var sliceWidth = canvas.width * 1.0 / smooth.length;
	var x = 0;
	
	for(var i = 0; i < smooth.length; i++){
		var v = smooth[i] / 128.0;
		var y = v * canvas.height/2;
		
		if(i === 0){
			ctx.moveTo(x, y);
		}else{
			ctx.lineTo(x, y);
		}
		
		x += sliceWidth;
	}
	ctx.stroke();

	smooth = rollingAverage(freqDataArray, 10);	
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#00ff00";
	ctx.beginPath();
	var sliceWidth = canvas.width * 1.0 / smooth.length;
	var x = 0;
	
	for(var i = 0; i < smooth.length; i++){
		var v = smooth[i] / (256);
		var y = v * canvas.height/2 + canvas.height/2;
		
		if(i === 0){
			ctx.moveTo(x, y);
		}else{
			ctx.lineTo(x, y);
		}
		
		x += sliceWidth;
	}
	ctx.stroke();

	requestAnimationFrame(draw);
}

function rollingAverage(data, n){
    var smooth = [];
    for(var i = 0; i < data.length; i++){
        var sum = 0;
        var count = 0;
        for(var j = i - Math.floor(n/2); j < i + Math.floor(n/2); j++){
            if(data[j]){
                sum += data[j];
                count++;
            }
        }
        if(count < 1) count = 1;
        smooth[i] = sum / count;
    }
    return smooth;
}