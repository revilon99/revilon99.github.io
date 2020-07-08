/*
circle-eq.js
Oliver Cass (c) 2020
All Rights Reserved
*/

var A, B, R;

function drawCircle(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(A, B, R, 0, 2*Math.PI);
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

var r = document.createElement('input');
r.type = "range";
r.min = 0;
r.max = 250;
r.value = 100;
r.setAttribute('update', 'updateR');

A = a.value, B = b.value, R = r.value;

drawCircle();

/*
public
*/

eles.innerHTML += "a (center x): ";
eles.appendChild(a);
eles.innerHTML += "<br>b (center y): ";
eles.appendChild(b);
eles.innerHTML += "<br>r (radius): ";
eles.appendChild(r);

this.updateA = function(_A){
    A = _A;
    drawCircle();
}
this.updateB = function(_B){
    B = _B;
    drawCircle();
}
this.updateR = function(_R){
    R = _R;
    drawCircle();
}

