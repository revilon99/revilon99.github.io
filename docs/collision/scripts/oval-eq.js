/*
oval-eq.js
Oliver Cass (c) 2020
All Rights Reserved
*/

var A, B, W, H, ROT;

function drawOval(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.beginPath();
    
    var xPos, yPos;

    for (var i = 0; i < 2 * Math.PI; i += 0.01 ) {
        xPos = A - (H * Math.sin(i)) * Math.sin(ROT * Math.PI) + (W * Math.cos(i)) * Math.cos(ROT * Math.PI);
        yPos = B + (W * Math.cos(i)) * Math.sin(ROT * Math.PI) + (H * Math.sin(i)) * Math.cos(ROT * Math.PI);
        if (i == 0) {
            ctx.moveTo(xPos, yPos);
        } else {
            ctx.lineTo(xPos, yPos);
        }
    }
    ctx.fill();
    ctx.closePath();
}

var a = document.createElement('input');
a.type = "range";
a.min = 0;
a.max = 500;
a.value = 250;
a.setAttribute('update', 'updateA');

var b = document.createElement('input');
b.type = "range";
b.min = 0;
b.max = 500;
b.value = 250;
b.setAttribute('update', 'updateB');

var w = document.createElement('input');
w.type = "range";
w.min = 0;
w.max = 250;
w.value = 200;
w.setAttribute('update', 'updateW');

var h = document.createElement('input');
h.type = "range";
h.min = 0;
h.max = 250;
h.value = 100;
h.setAttribute('update', 'updateH');

var rot = document.createElement('input');
rot.type = "range";
rot.min = 0;
rot.max = 180;
rot.value = 0;
rot.setAttribute('update', 'updateROT');


A = parseInt(a.value), B = parseInt(b.value),
W = parseInt(w.value), H = parseInt(h.value),
ROT = parseInt(rot.value) * Math.PI/180;

drawOval();

/*
public
*/

eles.innerHTML += "a (center x): ";
eles.appendChild(a);
eles.innerHTML += "<br>b (center y): ";
eles.appendChild(b);
eles.innerHTML += "<br>w (radius x): ";
eles.appendChild(w);
eles.innerHTML += "<br>h (radius y): ";
eles.appendChild(h);
eles.innerHTML += "<br>rotation: ";
eles.appendChild(rot);

this.updateA = function(_A){
    A = parseInt(_A);
    drawOval();
}
this.updateB = function(_B){
    B = parseInt(_B);
    drawOval();
}
this.updateW = function(_W){
    W = parseInt(_W);
    drawOval();
}
this.updateH = function(_H){
    H = parseInt(_H);
    drawOval();
}
this.updateROT = function(_ROT){
    ROT = parseInt(_ROT) * Math.PI/180;
    drawOval();
}