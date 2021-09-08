/*
    Verlet.js
    Oliver Cass (c) 2021
    All Rights Reserved

    https://betterprogramming.pub/making-a-verlet-physics-engine-in-javascript-1dff066d7bc5
*/

class Verlet{
    entities = [];


    constructor(canvas, n){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        let resize = this.resize;
        this.resize();
        this.canvas.addEventListener('resize', resize, false);

        let mousemove = this.mousemove;
        let entities  = this.entities;
        this.canvas.addEventListener('mousemove', function(e){
            let mouse = new Vector(e.offsetX, e.offsetY);
            for(let en of entities) en.mouse(mouse);
        }, false)

        this.ready = true;
    }

    resize(){
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    tick(){
        let w = this.canvas.width, h = this.canvas.height;

        for(let e of this.entities) e.tick(w, h);

        this.render(w, h);
    }

    render(w, h){
        let ctx = this.ctx;

        ctx.clearRect(0, 0, w, h);

        for(let e of this.entities) e.render(ctx);
    }

    addEntity(entity){
        this.entities.push(entity);
    }

    mousemove(e){


    }
}
