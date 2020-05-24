/*
canvas.js
Oliver Cass (c) 2020
All Rights Reserved
*/

var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');

var width, height;

function init_canvas(){
      // Get the device pixel ratio, falling back to 1.
      var dpr = window.devicePixelRatio || 1;
      // Get the size of the canvas in CSS pixels.
      var rect = canvas.getBoundingClientRect();
      // Give the canvas pixel dimensions of their CSS
      // size * the device pixel ratio.
      canvas.width = rect.width * dpr;
      width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      height = rect.height * dpr;
      // Scale all drawing operations by the dpr, so you
      // don't have to worry about the difference.
      ctx.scale(dpr, dpr);

    MIN_RADIUS = Math.floor(canvas.width/80);
    MAX_RADIUS = Math.floor(canvas.width/20);
    MAX_SPEED = Math.floor(canvas.width/150);
}

window.onload = function(){
    init_canvas();
}

window.onresize = init_canvas;

const randomColour = function(){
  return 'rgb(' + (128 + Math.floor(Math.random()*127)) + ", " + (128 + Math.floor(Math.random()*127)) + ", " + (128 + Math.floor(Math.random()*127)) + ")";
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect(); // abs. size of element

	return {
		x: ((evt.clientX||evt.touches[0].clientX) - rect.left),   // scale mouse coordinates after they have
		y: ((evt.clientY||evt.touches[0].clientY)  - rect.top)     // been adjusted to be relative to element
	}
}