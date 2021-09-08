/*
    Stick.js
    Oliver Cass (c) 2021
    All Rights Reversed
*/

class Stick{
    constructor(p1, p2, length){
        this.startPoint = p1;
        this.endPoint = p2;
        this.stiffness = 1;
        this.color = "#fff";

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

        if(!this.startPoint.fixed){
            this.startPoint.pos.x -= offsetX * m1;
            this.startPoint.pos.y -= offsetY * m1;
        }
        if(!this.endPoint.fixed){
            this.endPoint.pos.x += offsetX * m2;
            this.endPoint.pos.y += offsetY * m2;
        }
    }

    render(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.moveTo(this.startPoint.pos.x, this.startPoint.pos.y);
        ctx.lineTo(this.endPoint.pos.x, this.endPoint.pos.y);
        ctx.stroke();
        ctx.closePath();
    }
}
