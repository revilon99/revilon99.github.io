/*
music-color-sync.js
Oliver Cass (c) 2020
ALl Rights Reserved
*/


var audioCtx, analyser, freqDataArray, smooth, source;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var MAX_RADIUS = 40;
var MIN_RADIUS = 20;
var DELTA_RAD  = 30; 
var NUM_BALLS  = 20;

var balls = [];

var Ball = function(x, y){
    this.x = x;
    this.y = y;
    this.colour = Math.random();
    this.radius = Math.random()*(MAX_RADIUS - MIN_RADIUS) + MIN_RADIUS;

    this.render = function(){
        var d_rad = DELTA_RAD*(smooth[Math.floor(this.colour*smooth.length)]/255)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + d_rad, 0, 2 * Math.PI, false);
        ctx.fillStyle = colour(this.colour);
        ctx.fill();
        ctx.closePath();
    }
}

function start(){
	audioCtx = new AudioContext();

	var audio = document.getElementById('audio');
	var input = audioCtx.createMediaElementSource(audio);

	input.connect(audioCtx.destination);

	analyser = audioCtx.createAnalyser();

	input.connect(analyser);

	freqDataArray = new Uint8Array(analyser.frequencyBinCount);

	for(var i = 0; i < NUM_BALLS; i++) balls.push(new Ball(50 + Math.random()*(canvas.width - 100), 50 + Math.random()*(canvas.height - 100)));

	draw();
}

function draw(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);	
	analyser.getByteFrequencyData(freqDataArray);
    
    smooth = rollingAverage(freqDataArray, 100);	

    //Draw Frequency Line
	var sliceWidth = canvas.width * 1.0 / smooth.length;
	var x = 0;
	
	for(var i = 0; i < smooth.length; i++){
		var v = smooth[i] / (255.0);
		var y = v * (canvas.height/2);

		ctx.fillStyle = colour(i / smooth.length);
	    ctx.fillRect(x, canvas.height - 10, sliceWidth, -y);
		
		x += sliceWidth;
	}

	//Draw Balls
	for(var b of balls){
	    b.render();
	}

	requestAnimationFrame(draw);
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
    var r = Math.sin(4*i);
    var g = Math.sin(6*i);
    var b = Math.cos(3*i);

    r = (1.3*r*r)*127 + 100;
    g = (g*g)*127 + 100;
    b = (b*b)*127 + 100;

    return `rgb(${r}, ${g}, ${b})`;
}