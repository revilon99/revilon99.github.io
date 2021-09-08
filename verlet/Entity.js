/*
    Entity.js
    Oliver Cass (c) 2021
    All Rights Reserved
*/

class Entity{
    dots = [];
    sticks = [];

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

    tick(w, h){
        for(let d of this.dots) d.tick(w, h);

        for(let i = 0; i < this.iterations; i++){
            for(let d of this.dots) d.constrain(w, h);
            for(let s of this.sticks) s.tick();
        }
    }

    render(ctx){
        for(let d of this.dots) d.render(ctx);
        for(let s of this.sticks) s.render(ctx);
    }
}
