/*
Undulating-Fin/Swarm/Boid.js
Oliver Cass (c) 2023
All Rights Reserved

---

This class represents one agent in the swarm

Notes:
    - Requires a global C_SCALE. Equal to 1000 in this setup to allow for easier adjustment of acc and vel values

*/

class Boid{
    constructor(id, total, x, y){ // Note - x & y between 0 and 1
        // Simulation Setup

        this.id = id;
        this.total = total;
        this.other_boids = [];
        for(let i = 0; i < total; i++) this.other_boids.push({id: i});

        // Physical Setup

        this.x = x*C_SCALE; // Physical x location
        this.y = y*C_SCALE; // Physical y location

        this.accX = 0;
        this.accY = 0;
        this.forceX = 0;
        this.forceY = 0;

        this.radius = 10;
        this.color = "black";

        let vel = 0.05;

        this.velX = vel * (2*Math.random() - 1);
        this.velY = vel * (2*Math.random() - 1);

        this.maxVel = 0.2;


        // Computational Setup

        // Assumption - computer has perfect knowledge of start state
        this.computer = {
            x: this.x,
            y: this.y,
            velX: this.velX,
            velY: this.velY,
            accX: this.accX,
            accY: this.accY,
            color: "green"
        }
        this.accelerometer_accuracy = 0;

        this.millis = 0; // Aims to replicate arduino millis

        // distance pulse
        // Note - The application for this is a boid outputing an audio and light pulse simulatenously
        //        This when received by another boid can used the time between received signals to
        //        roughly calculate the distance between the two boids
        this.primed_pulse = false;
        this.pulse_list = [];
        this.received_pulse = -1000; // Note - for render purposes only
        this.last_pulse = -1000; // Note - for render purposes only
        this.pulse_accuracy = 0;

        // comms
        // Note - this assumes short range communication is possible. Use of speaker and microphone
        //        underwater just out of audible range should allow for low data rate communication
        this.comms_list = [];
        this.last_comms = -1000; // Note - for render purposes only


        // alternate corner aim
        this.corner = Math.floor(Math.random()*4); // top left = 0; -> clockwise
    }

    tick(dt){
        this.millis += dt;
        this.physical_tick(dt);    
        return this.compute(dt);
    }

    physical_tick(dt){
        // Controls physical motion of body - Essentially Newtonian Laws of Motion

        // Apply forces to acceleration (Newton's Second Law)
        // Note - Mass and Drag should be added here when appropriate
        this.accX = this.forceX - this.velX*this.velX*0.01*(this.velX/Math.abs(this.velX));
        this.accY = this.forceY - this.velY*this.velY*0.01*(this.velY/Math.abs(this.velY));
        

        // Boundary conditions - may become irrelevant in later simulations
        if(this.x < 0) this.accX = -2*this.velX/dt;
        if(this.x > 1000) this.accX = -2*this.velX/dt;
        if(this.y < 0) this.accY = -2*this.velY/dt;
        if(this.y > 1000) this.accY = -2*this.velY/dt;

        // Apply acceleration and velocity to motion
        this.velX += this.accX*dt;
        this.velY += this.accY*dt;

        this.x += this.velX*dt;
        this.y += this.velY*dt;
    }

