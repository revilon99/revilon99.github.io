/*
    Dot.js
    Oliver Cass (c) 2021
    All Rights Reserved
*/

class Dot{
    constructor(x, y, velX=0, velY=0, fixed=false){
        this.pos = new Vector(x, y);
        this.oldPos = new Vector(x - velX, y - velY);

        this.friction = 0.97;
        this.groundFriction = 0.7;

        this.gravity = new Vector(0, 1);

        this.radius = 3;
        this.color = '#fff';
        this.mass = 1;

        this.fixed = fixed;
    }

    tick(w, h){
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

        this.pos.add(vel);
        this.pos.add(this.gravity);
    }

    constrain(w, h){
        if(this.pos.x > w - this.radius) this.pos.x = w - this.radius;
        if(this.pos.x < this.radius)     this.pos.x = this.radius;
        if(this.pos.y > h - this.radius) this.pos.y = h - this.radius;
        if(this.pos.y < this.radius)     this.pos.y = this.radius;
    }

    render(ctx){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}
