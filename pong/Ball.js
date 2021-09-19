/*
    pong/Ball.js
    Oliver Cass (c) 2021
    All Rights Reserved
*/

class Ball{
    constructor(x, y, param, balls, delete_ball, canvas){
        this.x = x;
        this.y = y;

        this.velX = 2 * Math.random() * param.MAX_SPEED - param.MAX_SPEED;
        this.velY = 2 * Math.random() * param.MAX_SPEED - param.MAX_SPEED;

        this.color = Ball.randomColor();

        this.radius = param.MIN_RADIUS + Math.random() * (param.MAX_RADIUS - param.MIN_RADIUS);

        this.canvas = canvas;
        this.param = param;

        while(!this.canSpawn(balls)){
            this.radius -= DELTA_R;
            if(this.radius < MIN_RADIUS) delete_ball(this);
        }

        this.earliestCollisionResponse = new Collision();

        this.temp = new Collision();
        this.me = new Collision();
        this.other = new Collision();
    }

    tick(time){
        if(this.velX > this.param.MAX_SPEED) this.velX = this.param.MAX_SPEED;
        if(this.velY > this.param.MAX_SPEED) this.velY = this.param.MAX_SPEED;

        if(this.earliestCollisionResponse.t <= time){
            this.x = this.earliestCollisionResponse.getNewX(this.x, this.velX);
            this.y = this.earliestCollisionResponse.getNewY(this.y, this.velY);
            this.velX = this.earliestCollisionResponse.nVelX;
            this.velY = this.earliestCollisionResponse.nVelY;
        }else{
            this.x += this.velX * time;
            this.y += this.velY * time;
        }

        this.earliestCollisionResponse.reset();
    }

    render(ctx){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    ballIntersect(ball, timeLimit){
        CollisionPhysics.pointIntersectsMovingPoint(
        this.x, this.y, this.velX, this.velY, this.radius,
        ball.x, ball.y, ball.velX, ball.velY, ball.radius,
        timeLimit, this.me, this.other);

        if(this.other.t < ball.earliestCollisionResponse.t) ball.earliestCollisionResponse.copy(this.other);
        if(this.me.t < this.earliestCollisionResponse.t) this.earliestCollisionResponse.copy(this.me);
    }

    borderIntersect(timeLimit){
        CollisionPhysics.pointIntersectsRectangleOuter(
            this.x, this.y, this.velX, this.velY, this.radius,
            0, 0, this.canvas.clientWidth, this.canvas.clientHeight,
            timeLimit, this.temp);
        if(this.temp.t < this.earliestCollisionResponse.t) this.earliestCollisionResponse.copy(this.temp);
    }

    pointCollision(x, y, point_size){
        return ((x - this.x)*(x - this.x) + (y - this.y)*(y - this.y) < (this.radius + point_size)*(this.radius + point_size));
    }

    ballCollision(ball){
        return ((this.x - ball.x)*(this.x - ball.x) + (this.y - ball.y)*(this.y - ball.y) < (this.radius + ball.radius)*(this.radius + ball.radius));
    }

    canSpawn(balls){
        var canspawn = true;
        if(this.x < this.radius || this.x > this.canvas.clientWidth  - this.radius ||
           this.y < this.radius || this.y > this.canvas.clientHeight - this.radius) canspawn = false;

        for(var b of balls){
            if(b == this) continue;
            if(b == null) continue;
            if(this.ballCollision(b)) canspawn = false;
        }

        return canspawn;
    }

    static randomColor(){
        return 'rgb(' + (128 + Math.floor(Math.random()*127)) + ", " + (128 + Math.floor(Math.random()*127)) + ", " + (128 + Math.floor(Math.random()*127)) + ")";
    }
}
