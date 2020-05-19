/*
balls.js
Oliver Cass (c) 2020
All Rights Reserved
*/

var balls = [];
var MIN_RADIUS;
var MAX_RADIUS;

var MAX_SPEED;

var Ball = function(x, y){
    this.x = x||(Math.random() * canvas.width);
    this.y = y||(Math.random() * canvas.height);

    this.velX = 2 * Math.random() * MAX_SPEED - MAX_SPEED;
    this.velY = 2 * Math.random() * MAX_SPEED - MAX_SPEED;

    this.radius = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS);

    this.colour = randomColour();

    this.update = function(){
        this.x += this.velX;
        this.y += this.velY;
    }

    this.render = function(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.colour;
        ctx.fill();
        ctx.closePath();
    }

    this.findCollisions = function(dt){
        /*
        a function that finds all the collisions and returns them in an array
        if they occur in less than 1 tick time (dt)
        */
        
        //check walls
    }
    
    this.pointCollision = function(x, y){
        
    }

    this.ballCollision = function(x, y, radius){

    }

    this.boundaryCollision = function(){

    }
}

var time = Date.now();

function tick(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var current = Date.now();

    var dt = current - time;
    time = current;

    //find all collisions in tick
    var collisions = [];
    
    //move balls
    for(var b of balls){
        b.update();
    }
    
    //render all balls
    for(var b of balls){
        b.render();
    }
    
    requestAnimationFrame(tick);
}

canvas.addEventListener('click', function(e){
    var mouse = getMousePos(canvas, e);


    balls.push(new Ball(mouse.x, mouse.y));
}, false);