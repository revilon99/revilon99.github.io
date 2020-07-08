/*
calculating-pi.js
Oliver Cass (c) 2020
All Rights Reserved

canvas & context defined dynamically
*/

var hit = 0, total = 0, PI = 0;

const calculationsPerTick = 500;

var running = false;

function startstop(){
    running = !running;
    if(running){
        tick();
        button.innerHTML = "Stop";
    }else button.innerHTML = "Start";
}

function tick(){
    if(running) requestAnimationFrame(tick);
    //Calculate a random point calculationsPerTick number of times per frame
    for(var i = 0; i < calculationsPerTick; i++) calculate();

    //From Eq.4
    PI = 4 * (hit / total);

    //Display Results
    document.getElementById('pi').innerHTML = PI;
    document.getElementById('hits').innerHTML = hit;
    document.getElementById('total').innerHTML = total;
}

function calculate(){
    total++;
    ctx.fillStyle = "#ff0000"; //Pixel default as red
    //Generate a random point between (-1, -1) to (1, 1)
    var x = 1 - Math.random()*2, y = 1 - Math.random()*2;

    if(x*x + y*y < 1){
        hit++;
        //Change pixel colour to green if in circle
        ctx.fillStyle = '#6be841'; 
    }
    
    //Draw pixel relative to canvas dimensions
    ctx.fillRect((x + 1)*canvas.clientWidth/2, (y + 1)*canvas.clientWidth/2, 1, 1);
}

/*
UI

eles is a div that contains all the extra elements
it is appended below the canvas is the ocass tag
*/
var button = document.createElement('button');
button.innerHTML = "start";
button.onclick = startstop;
eles.appendChild(button);