    compute(dt){
        // Acts as computation control - or simulations function of microcontroller

        // get and update computers acceleration data
        let currentAccData = this.accelerometer();

        // Note - good opportunity for interpolation
        this.computer.accX = currentAccData.x;
        this.computer.accY = currentAccData.y;

        // Dead Reckoning
        this.computer.velX += this.computer.accX*dt;
        this.computer.velY += this.computer.accY*dt;

        this.computer.x += this.computer.velX*dt;
        this.computer.y += this.computer.velY*dt;

        document.getElementById('dr-err').innerHTML = (this.computer.x - this.x)*(this.computer.x - this.x) + (this.computer.y - this.y)*(this.computer.y - this.y);

        // Swarm Reckoning
        // track other boids
        for(let b of this.other_boids){
            // for 1 second continue to dead reckon other boid
            if(this.millis - b.last_update < 1000){
                b.cx += b.velX * dt;
                b.cy += b.velY * dt;
            }
        }

        // triangulation
        // get circles
        let circles = [];
        for(let b of this.other_boids){
            if(this.millis - b.last_update > 50) continue;
            if(!b.surrounding_boids) continue;
            let ob = b.surrounding_boids[this.id];
            if(this.millis - ob.last_dist < 50){
                circles.push({x: b.cx, y: b.cy, rad: ob.dist});
            }
        }

        if(circles.length > 10){
            let maxChance = Infinity;
            let x_chance = -1;
            let y_chance = -1;
            let scale = 0.1;
            let range = 5;
            for(let x = this.computer.x - range; x < this.computer.x + range; x += scale){
                for(let y = this.computer.y - range; y < this.computer.y + range; y += scale){
                    let k = 0;
                    for(let c of circles){
                        let d = (x - c.x)*(x - c.x) + (y - c.y)*(y - c.y); // distance from probed point to centre of circle sq
                        let dist = Math.abs(d - c.rad*c.rad); // distance from probed from to circumference of circle

                        k += dist;
                    }
                    
                    if(k < maxChance){
                        maxChance = k;
                        x_chance = x;
                        y_chance = y;
                    }
                }
            }

            if(this.id < 1){
                document.getElementById('b1x').innerHTML = boids[0].computer.x;
                document.getElementById('b1y').innerHTML = boids[0].computer.y;
                document.getElementById('btx').innerHTML = x_chance;
                document.getElementById('bty').innerHTML = y_chance;
                let acc = (x_chance-this.x)*(x_chance-this.x) + (y_chance-this.y)*(y_chance-this.y);
                document.getElementById('triacc').innerHTML = acc;
                if(Math.abs(acc) > Math.abs(document.getElementById('triaccworst').innerHTML)) document.getElementById('triaccworst').innerHTML = acc; 
                tri_acc_tracker.push(acc);
            }
        }

        // Distance Pulse
        // Handle incoming pulses
        let relative_dist_list = [];
        for(let p of this.pulse_list){
            if(Math.random() > 0.9) continue; // simulate random chance
            relative_dist_list.push(p);
            this.other_boids[p.id].dist = p.dist + (2*Math.random() - 1)*this.pulse_accuracy;
            this.other_boids[p.id].last_dist = this.millis;
        }
        this.pulse_list = [];

        if(relative_dist_list.length > 0) this.received_pulse = this.millis; // Note - for render purposes only

        // Handle outgoing pulse

        let pulse_distance = false;

        let pulse_length = 1000 * this.total / DIST_PULSE_FREQ; // Time in between personal pulses in milliseconds
        let time_since_due_pulse = (this.millis + (this.id/this.total)*pulse_length) % pulse_length;
        if(time_since_due_pulse > pulse_length*0.9) this.primed_pulse = true;

        if(this.primed_pulse && time_since_due_pulse < pulse_length / 2){
            pulse_distance = true;
            this.last_pulse = this.millis;
            this.primed_pulse = false;
        }


        // Communication
        // Handle incoming communication
        let incoming_comms = [];
        for(let c of this.comms_list){
            if(Math.random() > 0.8) continue;
            incoming_comms.push(c);
        }
        this.comms_list = [];

        if(incoming_comms.length > 0){
            this.last_comms = this.millis;
            for(let c of incoming_comms){
                this.other_boids[c.id].cx = c.x;
                this.other_boids[c.id].cy = c.y;
                this.other_boids[c.id].velX = c.velX;
                this.other_boids[c.id].velY = c.velY;
                this.other_boids[c.id].surrounding_boids = c.surrounding_boids;
                this.other_boids[c.id].last_update = this.millis;
            }
        }

        // Force Control
        this.forceX = 0;
        this.forceY = 0;

        let acc = 0.0001;

        // avoid boundary
        if(this.computer.x > 800) this.forceX += -acc;
        if(this.computer.x < 200) this.forceX += acc;
        if(this.computer.y > 800) this.forceY += -acc;
        if(this.computer.y < 200) this.forceY += acc;

        // avoid other boids (seperation)
        let c = 0;
        let fx = 0;
        let fy = 0;
        for(let b of this.other_boids){
            if(this.millis - b.last_update > 1000) continue;
            let dx = this.computer.x - b.cx;
            let dy = this.computer.y - b.cy;
            let d = Math.sqrt(dx*dx + dy*dy);
            if(d > 0 && d < 50){
                fx += dx / (d);
                fy += dy / (d);
                if(d < 30){
                    fx += 3*dx / (d);
                    fy += 3*dy / (d);
                }
                c++;
            }
        }
        if(c > 0){
            fx /= c;
            fy /= c;
           this.forceX += fx*acc;
           this.forceY += fy*acc;
        }

        let target_x = 0, target_y = 0;
        switch(this.corner){
            case 0:
                target_x = 50;
                target_y = 50;
                if( this.computer.x < 200 && 
                    this.computer.y < 200) this.corner = Math.floor(Math.random()*4);
                break;
            case 1:
                target_x = 950;
                target_y = 50;
                if( this.computer.x > 800 && 
                    this.computer.y < 200) this.corner = Math.floor(Math.random()*4);
                break;
            case 2:
                target_x = 950;
                target_y = 950;
                if( this.computer.x > 800 && 
                    this.computer.y > 800) this.corner = Math.floor(Math.random()*4);
                break;
            case 3:
                target_x = 50;
                target_y = 950;
                if( this.computer.x < 200 && 
                    this.computer.y > 800) this.corner = Math.floor(Math.random()*4);
                break;
            default:
                target_x = 0;
                target_y = 0;
        }

        let dx = target_x - this.computer.x;
        let dy = target_y - this.computer.y;
        let d = Math.sqrt(dx*dx + dy*dy);
        this.forceX += 0.5*acc*dx / (d);
        this.forceY += 0.5*acc*dy / (d);

        if(this.id == 0) document.getElementById('b1-tar').innerHTML = this.corner;


        return {
            distance_pulse: pulse_distance
        }
    }

