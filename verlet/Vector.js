/*
    Vector.js
    Oliver Cass (c) 2021
    All Rights Reserved

    should amalgomate all these at some point
*/

class Vector{
    constructor(x=0, y=0){
        this.x = x;
        this.y = y;
    }

    add(a){
        this.x += a.x;
        this.y += a.y;
    }

    static sub(a, b){
        return new Vector(a.x - b.x, a.y - b.y);
    }

    mult(factor){
        this.x *= factor;
        this.y *= factor;
    }

    distSq(a){
        return (a.x - this.x)*(a.x - this.x) + (a.y - this.y)*(a.y - this.y);
    }
    dist(a){
        return Math.sqrt(this.distSq(a));
    }
    magSq(){
        return ( this.x*this.x + this.y*this.y );
    }
    mag(){
        return Math.sqrt(this.magSq());
    }

    normalise(){
        let mag = this.mag();
        this.mult(1 / mag);
    }

    isNaN(){
        return (Number.isNaN(this.x) || Number.isNaN(this.y))
    }
}
