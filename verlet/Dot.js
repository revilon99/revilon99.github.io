/*
    Dot.js
    Oliver Cass (c) 2021
    All Rights Reserved
*/

class Dot{
    static RADIUS = 3;
    static RADIUSHIGHLIGHT = 5;

    constructor(x, y, velX=0, velY=0, fixed=false){
        this.pos = new Vector(x, y);
        this.oldPos = new Vector(x - velX, y - velY);

        this.friction = 1.0;
        this.groundFriction = 0.7;

        this.radius = Dot.RADIUS;
        this.radiusHighlight = Dot.RADIUSHIGHLIGHT;
        this.color = '#fff';
        this.mass = 1;

        this.fixed = fixed;
    }

    tick(w, h, gravity){
        if(this.fixed) return;
        let vel = Vector.sub(this.pos, this.oldPos);
        vel.mult(this.friction);

        if(this.pos.y >= h - this.radius && vel.magSq() > 0.000001){
            let m = vel.mag();
            vel.x /= m;
            vel.y /= m;
            vel.mult(m * this.groundFriction);
        }

        this.oldPos.x = this.pos.x;
        this.oldPos.y = this.pos.y;

        if(!Number.isNaN(vel.x) && !Number.isNaN(vel.y)) this.pos.add(vel);
        if(!Number.isNaN(gravity.x) && !Number.isNaN(gravity.y)) this.pos.add(gravity);
    }

    constrain(w, h){
        if(this.pos.x > w - this.radius) this.pos.x = w - this.radius;
        if(this.pos.x < this.radius)     this.pos.x = this.radius;
        if(this.pos.y > h - this.radius) this.pos.y = h - this.radius;
        if(this.pos.y < this.radius)     this.pos.y = this.radius;
    }

    render(ctx, verlet){
        ctx.beginPath();
        ctx.fillStyle = this.color;

        let mouseCollision = false;
        let rad = this.radius;

        let radH = this.radiusHighlight;

        if(verlet.mousedown) radH *= 2

        if(verlet.state > 1) mouseCollision = (
           verlet.mouse.x > this.pos.x - radH &&
           verlet.mouse.x < this.pos.x + radH &&
           verlet.mouse.y > this.pos.y - radH &&
           verlet.mouse.y < this.pos.y + radH);


        switch (verlet.state) {
            case 3:
                if(mouseCollision){
                    verlet.canvas.style.cursor = "pointer";
                    rad = this.radiusHighlight;
                    ctx.fillStyle = "red";

                }
                break;

            case 4:
                if(mouseCollision){
                    verlet.canvas.style.cursor = "pointer";
                    rad = this.radiusHighlight;
                    ctx.fillStyle = "blue";
                }
                if(verlet.connectionTemp == this){
                    ctx.fillStyle = "blue";
                }
                break;

            case 6:
                if(mouseCollision){
                    verlet.canvas.style.cursor = "pointer";
                    rad = this.radiusHighlight;
                }
                if(this.fixed) ctx.fillStyle = "red";

                break;
        }

        ctx.arc(this.pos.x, this.pos.y, rad*verlet.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}
