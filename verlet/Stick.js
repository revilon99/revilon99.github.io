/*
    Stick.js
    Oliver Cass (c) 2021
    All Rights Reversed
*/

class Stick{
    static WIDTH = 2;
    static HIGHLIGHTWIDTH = 4;

    constructor(p1, p2, length){
        this.startPoint = p1;
        this.endPoint = p2;
        this.stiffness = 1.0;
        this.color = "#fff";
        this.width = Stick.WIDTH;
        this.highlightWidth = Stick.HIGHLIGHTWIDTH;

        if(!length) this.length = this.startPoint.pos.dist(this.endPoint.pos);
        else this.length = length;
    }

    tick(){
        let dx = this.endPoint.pos.x - this.startPoint.pos.x;
        let dy = this.endPoint.pos.y - this.startPoint.pos.y;


        let dist = Math.sqrt(dx*dx + dy*dy);
        let diff = (this.length - dist)/dist * this.stiffness;

        let offsetX = dx*diff*0.5;
        let offsetY = dy*diff*0.5;

        let m1 = this.startPoint.mass + this.endPoint.mass;
        let m2 = this.startPoint.mass / m1;
        m1 = this.endPoint.mass / m1;

        if(!this.startPoint.fixed && !Number.isNaN(offsetX * m1) && !Number.isNaN(offsetY * m1)){
            this.startPoint.pos.x -= offsetX * m1;
            this.startPoint.pos.y -= offsetY * m1;
        }
        if(!this.endPoint.fixed && !Number.isNaN(offsetX * m2) && !Number.isNaN(offsetY * m2)){
            this.endPoint.pos.x += offsetX * m2;
            this.endPoint.pos.y += offsetY * m2;
        }
    }

    render(ctx, verlet) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;


        let mouseCollision = false;
        let width = this.width;

        if(verlet.state > 1) {
            let left, right, up, down;
            if(this.startPoint.pos.x < this.endPoint.pos.x) {left = this.startPoint; right = this.endPoint}
            else {left = this.endPoint; right = this.startPoint};
            if(this.startPoint.pos.y < this.endPoint.pos.y) {up = this.startPoint; down = this.endPoint}
            else {up = this.endPoint; down = this.startPoint};

            // not the best collision function for a line but whatever..
            mouseCollision = (
               verlet.mouse.x > left.pos.x &&
               verlet.mouse.x < right.pos.x &&
               verlet.mouse.y > up.pos.y - this.highlightWidth &&
               verlet.mouse.y < down.pos.y + this.highlightWidth);
       }


        switch (verlet.state) {
            case 5:
                if(mouseCollision){
                    verlet.canvas.style.cursor = "pointer";
                    width = this.highlightWidth;
                    ctx.strokeStyle = "red";

                }
                break;
        }

        ctx.lineWidth = width*verlet.scale;
        ctx.moveTo(this.startPoint.pos.x, this.startPoint.pos.y);
        ctx.lineTo(this.endPoint.pos.x, this.endPoint.pos.y);
        ctx.stroke();
        ctx.closePath();
    }

    refreshLength(){
        this.length = this.startPoint.pos.dist(this.endPoint.pos);
    }
}
