/*
boids.js
Oliver Cass (c) 2020
All Rights Reserved

Based on Boids algorithm by Craig Reynolds
https://www.red3d.com/cwr/boids/
*/

var boids = [];
var params = {};

var SEARCHcolour = '#3d3d3d';
var SEPERATIONcolour, ALIGNMENTcolour, COHESIONcolour;

var target = null;

var Boid = function(){
    this.loc = new Vec2(Math.random()*canvas.clientWidth, Math.random()*canvas.clientHeight);
    this.vel = new Vec2(2*Math.random()*params.maxSpeed - params.maxSpeed, 2*Math.random()*params.maxSpeed - params.maxSpeed);
    this.acc = new Vec2();
    this.colour = randomColour();

    this.update = function(){
        var localBoids = getLocalBoids(this);

        var rule1 = seperate(this, localBoids);
        var rule2 = alignment(this, localBoids);
        var rule3 = cohesion(this, localBoids);
        var rule4 = new Vec2();
        if(target != null) rule4 = seek(this, target);

        rule1.mult(params.sepFac);
        rule2.mult(params.aliFac);
        rule3.mult(params.cohFac);
        rule4.mult(params.targetFac);

        this.acc.add(rule1);
        this.acc.add(rule2);
        this.acc.add(rule3);
        this.acc.add(rule4);

        

        this.vel.add(this.acc);
        this.vel.limit(params.maxSpeed);
        this.loc.add(this.vel);
        this.acc.mult(0);

        if(this.loc.x > canvas.clientWidth) this.loc.x = 0;
        if(this.loc.x < 0) this.loc.x = canvas.clientWidth;
        if(this.loc.y > canvas.clientHeight) this.loc.y = 0;
        if(this.loc.y < 0) this.loc.y = canvas.clientHeight;
    }
    this.render = function(){
        var theta = Math.atan2(this.vel.y, this.vel.x);
        var r = Matrix.rotation(theta);
        var points = Matrix.multiply(r, params.shape);

        if(params.vis > 0 && this == boids[0]){
            ctx.beginPath();
            ctx.moveTo(this.loc.x, this.loc.y);
            ctx.arc(this.loc.x, this.loc.y, params.searchRad, theta - params.angle, theta + params.angle, false);
            ctx.lineTo(this.loc.x, this.loc.y);
            ctx.fillStyle = SEARCHcolour;
            ctx.fill();
            ctx.closePath();
            if(params.vis > 1){
                var search = [{radius: params.cohRad, color: COHESIONcolour}, {radius: params.aliRad, color: ALIGNMENTcolour}, {radius: params.sepRad, color: SEPERATIONcolour}];
                search.sort((a, b) => parseFloat(b.radius) - parseFloat(a.radius));
                for(var s of search){
                    ctx.beginPath();
                    ctx.moveTo(this.loc.x, this.loc.y);
                    ctx.arc(this.loc.x, this.loc.y, s.radius, theta - params.angle, theta + params.angle, false);
                    ctx.lineTo(this.loc.x, this.loc.y);
                    ctx.fillStyle = s.color;
                    ctx.fill();
                    ctx.closePath();
                }
            }

            var newX = this.loc.x, newY = this.loc.y;

            if(this.loc.x < params.searchRad) newX = canvas.clientWidth + this.loc.x;
            if(this.loc.x > canvas.clientWidth - params.searchRad) newX = this.loc.x - canvas.clientWidth;
            if(this.loc.y < params.searchRad) newY = canvas.clientHeight + this.loc.y;
            if(this.loc.y > canvas.clientHeight - params.searchRad) newY = this.loc.y - canvas.clientHeight;

            if(newX != this.loc.x){
                ctx.beginPath();
                ctx.moveTo(newX, this.loc.y);
                ctx.arc(newX, this.loc.y, params.searchRad, theta - params.angle, theta + params.angle, false);
                ctx.lineTo(newX, this.loc.y);
                ctx.fillStyle = SEARCHcolour;
                ctx.fill();
                ctx.closePath();
                if(params.vis > 1){
                    var search = [{radius: params.cohRad, color: COHESIONcolour}, {radius: params.aliRad, color: ALIGNMENTcolour}, {radius: params.sepRad, color: SEPERATIONcolour}];
                    search.sort((a, b) => parseFloat(b.radius) - parseFloat(a.radius));
                    for(var s of search){
                        ctx.beginPath();
                        ctx.moveTo(newX, this.loc.y);
                        ctx.arc(newX, this.loc.y, s.radius, theta - params.angle, theta + params.angle, false);
                        ctx.lineTo(newX, this.loc.y);
                        ctx.fillStyle = s.color;
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
            if(newY != this.loc.y){
                ctx.beginPath();
                ctx.moveTo(this.loc.x, newY);
                ctx.arc(this.loc.x, newY, params.searchRad, theta - params.angle, theta + params.angle, false);
                ctx.lineTo(this.loc.x, newY);
                ctx.fillStyle = SEARCHcolour;
                ctx.fill();
                ctx.closePath();
                if(params.vis > 1){
                    var search = [{radius: params.cohRad, color: COHESIONcolour}, {radius: params.aliRad, color: ALIGNMENTcolour}, {radius: params.sepRad, color: SEPERATIONcolour}];
                    search.sort((a, b) => parseFloat(b.radius) - parseFloat(a.radius));
                    for(var s of search){
                        ctx.beginPath();
                        ctx.moveTo(this.loc.x, newY);
                        ctx.arc(this.loc.x, newY, s.radius, theta - params.angle, theta + params.angle, false);
                        ctx.lineTo(this.loc.x, newY);
                        ctx.fillStyle = s.color;
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
        }

        ctx.beginPath();
        ctx.moveTo(points[0][0] + this.loc.x, points[1][0] + this.loc.y);
        ctx.lineTo(points[0][1] + this.loc.x, points[1][1] + this.loc.y);
        ctx.lineTo(points[0][2] + this.loc.x, points[1][2] + this.loc.y);
        ctx.closePath();

        ctx.fillStyle = this.colour;
        ctx.fill();
    }
}

function getLocalBoids(boid){
    var local_boids = [];

    var direction = Math.atan2(boid.vel.y, boid.vel.x);

    var newX = boid.loc.x, newY = boid.loc.y;

    if(boid.loc.x < params.searchRad) newX = canvas.clientWidth + boid.loc.x;
    if(boid.loc.x > canvas.clientWidth - params.searchRad) newX = boid.loc.x - canvas.clientWidth;
    if(boid.loc.y < params.searchRad) newY = canvas.clientHeight + boid.loc.y;
    if(boid.loc.y > canvas.clientHeight - params.searchRad) newY = boid.loc.y - canvas.clientHeight;
    
    for(var b of boids){
        if(b === boid) continue;

        var dist2 = (b.loc.x - boid.loc.x)*(b.loc.x - boid.loc.x) + (b.loc.y - boid.loc.y)*(b.loc.y - boid.loc.y);
        if(dist2 < params.searchRadSq) {
            var theta = Math.atan2(b.loc.y - boid.loc.y, b.loc.x - boid.loc.x);
            if(theta > direction - params.angle && theta < direction + params.angle) {
                local_boids.push(b);
                continue;
            }
        }

        if(newX != boid.loc.x){
            dist2 = (b.loc.x - newX)*(b.loc.x - newX) + (b.loc.y - boid.loc.y)*(b.loc.y - boid.loc.y);
            if(dist2 < params.searchRadSq) {
                var theta = Math.atan2(b.loc.y - boid.loc.y, b.loc.x - boid.loc.x);
                if(theta > direction - params.angle && theta < direction + params.angle) {
                    local_boids.push(b);
                    continue;
                }
            }
        }
        if(newY != boid.loc.y){
            var dist2 = (b.loc.x - boid.loc.x)*(b.loc.x - boid.loc.x) + (b.loc.y - newY)*(b.loc.y - newY);
            if(dist2 < params.searchRadSq) {
                var theta = Math.atan2(b.loc.y - boid.loc.y, b.loc.x - boid.loc.x);
                if(theta > direction - params.angle && theta < direction + params.angle) {
                    local_boids.push(b);
                    continue;
                }
            }
        }
    }
    return local_boids;
}

function seperate(boid, boids){
    var steer = new Vec2();

    var count = 0;
    for(var b of boids){
        var d = Vec2D.dist2(boid.loc, b.loc);
        if(d < params.sepRadSq){
            var diff = Vec2D.sub(boid.loc, b.loc);
            diff.normalize();
            diff.divide(d);
            steer.add(diff);
            count++;
        }
    }

    if(count > 0) steer.divide(count);
    if(steer.mag() > 0){
        steer.normalize();
        steer.mult(params.maxSpeed);
        steer.sub(boid.vel);
        steer.limit(params.maxForce);
        return steer;
    }
    return new Vec2();
}

function alignment(boid, boids){
    var steer = new Vec2();

    var count = 0;
    for(var b of boids){
        var d = Vec2D.dist2(boid.loc, b.loc);
        if(d < params.aliRadSq){
            steer.add(b.vel);
            count++;
        }
    }

    if(count > 0){
        steer.divide(count);
        steer.normalize();
        steer.mult(params.maxSpeed);
        steer.sub(boid.vel);
        steer.limit(params.maxForce);
    }

    return steer;
}

function cohesion(boid, boids){
    var target = new Vec2();

    var count = 0;
    for(var b of boids){
        var d = Vec2D.dist2(boid.loc, b.loc);
        if(d < params.cohRadSq){
            target.add(b.loc);
            count++;
        }
    }

    if(count > 0){
        target.divide(count);
        return seek(boid, target);
    }
    return target;
}

function seek(boid, target){
    var steer = Vec2D.sub(target, boid.loc);
    steer.normalize();
    steer.mult(params.maxSpeed);
    steer.sub(boid.vel);
    steer.limit(params.maxForce);
    return steer;
}

var running = true;

function tick(){
    if(running) for(var b of boids) b.update();
    render();

    requestAnimationFrame(tick);
}

function render(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var b of boids) b.render();
}

//Interaction Events
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

var canvas = document.getElementById('game');

canvas.addEventListener('click', function(e){
    var mouse = getMousePos(e.target, e);
    target = new Vec2(mouse.x, mouse.y);
    setTimeout(function(){
        target = null;
    }, 1500);
}, false);

function slider(e){
    if(document.getElementById(e.target.id + "_a")) document.getElementById(e.target.id + "_a").innerHTML = e.target.value / (e.target.getAttribute('scale')||1);
    params[e.target.id] = e.target.value / (e.target.getAttribute('scale')||1);
    calculate();
}

function calculate(){
    //Radius Squares
    params.searchRad = Math.max(params.cohRad, params.aliRad, params.sepRad);
    params.searchRadSq = params.searchRad*params.searchRad;
    params.cohRadSq = params.cohRad*params.cohRad;
    params.aliRadSq = params.aliRad*params.aliRad;
    params.sepRadSq = params.sepRad*params.sepRad;
    
    //Angle
    params.angle = params.angleDEG * (Math.PI / 180);

    //Matrix Shape
    params.shape = [
        [params.size*1.5, -params.size, -params.size],
        [            0.0, -params.size,  params.size]
    ];

    //Sort Num Boids
    if(boids.length > 0 && params.numBoids > 0){
        if(params.numBoids > boids.length){
            for(var i = 0; i < params.numBoids - boids.length; i++) boids.push(new Boid());
        }else if(params.numBoids < boids.length){
            boids.splice(params.numBoids - 1, boids.length - params.numBoids);
        }
    }

    //Neighbourhood Visibilty
    var visdet = document.getElementById('vis_det');
    switch(params.vis){
        case(1):
            visdet.innerHTML = "Search Radius Only";
            break;
        case(2):
            visdet.innerHTML = "Full";
            break;
        default:
            visdet.innerHTML = "None";            
    }

    //Colors
    SEPERATIONcolour = document.getElementById('sep').style.color;
    ALIGNMENTcolour = document.getElementById('ali').style.color;
    COHESIONcolour = document.getElementById('coh').style.color;

    //Draw Template Boid
    var search = [{radius: params.cohRad, color: COHESIONcolour}, {radius: params.aliRad, color: ALIGNMENTcolour}, {radius: params.sepRad, color: SEPERATIONcolour}];
    search.sort((a, b) => parseFloat(b.radius) - parseFloat(a.radius));
    
    boidCtx.clearRect(0, 0, boid_canvas.width, boid_canvas.height)
    for(var s of search){
        boidCtx.beginPath();
        boidCtx.moveTo(boid_canvas.clientWidth / 2, boid_canvas.clientHeight / 2);
        boidCtx.arc(boid_canvas.clientWidth / 2, boid_canvas.clientHeight / 2, s.radius, -params.angle, params.angle, false);
        boidCtx.lineTo(boid_canvas.clientWidth / 2, boid_canvas.clientHeight / 2);
        boidCtx.fillStyle = s.color;
        boidCtx.fill();
        boidCtx.closePath();
    }

    boidCtx.beginPath();
    boidCtx.moveTo(params.shape[0][0] + boid_canvas.clientWidth / 2, params.shape[1][0] + boid_canvas.clientHeight / 2);
    boidCtx.lineTo(params.shape[0][1] + boid_canvas.clientWidth / 2, params.shape[1][1] + boid_canvas.clientHeight / 2);
    boidCtx.lineTo(params.shape[0][2] + boid_canvas.clientWidth / 2, params.shape[1][2] + boid_canvas.clientHeight / 2);
    boidCtx.closePath();

    boidCtx.fillStyle = '#fcba03';
    boidCtx.fill();

}


//Canvas Events
//Potentially move to seperate library for scalbilty
//since will be same for all projects and any changes
//are consistent

var ctx = canvas.getContext('2d');

var boid_canvas = document.getElementById('neighbourhood');
var boidCtx = boid_canvas.getContext('2d');

function init_canvas(){
      var dpr = window.devicePixelRatio || 1;
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      rect = boid_canvas.getBoundingClientRect();
      boid_canvas.width = rect.width * dpr;
      boid_canvas.height = rect.height * dpr;
      boidCtx.scale(dpr, dpr);
}

window.onload = function(){
    var flash = false;
    if(document.getElementById('darken').style.display == "none") flash = true;
    if(flash) document.getElementById('darken').style.display = "initial";
        
    init_canvas();

    var inputs = document.getElementsByClassName('slider');
    for(var i of inputs){
        if(document.getElementById(i.id + "_a")) document.getElementById(i.id + "_a").innerHTML = i.value / (i.getAttribute('scale')||1);
        i.addEventListener('input', slider, false);
        params[i.id] = i.value / (i.getAttribute('scale')||1);
    }

    calculate();

    for(var i = 0; i < params.numBoids; i++) boids.push(new Boid());

    requestAnimationFrame(tick);
    if(flash) document.getElementById('darken').style.display = "none";
}

window.onresize = function(){
    var flash = false;
    if(document.getElementById('darken').style.display == "none") flash = true;
    if(flash) document.getElementById('darken').style.display = "initial";
    init_canvas();
	calculate();
    if(flash) document.getElementById('darken').style.display = "none";
}

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