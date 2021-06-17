/*
ants.js
NatureJS
Oliver Cass (c) 2020
All Rights Reserved

https://en.wikipedia.org/wiki/Trail_pheromone
*/

var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');

var graph = null;
var ants = [];
var collectedFood = 0;
var food = [];
var pheromones = [];
var terrain;
var camera = {
	x: 0,
	y: 0,
	zoom: 2.65,
	sensitivity: 0.01
}
var timeElapsed = 0;

var param = {
	minNodes: 800,
	maxNodes: 1200,
	minRadius: 0.001,
	margin: 0.125,
	numClosedLoops: 20,
	minAngle: 15,
	nodeRadius: 2,
	numAnts: 100,
	antOffset: 0.5,
	antRadius: 1,
	antSpeed: 1,
	gameSpeed: 1,
	initFood: 1000,
	debug: true,
	render: true,
	resolution: 1080
}

function init(){
	graph = null;
	ants = [];
	collectedFood = 0;
	food = [];
	pheromones = [];
	timeElapsed = 0;

	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	if(canvas.height > param.resolution) {
		canvas.width = param.resolution;
		canvas.height = param.resolution * (canvas.clientHeight/canvas.clientWidth);
	}

	console.log('Generating Graph...');
	graph = new Graph();
	graph.generate(param.minNodes, param.maxNodes, param.minRadius, param.margin, param.numClosedLoops, param.minAngle);
	for(var i = 0; i < graph.nodes.length; i++){
		if(graph.getDirectConnectedNodes(i).length < 2) food.push(new Food(i));
	}
	for(var i = 0; i < graph.edges.length; i++) pheromones[i] = 0;
	console.log('Graph Generated');

	camera.x = graph.nodes[0].x - 0.125;
	camera.y = graph.nodes[0].y - 0.125;

	requestAnimationFrame(tick);
}

function tick(){
	requestAnimationFrame(tick);

	if(ants.length < param.numAnts) ants.push(new Ant());
	if(ants.length > param.numAnts) ants.splice(param.numAnts - 1, ants.length - param.numAnts);

	if(keys[87]) camera.y -= camera.sensitivity/camera.zoom; //w
	if(keys[65]) camera.x -= camera.sensitivity/camera.zoom; //a
	if(keys[83]) camera.y += camera.sensitivity/camera.zoom; //s
	if(keys[68]) camera.x += camera.sensitivity/camera.zoom; //d

	if(camera.x > 1 - (1/camera.zoom)) camera.x = 1 - (1/camera.zoom);
	if(camera.x < 0) camera.x = 0;
	if(camera.y < 0) camera.y = 0;
	if(camera.y > 1 - (1/camera.zoom)) camera.y = 1 - (1/camera.zoom);


	if(keys[69]){
		camera.zoom *= 1 + 2.5*camera.sensitivity;
		camera.x += 2.5*camera.sensitivity/(2*camera.zoom);
		camera.y += 2.5*camera.sensitivity/(2*camera.zoom);
	}
	if(keys[81]){
		if(camera.zoom > 1) {
			camera.zoom /= 1 + 2.5*camera.sensitivity;
			camera.x -= 2.5*camera.sensitivity/(2*camera.zoom);
			camera.y -= 2.5*camera.sensitivity/(2*camera.zoom);
		}
	}

	for(var t = 0; t < param.gameSpeed; t++) {
		for(var a of ants) a.tick();
		for(var i = 0; i < pheromones.length; i++) {
			if(pheromones[i] < 5) pheromones[i] = 0;
			else if(pheromones[i] > 0) pheromones[i] -= pheromones[i]/(200*param.antSpeed);
		}
		timeElapsed++;
		var seconds = Math.floor(timeElapsed / 60); //assume roughly 60 frames per second
		var minutes = Math.floor(seconds / 60);
		var hours = Math.floor(minutes / 60);
		var sec = seconds % 60;
		if(sec < 10) sec = "0" + sec;
		var min = minutes % 60;
		if(min < 10) min = "0" + min;
		if(hours < 10) hours = "0" + hours;

	}
	render();
}

