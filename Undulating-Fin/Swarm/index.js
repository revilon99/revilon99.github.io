/*
Undulating-Fin/Swarm/index.js
Oliver Cass (c) 2023
All Rights Reserved

---

The purpose of this demo is to explore the 'Swarm Reckoning' concept 
and act as a playground for its capability

*/

// Initial Definitions

// - Canvas

let canvas = document.getElementById('main');
let ctx = canvas.getContext('2d');
const C_SCALE = 1000;
const DIST_PULSE_FREQ = 400; // Hz
const PULSE_RANGE = 400*400;
const COMMS_RANGE = 200*200;

let width, height;

let num_boids = 100;
let boids = [];

let tri_acc_tracker = [];

let render_state = 1;
/*
render states:
0 - view all boids
1 - view boids[0] view
2 - swarm view of boids[0]
*/


// Loop Functions
let t = 0;
let d = new Date();
let previousT = d.getTime();
function tick(){
    d = new Date();
    let dt = d.getTime() - previousT;
    previousT = d.getTime();

    if(dt > 500) return;

    let distance_pulse = [];

    for(let b of boids) {
        // Note -   response object allows for global physical world interactions - such as a light pulse
        //          this should end up in its own class as a swarm_simulation_controller and should be named
        //          unique to the project
        let response = b.tick(dt);
        if(response.distance_pulse) {
            distance_pulse.push(b.id);
        }
    }

    for(let d of distance_pulse){
        for(let b of boids){
            if(b.id == d) continue;
            let dx = boids[d].x - b.x;
            let dy = boids[d].y - b.y;
            let distSq = dx*dx + dy*dy;
            let dist = Math.sqrt(distSq);

            let invDistSq = PULSE_RANGE / distSq; // at pulse max range invDistSq = 1

            if(invDistSq > 1){
                b.pulse_list.push({id: d, dist: dist});
            }
        }
    }

    for(let c of boids){
        for(let b of boids){
            if(c.id == b.id) continue;
            let dx = boids[c.id].x - b.x;
            let dy = boids[c.id].y - b.y;
            let distSq = dx*dx + dy*dy;
            
            let invDistSq = COMMS_RANGE / distSq; // at pulse max range invDistSq = 1

            if(invDistSq > 1){
                // everything that needs to be communicated for algorithm to work
                b.comms_list.push({id: c.id, x: boids[c.id].computer.x, y: boids[c.id].computer.y, velX: boids[c.id].computer.velX, velY: boids[c.id].computer.velY, surrounding_boids: boids[c.id].other_boids});
            }
        }
    }

    render();

    t++;
    requestAnimationFrame(tick);
}

function render(){
    ctx.clearRect(0, 0, width, height);

    for(b of boids) b.render(canvas, ctx, render_state);
}


// Canvas Functions

function initCanvas(){
    width = canvas.clientWidth;
    height = canvas.clientHeight;

    canvas.width = width;
    canvas.height = height;
}

// DOM Functions

window.onload = function(){
    initCanvas();
    for(let i = 0; i < num_boids; i++){
        boids.push(new Boid(i, num_boids, Math.random(), Math.random()));
    }
}
window.onresize = function(){
    initCanvas();
}

requestAnimationFrame(tick);