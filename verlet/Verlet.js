/*
    Verlet.js
    Oliver Cass (c) 2021
    All Rights Reserved

    Sources:
     - https://betterprogramming.pub/making-a-verlet-physics-engine-in-javascript-1dff066d7bc5
     - I Spent a Week Making an AI's Video Game Idea - Sebastian Lague (https://www.youtube.com/watch?v=PGk0rnyTa1U)
*/

class Verlet{
    entities = [];
    connectionTemp = null;

    state = 0;
    /*
    states:
        0 - running
        1 - menu
        2 - add Dots
        3 - remove dots
        4 - connect dots
        5 - remove connections
        6 - toggle fixes
    */

    constructor(canvas){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        this.entities.push(new Entity(400)); //default user entity

        this.ui = new UI(this);
        let verlet = this;
        this.ui.addButton("Add Dot", function(){
            verlet.state = 2;
        });
        this.ui.addButton("Remove Dots", function(){
            verlet.state = 3;
        });
        this.ui.addButton("Connect Dots", function(){
            verlet.connectionTemp
            verlet.state = 4;
        });
        this.ui.addButton("Remove Connections", function(){
            verlet.state = 5;
        });
        this.ui.addButton("Toggle Fix", function(){
            verlet.state = 6;
        });
        this.ui.addButton("Resume", function(){
            verlet.state = 0;
        });

        this.ready = true;
    }

    resize(){
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    tick(){
        let w = this.canvas.width, h = this.canvas.height;
        verlet.canvas.style.cursor = "default"
        switch(this.state){
            case 2:
                if(!this.ui.showMenu) verlet.canvas.style.cursor = "pointer";
                break;
        }

        if(this.state == 0) for(let e of this.entities) e.tick(w, h);

        this.render(w, h);
    }

    render(w, h){
        let ctx = this.ctx;

        ctx.clearRect(0, 0, w, h);

        switch(this.state){
            case 2:
                ctx.beginPath();
                ctx.fillStyle = "white";
                ctx.arc(this.mouse.x, this.mouse.y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
                break;

            case 4:
                if(this.connectionTemp){
                    ctx.beginPath();
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = 2;
                    ctx.moveTo(this.connectionTemp.pos.x, this.connectionTemp.pos.y);
                    ctx.lineTo(this.mouse.x, this.mouse.y);
                    ctx.stroke();
                    ctx.closePath();
                }
                break;
        }

        for(let e of this.entities) e.render(ctx, this);

        this.ui.render(ctx);


    }

    addEntity(entity){
        this.entities.push(entity);
    }

    click(mouse, verlet){
        switch(verlet.state){
            case 0:
                //ignore
                break;

            case 1:
                //menu
                break;

            case 2:
                // add dot
                this.entities[0].dots.push(new Dot(mouse.x, mouse.y))
                break;

            case 3:
                // remove dot
                for(let e of verlet.entities){
                    for(let i = 0; i < e.dots.length; i++){
                        let d = e.dots[i];
                        let radH = d.radiusHighlight;
                        if(verlet.mousedown) radH *= 2
                        if( mouse.x > d.pos.x - radH &&
                            mouse.x < d.pos.x + radH &&
                            mouse.y > d.pos.y - radH &&
                            mouse.y < d.pos.y + radH) {

                                for(let j = 0; j < e.sticks.length; j++){
                                    if(e.sticks[j].startPoint == d || e.sticks[j].endPoint == d){
                                        e.sticks.splice(j, 1);
                                        j--;
                                    }
                                }
                                e.dots.splice(i, 1);
                            }
                    }
                }
                break;

            case 4:
                for(let e of verlet.entities){
                    for(let i = 0; i < e.dots.length; i++){
                        let d = e.dots[i];
                        if( mouse.x > d.pos.x - d.radiusHighlight &&
                            mouse.x < d.pos.x + d.radiusHighlight &&
                            mouse.y > d.pos.y - d.radiusHighlight &&
                            mouse.y < d.pos.y + d.radiusHighlight) {
                                if(verlet.connectionTemp){
                                    e.addStickObj(verlet.connectionTemp, d);

                                    verlet.connectionTemp = null;
                                }else verlet.connectionTemp = d;
                            }
                    }
                }
                break;

            case 5:
                for(let e of verlet.entities){
                    for(let i = 0; i < e.sticks.length; i++){
                        let s = e.sticks[i];
                        let left, right, up, down;
                        if(s.startPoint.pos.x < s.endPoint.pos.x) {left = s.startPoint; right = s.endPoint}
                        else {left = s.endPoint; right = s.startPoint};
                        if(s.startPoint.pos.y < s.endPoint.pos.y) {up = s.startPoint; down = s.endPoint}
                        else {up = s.endPoint; down = s.startPoint};

                        // not the best collision function for a line but whatever..
                        let radH = s.highlightWidth;
                        if(verlet.mousedown) radH *= 2
                        if(mouse.x > left.pos.x &&
                           mouse.x < right.pos.x &&
                           mouse.y > up.pos.y - radH &&
                           mouse.y < down.pos.y + radH){
                               e.sticks.splice(i, 1);
                           };
                    }
                }
                break;

            case 6:
                for(let e of verlet.entities){
                    for(let i = 0; i < e.dots.length; i++){
                        let d = e.dots[i];
                        let radH = d.radiusHighlight;
                        if(verlet.mousedown) radH *= 2
                        if( mouse.x > d.pos.x - radH &&
                            mouse.x < d.pos.x + radH &&
                            mouse.y > d.pos.y - radH &&
                            mouse.y < d.pos.y + radH) {

                                d.fixed = !d.fixed;
                            }
                    }
                }
            break;
        }
    }
    unclick(mouse, verlet){
        switch(verlet.state){
            case 0:
                //ignore
                break;

            case 1:
                //menu
                break;

            case 2:
                // add dot
                verlet.entities[0].dots.splice(verlet.entities[0].dots.length - 1, 1);
                break;

            case 3:
                break;
        }
    }
    mousemove(mouse, verlet){
        verlet.mouse = mouse;
        if(verlet.mousedown){
            switch(verlet.state){
                case 0:
                    for(let en of verlet.entities) en.mouse(mouse);
                    break;

                case 3:
                case 5:
                case 6:
                    verlet.click(mouse, verlet);
                    break;
            }
        }else{

        }
    }
}
