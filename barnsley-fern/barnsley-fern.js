/*
barnsley-fern.js
Oliver Cass (c) 2020
All Rights Reserved

https://en.wikipedia.org/wiki/Barnsley_fern
*/

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

params = {};

/*
f(x, y) = [ a  b ][ x ] + [ e ]
          [ c  d ][ y ]   [ f ]
		  
P(fn) = p
*/

var f1 = {}, f2 = {}, f3 = {}, f4 = {};

function init_canvas(){
      var dpr = window.devicePixelRatio || 1;
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
	  ctx.fillStyle = "green"
}

window.onresize = function(){
	if(canvas.clientWidth < 500) return;
	init_canvas;
}

window.onload = function(){
	init_canvas();
	
	var inputs = document.getElementsByClassName('slider');
    for(var i of inputs){
        if(document.getElementById(i.id + "_a")) document.getElementById(i.id + "_a").innerHTML = i.value / (i.getAttribute('scale')||1);
        i.addEventListener('input', slider, false);
        params[i.id] = i.value / (i.getAttribute('scale')||1);
    }
	
	fern();
	
	tick();
}

var x = 0, y = 0;

var ticks = 0;

var running = true;

function tick(){
	if(running && ticks < params.numIt){
		ticks++;
		for(var i = 0; i < 250; i++){
			update();
		}
	}
	
	requestAnimationFrame(tick);
}

function update(){
	var nX, nY;
	var r = Math.random();
	
	if(r < f1.p){
		nX = f1.a*x + f1.b*y + f1.e;
		nY = f1.c*x + f1.d*y + f1.f;
	}else if(r < f1.p + f2.p) {
		nX = f2.a*x + f2.b*y + f2.e;
		nY = f2.c*x + f2.d*y + f2.f;
	}else if(r < f1.p + f2.p + f3.p){
		nX = f3.a*x + f3.b*y + f3.e;
		nY = f3.c*x + f3.d*y + f3.f;
	}else{
		nX = f4.a*x + f4.b*y + f4.e;
		nY = f4.c*x + f4.d*y + f4.f;
	}
	
	var pX = canvas.clientWidth * (x + 3) / 6;
	var pY = canvas.clientHeight - canvas.clientHeight * ((y + 2) / 14);
	
	ctx.fillRect(pX, pY, 1, 1);
	
	x = nX;
	y = nY;
}

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

function slider(e){
	ticks = 0;
	ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    if(document.getElementById(e.target.id + "_a")) document.getElementById(e.target.id + "_a").innerHTML = e.target.value / (e.target.getAttribute('scale')||1);
    params[e.target.id] = e.target.value / (e.target.getAttribute('scale')||1);
	if(e.target.id == "fern") fern();
}

function fern(){
	ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	var ferntxt = document.getElementById('fern_det');
    switch(params.fern){
        case(1):
            ferntxt.innerHTML = "Thelypteridaceae";
			
			f1 = { //Stem
				a: 0,
				b: 0,
				c: 0,
				d: 0.25,
				e: 0,
				f: -0.4,
				p: 0.02
			}

			f2 = { //Successively Smaller Leaflets
				a: 0.95,
				b: 0.005,
				c: -0.005,
				d: 0.93,
				e: -0.002,
				f: 0.5,
				p: 0.84
			}

			f3 = { //Largest left-hand leaflet
				a: 0.035,
				b: -0.2,
				c: 0.16,
				d: 0.04,
				e: -0.09,
				f: 0.02,
				p: 0.07
			}

			f4 = { //Largest right-hand leaflet
				a: -0.04,
				b: 0.2,
				c: 0.16,
				d: 0.04,
				e: 0.083,
				f: 0.12,
				p: 0.07
			}
			
            break;
        default:
            ferntxt.innerHTML = "Barnsley";  

			f1 = { //Stem
				a: 0,
				b: 0,
				c: 0,
				d: 0.16,
				e: 0,
				f: 0,
				p: 0.01
			}

			f2 = { //Successively Smaller Leaflets
				a: 0.85,
				b: 0.04,
				c: -0.04,
				d: 0.85,
				e: 0,
				f: 1.6,
				p: 0.85
			}

			f3 = { //Largest left-hand leaflet
				a: 0.2,
				b: -0.26,
				c: 0.23,
				d: 0.22,
				e: 0,
				f: 0.16,
				p: 0.07
			}

			f4 = { //Largest right-hand leaflet
				a: -0.15,
				b: 0.28,
				c: 0.26,
				d: 0.24,
				e: 0,
				f: 0.44,
				p: 0.07
			}
    }
}