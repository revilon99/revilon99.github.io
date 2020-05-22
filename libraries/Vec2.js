/*
Vec2.js
Oliver Cass (c) 2020
All Rights Reserved
*/

const Vec2 = function(x, y){
    this.x = x||0;
    this.y = y||0;

    this.add = function(B){
        this.x += B.x;
        this.y += B.y;
    }
    this.sub = function(B){
        this.x -= B.x;
        this.y -= B.y;
    }
    this.mult = function(factor){
        this.x *= factor;
        this.y *= factor;
    }
    this.divide = function(factor){
        if(factor == 0) return;
        this.x /= factor;
        this.y /= factor;
    }

    this.normalize = function(){
        var factor = Math.sqrt(this.mag());
        this.divide(factor);
    }
    this.mag = function(){
        return this.x*this.x + this.y*this.y;
    }

    this.limit = function(factor){
        if(this.x > factor) this.x = factor;
        if(this.x < -factor) this.x = -factor;
        if(this.y > factor) this.y = factor;
        if(this.y < -factor) this.y = -factor;
    }

}

const Vec2D = new (function(){
    this.add = function(A, B){
        return new Vec2(A.x + B.x, A.y + B.y);
    }
    this.sub = function(A, B){
        return new Vec2(A.x - B.x, A.y - B.y);
    }
    this.dist2 = function(A, B){
        return (A.x - B.x)*(A.x - B.x) + (A.y - B.y)*(A.y - B.y);
    }
})();