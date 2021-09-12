/*
    Entity.js
    Oliver Cass (c) 2021
    All Rights Reserved
*/

class Entity{
    dots = [];
    sticks = [];
    verlet;

    constructor(iterations=100){
        this.iterations = iterations;
    }

    addDot(x, y, velX=0, velY=0, fixed=false){
        this.dots.push(new Dot(x, y, velX, velY, fixed));
    }

    addStick(p1, p2, length){
        if(p1 >= this.dots.length || p2 >= this.dots.length) return false;
        this.sticks.push(new Stick(this.dots[p1], this.dots[p2], length));
    }

    addStickObj(p1, p2){
        this.sticks.push(new Stick(p1, p2, length));
    }

    tick(w, h, gravity){
        for(let d of this.dots) d.tick(w, h, gravity);

        for(let i = 0; i < this.iterations; i++){
            for(let d of this.dots) d.constrain(w, h);
            for(let s of this.sticks) s.tick();
        }
    }

    render(ctx, verlet){
        for(let s of this.sticks) s.render(ctx, verlet);
        for(let d of this.dots) d.render(ctx, verlet);

    }

    push(factor){
        for(let d of this.dots){
            if(d.fixed) continue;
            d.pos.add(new Vector(factor, 0));
        }
    }

    mouse(mouse){
        for(let d of this.dots){
            if(d.fixed) continue;
            let mouseVec = Vector.sub(d.pos, mouse);
            let distSq = mouseVec.magSq();
            distSq = distSq;
            if(distSq < 2000) distSq = 2000;
            if(distSq > 4000) distSq = 10000000;
            mouseVec.mult(500/distSq);
            d.pos.add(mouseVec);
        }
    }
}
