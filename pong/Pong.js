/*
    pong/Pong.js
    Oliver Cass (c) 2021
    All Rights Reserved
*/

class Pong{
    canvas; ctx; param = {};

    static EPSILON_TIME = 0.0001;

    running = false;

    balls = [];

    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.update_canvas();

        this.canvas.onresize = this.update_canvas;
        let pong = this;
        this.canvas.addEventListener('click', function(e){
            let mouse = pong.getMousePos(canvas, e);
            pong.click(pong, mouse.x, mouse.y)
        }, false);

        this.running = true;
    }

    tick(){
        let timeLeft = 1;

        let balls = this.balls;

        if(this.running) {do{
            let tMin = timeLeft;

            //Ball-Ball Collision
            for(let i = 0; i < balls.length; i++){
                for(let j = 0; j < balls.length; j++){
                    if(i < j){
                        if(balls[i] == null || balls[j] == null) continue;
                        balls[i].ballIntersect(balls[j], tMin);
                        if(balls[i].earliestCollisionResponse.t < tMin)
                            tMin = balls[i].earliestCollisionResponse.t;
                    }
                }
            }


            //Ball-Wall Collision
            for(let b of balls){
                if(b == null) continue;
                b.borderIntersect(timeLeft);
                if(b.earliestCollisionResponse.t < tMin)
                    tMin = b.earliestCollisionResponse.t;
            }

            for(let b of balls) {
                if(b == null) continue;
                b.tick(tMin);
            }

            timeLeft -= tMin;
        }while(timeLeft > Pong.EPSILON_TIME);}

        //Quick solution to the (rare but obvious) problem where balls get stuck
        for(let b of balls){
            if(b == null) continue;
            if(b.x - b.radius < 0) b.x = b.radius + 1;
            if(b.x + b.radius > this.canvas.clientWidth) b.x = this.canvas.clientWidth - b.radius - 1;
            if(b.y - b.radius < 0) b.y = b.radius + 1;
            if(b.y + b.radius > this.canvas.clientHeight) b.y = this.canvas.clientHeight - b.radius - 1;
        }

        //remove null balls
        for(let i = 0; i < balls.length; i++) if(balls[i]==null) balls.splice(i--, 1);

        this.render();
    }

    render(){
        let ctx = this.ctx;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

         //render all balls
        for(let b of this.balls){
            if(b == null) continue;
            b.render(ctx);
        }
    }

    delete_ball(ball){
        this.balls[this.balls.indexOf(ball)] = null;
    }

    update_canvas(){
        // Get the device pixel ratio, falling back to 1.
        var dpr = window.devicePixelRatio || 1;
        // Get the size of the canvas in CSS pixels.
        var rect = this.canvas.getBoundingClientRect();
        // Give the canvas pixel dimensions of their CSS
        // size * the device pixel ratio.
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        // Scale all drawing operations by the dpr, so you
        // don't have to worry about the difference.
        this.ctx.scale(dpr, dpr);

        this.param.MIN_RADIUS = Math.floor(this.canvas.width/80);
        this.param.MAX_RADIUS = Math.floor(this.canvas.width/20);
        this.param.MAX_SPEED  = Math.floor(this.canvas.width/150);
    }

    click(pong, x, y){
        for(let b of pong.balls) {
            if(b == null) continue;
            if(b.pointCollision(x, y, pong.param.MIN_RADIUS)) {
                pong.delete_ball(b);
                return;
            }
        }

        if(x > pong.param.MIN_RADIUS && x < pong.canvas.clientWidth - pong.param.MIN_RADIUS ||
           y > pong.param.MIN_RADIUS && y < pong.canvas.clientHeight - pong.param.MIN_RADIUS) pong.balls.push(new Ball(x, y, pong.param, pong.balls, pong.delete_ball, this.canvas));

    }

    getMousePos(canvas, evt){
        var rect = canvas.getBoundingClientRect(); // abs. size of element

        return {
            x: ((evt.clientX||evt.touches[0].clientX) - rect.left),   // scale mouse coordinates after they have
            y: ((evt.clientY||evt.touches[0].clientY)  - rect.top)     // been adjusted to be relative to element
        }
    }
}