function render(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if(param.render){
		ctx.fillStyle = '#47b009';
		ctx.fillRect(0, 0, canvas.width, canvas.height);


		ctx.lineWidth = (param.antOffset*2 + 4)*camera.zoom;
		for(var e of graph.edges){
			if((graph.nodes[e[0]].x - camera.x) < 0 && (graph.nodes[e[1]].x - camera.x) < 0) continue;
			if((graph.nodes[e[0]].y - camera.y) < 0 && (graph.nodes[e[1]].y - camera.y) < 0) continue;
			if((graph.nodes[e[0]].x - camera.x)*camera.zoom > 1 && (graph.nodes[e[1]].x - camera.x)*camera.zoom > 1) continue;
			if((graph.nodes[e[0]].y - camera.y)*camera.zoom > 1 && (graph.nodes[e[1]].y - camera.y)*camera.zoom > 1) continue;

			ctx.strokeStyle = "#472a0e";
			ctx.beginPath();

			ctx.moveTo(camera.zoom*(graph.nodes[e[0]].x - camera.x)*canvas.width, camera.zoom*(graph.nodes[e[0]].y - camera.y)*canvas.height);
			ctx.lineTo(camera.zoom*(graph.nodes[e[1]].x - camera.x)*canvas.width, camera.zoom*(graph.nodes[e[1]].y - camera.y)*canvas.height);
			ctx.stroke();
			ctx.closePath();
		}


		for(var n of graph.nodes){
			if((n.x - camera.x) < 0 && (n.y - camera.y) < 0) continue;
			if((n.x - camera.x)*camera.zoom > 1 && (n.y - camera.y)*camera.zoom > 1) continue;

			ctx.fillStyle = '#472a0e';
			ctx.beginPath();
			ctx.moveTo(camera.zoom*(n.x - camera.x) * canvas.width, camera.zoom*(n.y - camera.y) * canvas.height);
			ctx.arc(camera.zoom*(n.x - camera.x) * canvas.width, camera.zoom*(n.y - camera.y) * canvas.height, (param.antOffset + 2)*camera.zoom, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.closePath();
		}
	}


	//draw paths
	ctx.lineWidth = 1;
	for(var i = 0; i < graph.edges.length && param.debug; i++){
		if(pheromones[i] == 0) continue;
		var p = pheromones[i] / (80*Math.sqrt(graph.nodeDistSq(graph.nodes[graph.edges[i][0]], graph.nodes[graph.edges[i][1]])));
		ctx.strokeStyle = `rgb(${p}, ${p - 256}, ${p - 512})`;
		ctx.beginPath();
		ctx.moveTo(camera.zoom*(graph.nodes[graph.edges[i][0]].x-camera.x)*canvas.width, camera.zoom*(graph.nodes[graph.edges[i][0]].y-camera.y)*canvas.height);
		ctx.lineTo(camera.zoom*(graph.nodes[graph.edges[i][1]].x-camera.x)*canvas.width, camera.zoom*(graph.nodes[graph.edges[i][1]].y-camera.y)*canvas.height);
		ctx.stroke();
		ctx.closePath();
	}

	//draw base
	ctx.fillStyle = "#0000ff";
	ctx.fillRect(camera.zoom*(graph.nodes[0].x-camera.x) * canvas.width - param.nodeRadius*camera.zoom, camera.zoom*(graph.nodes[0].y - camera.y)* canvas.height - param.nodeRadius*camera.zoom, param.nodeRadius*2*camera.zoom, param.nodeRadius*2*camera.zoom);

	//draw other base
	ctx.fillStyle = "#ff0000";
	ctx.fillRect(camera.zoom*(graph.nodes[graph.nodes.length - 1].x-camera.x) * canvas.width - param.nodeRadius*camera.zoom, camera.zoom*(graph.nodes[graph.nodes.length - 1].y - camera.y)* canvas.height - param.nodeRadius*camera.zoom, param.nodeRadius*2*camera.zoom, param.nodeRadius*2*camera.zoom);

	//draw food sources
	for(var f of food){
		if((graph.nodes[f.node].x - camera.x) < 0 && (graph.nodes[f.node].y - camera.y) < 0) continue;
		if((graph.nodes[f.node].x - camera.x)*camera.zoom > 1 && (graph.nodes[f.node].y - camera.y)*camera.zoom > 1) continue;

		ctx.fillStyle = '#b8473e';
		ctx.beginPath();
		ctx.moveTo(camera.zoom*(graph.nodes[f.node].x - camera.x) * canvas.width, camera.zoom*(graph.nodes[f.node].y - camera.y)* canvas.height);
		ctx.arc(camera.zoom*(graph.nodes[f.node].x - camera.x) * canvas.width, camera.zoom*(graph.nodes[f.node].y - camera.y) * canvas.height, param.nodeRadius*camera.zoom, 0, 2*Math.PI, false);
		ctx.fill();
		ctx.closePath();

		ctx.fillStyle = '#ff7d00';
		ctx.beginPath();
		ctx.moveTo(camera.zoom*(graph.nodes[f.node].x - camera.x) * canvas.width, camera.zoom*(graph.nodes[f.node].y - camera.y)* canvas.height);
		ctx.arc(camera.zoom*(graph.nodes[f.node].x - camera.x) * canvas.width, camera.zoom*(graph.nodes[f.node].y - camera.y) * canvas.height, param.nodeRadius*camera.zoom, 1.5*Math.PI - 2*Math.PI*(f.amount/param.initFood), 1.5*Math.PI, false);
		ctx.fill();
		ctx.closePath();
	}

	//draw ants
	for(var a of ants){
		if((a.x - camera.x) < 0 && (a.y - camera.y) < 0) continue;
		if((a.x - camera.x)*camera.zoom > 1 && (a.y - camera.y)*camera.zoom > 1) continue;

		ctx.fillStyle = a.color();
		ctx.beginPath();
		ctx.moveTo(camera.zoom*(a.x - camera.x) * canvas.width + a.offset.x*camera.zoom, camera.zoom*(a.y - camera.y) * canvas.height + a.offset.y*camera.zoom);
		ctx.arc(camera.zoom*(a.x - camera.x) * canvas.width + a.offset.x*camera.zoom, camera.zoom*(a.y - camera.y) * canvas.height + a.offset.y*camera.zoom, param.antRadius*camera.zoom, 0, 2*Math.PI, false);
		ctx.fill();
		ctx.closePath();
	}
}

window.onresize = function(){
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	if(canvas.width > param.resolution) {
		canvas.width = param.resolution;
		canvas.height = param.resolution * (canvas.clientHeight/canvas.clientWidth);
	}
}

const Food = function(node){
	this.node = node;
	this.amount = param.initFood;
}

var keys = [];
window.addEventListener("keydown", function(e){ //activated when the key is down
	keys[e.keyCode] = true; //Tells keys["whatever you press"] is pressed
}, false);
window.addEventListener("keyup", function(e){ //Activated when a key is released
	delete keys[e.keyCode]; //tells keys["whatever you released"] isn't pressed
}, false);
canvas.addEventListener("mousewheel", function(e){
	var delta = e.deltaY;
	if(delta > 0){
		camera.zoom *= 1 +  delta/4*camera.sensitivity;
		camera.x += delta/4*camera.sensitivity/(2*camera.zoom);
		camera.y += delta/4*camera.sensitivity/(2*camera.zoom);
	}else if(camera.zoom > 1){
		delta = -delta;
		camera.zoom /= 1 + delta/4*camera.sensitivity;
		camera.x -= delta/4*camera.sensitivity/(2*camera.zoom);
		camera.y -= delta/4*camera.sensitivity/(2*camera.zoom);
	}
}, false);
/*
Common Key Codes

up - 38
down - 40
left - 37
right - 39

space - 32

w - 87
a - 65
s - 83
d - 68

p - 80

0 - 48
1 - 49
2 - 50
3 - 51
4 - 52
5 - 53
6 - 54
7 - 55
8 - 56
9 - 57

esc - 27
*/
