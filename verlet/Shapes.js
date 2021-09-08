/*
    Shapes.js
    Oliver Cass (c) 2021
    All Rights Reserved

    A Collection of entity shapes
*/

class Box extends Entity{
    constructor(x, y, width, height, velX=0, velY=0, iterations=100){
        super(iterations);

        this.addDot(x, y, velX, velY);
        this.addDot(x + width, y);
        this.addDot(x + width, y + height);
        this.addDot(x, y + height);

        this.addStick(0, 1);
        this.addStick(1, 2);
        this.addStick(2, 3);
        this.addStick(3, 0);
        this.addStick(3, 1);
    }
}

class Cloth extends Entity{
    constructor(x, y, rows, columns, offset, iterations=100){
        super(iterations);

        for(let i = 0; i < rows; i++){
            for(let j = 0; j < columns; j++){
                this.addDot(x + j*offset, y + i*offset, 0, 0, (i == 0));
            }
        }

        for(let i = 0; i < this.dots.length; i++){
            if(i % columns != columns - 1) this.addStick(i, i + 1);
            if(Math.floor(i / columns) < rows) this.addStick(i, i + columns);
        }
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
            if(distSq < 100) distSq = 100;
            if(distSq > 4000) distSq = 10000000;
            mouseVec.mult(1000/distSq);
            d.pos.add(mouseVec);
        }
    }
}