    render(canvas, ctx, state){
        // Scale variables to canvas
        let x   = canvas.width  * this.x / C_SCALE;
        let y   = canvas.width * this.y / C_SCALE;

        let cx   = canvas.width  * this.computer.x / C_SCALE;
        let cy   = canvas.width * this.computer.y / C_SCALE;
        let rad  = canvas.width  * this.radius / C_SCALE;

        switch(state){
            case 0:
                ctx.beginPath();
                ctx.arc(x, y, rad, 0, 2 * Math.PI, false);
                ctx.fillStyle = this.color;
                if(this.id == 0) ctx.fillStyle = "darkGray";
                ctx.fill();
                ctx.closePath();

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(cx, cy);
                ctx.fillStyle = this.color;
                ctx.stroke();
                ctx.closePath();

                if(this.millis - this.last_comms < 800){ 
                    ctx.beginPath();
                    ctx.arc(cx, cy, rad + 1, 0, 2 * Math.PI, false);
                    ctx.fillStyle = "black";
                    ctx.fill();
                    ctx.closePath();
                }
                
                ctx.beginPath();
                ctx.arc(cx, cy, rad, 0, 2 * Math.PI, false);
                ctx.fillStyle = this.computer.color;
                if(this.millis - this.received_pulse < 800) ctx.fillStyle = "orange";
                if(this.millis - this.last_pulse < 800) ctx.fillStyle = "red";
                ctx.fill();
                ctx.closePath();

                break;
            case 1:
                if(this.id > 0) break;
                
                for(let b of this.other_boids){
                    if(this.millis - b.last_update > 100) continue;
                    if(!b.surrounding_boids) continue;
                    let ob = b.surrounding_boids[0];
                    if(this.millis - ob.last_dist < 1000){
                        let bx   = canvas.width * b.cx / C_SCALE;
                        let by   = canvas.width * b.cy / C_SCALE;
                        
                        ctx.beginPath();
                        ctx.arc(bx, by, rad/1.5, 0, 2 * Math.PI, false);
                        ctx.fillStyle = "black";
                        ctx.fill();
                        ctx.closePath();
    
                        ctx.beginPath();
                        let act_dist = ob.dist * canvas.width / C_SCALE;
                        ctx.arc(bx, by, act_dist, 0, 2 * Math.PI, false);
                        ctx.strokeStyle = "red";
                        ctx.stroke();
                        ctx.closePath();
                    }
                }

                ctx.beginPath();
                ctx.arc(x, y, rad, 0, 2 * Math.PI, false);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.closePath();

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(cx, cy);
                ctx.fillStyle = this.color;
                ctx.stroke();
                ctx.closePath();

                if(this.millis - this.last_comms < 800){ 
                    ctx.beginPath();
                    ctx.arc(cx, cy, rad + 2, 0, 2 * Math.PI, false);
                    ctx.fillStyle = "black";
                    ctx.fill();
                    ctx.closePath();
                }
                
                ctx.beginPath();
                ctx.arc(cx, cy, rad, 0, 2 * Math.PI, false);
                ctx.fillStyle = this.computer.color;
                if(this.millis - this.received_pulse < 800) ctx.fillStyle = "orange";
                if(this.millis - this.last_pulse < 800) ctx.fillStyle = "red";
                ctx.fill();
                ctx.closePath();

                for(let b of this.other_boids){
                    if(this.millis - b.last_update < 1000){
                        let bx   = canvas.width  * b.cx / C_SCALE;
                        let by   = canvas.width  * b.cy / C_SCALE;

                        ctx.beginPath();
                        ctx.arc(bx, by, rad, 0, 2 * Math.PI, false);
                        ctx.fillStyle = "Green";
                        ctx.fill();
                        ctx.closePath();
                    }
                }
                break;

             case 2:
                if(this.millis - this.other_boids[0].last_dist < 1000){
                    ctx.beginPath();
                    ctx.arc(cx, cy, rad/1.5, 0, 2 * Math.PI, false);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                    ctx.closePath();

                    ctx.beginPath();
                    let act_dist = this.other_boids[0].dist * canvas.width / C_SCALE;
                    ctx.strokeStyle = "black";
                    ctx.arc(cx, cy, act_dist, 0, 2 * Math.PI, false);
                    ctx.stroke();
                    ctx.closePath();
                }

                for(let b of this.other_boids){
                    continue; // shows additional pulses communicated between boids. Generally irrelevant as pulse dist is greater
                              // than comms distance. Allows for triangulation
                    if(this.millis - b.last_update > 1000) continue;
                    if(!b.surrounding_boids) continue;
                    let ob = b.surrounding_boids[0];
                    if(this.millis - ob.last_dist < 1000){
                        let bx   = canvas.width * b.cx / C_SCALE;
                        let by   = canvas.width * b.cy / C_SCALE;
                        
                        ctx.beginPath();
                        ctx.arc(bx, by, rad/1.5, 0, 2 * Math.PI, false);
                        ctx.fillStyle = "red";
                        ctx.fill();
                        ctx.closePath();
    
                        ctx.beginPath();
                        let act_dist = ob.dist * canvas.width / C_SCALE;
                        ctx.arc(bx, by, act_dist, 0, 2 * Math.PI, false);
                        ctx.strokeStyle = "red";
                        ctx.stroke();
                        ctx.closePath();
                    }
                }

                if(this.millis - this.other_boids[0].last_update < 1000){
                    ctx.beginPath();
                    ctx.arc(cx, cy, rad/1.5, 0, 2 * Math.PI, false);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                    ctx.closePath();

                    let bx   = canvas.width  * this.other_boids[0].cx / C_SCALE;
                    let by   = canvas.width * this.other_boids[0].cy / C_SCALE;

                    ctx.beginPath();
                    ctx.arc(bx, by, rad/2, 0, 2 * Math.PI, false);
                    ctx.fillStyle = "blue";
                    ctx.fill();
                    ctx.closePath();
                }

                if(this.id > 0) break;
                ctx.beginPath();
                ctx.arc(x, y, rad, 0, 2 * Math.PI, false);
                ctx.fillStyle = this.color;
                if(this.id == 0) ctx.fillStyle = "darkGray";
                ctx.fill();
                ctx.closePath();

                ctx.beginPath();
                ctx.arc(cx, cy, rad, 0, 2 * Math.PI, false);
                ctx.fillStyle = this.color;
                if(this.id == 0) ctx.fillStyle = "darkGreen";
                ctx.fill();
                ctx.closePath();
                break;
            default:
                ctx.beginPath();
                ctx.arc(x, y, rad, 0, 2 * Math.PI, false);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.closePath();
                break;
        }

        
    }

    accelerometer(){
        // Note - should implement normal distribution to be more realistic
        let x = this.accX * (1 + (2 * Math.random() - 1)*this.accelerometer_accuracy);
        let y = this.accY * (1 + (2 * Math.random() - 1)*this.accelerometer_accuracy);
        return {x: x, y: y};
    }
}