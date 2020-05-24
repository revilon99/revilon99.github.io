/*
Collision.js
Oliver Cass (c) 2020
All Rights Reserved
*/

const T_EPSILON = 0.00005;

var Collision = function(){
    this.reset = function(){
        this.t = Infinity;
    }

    this.copy = function(col){
        this.t = col.t;
        this.nVelX = col.nVelX;
        this.nVelY = col.nVelY;
    }

    this.getNewX = function(curX, velX){
        if(this.t > T_EPSILON) return curX + velX * (this.t - T_EPSILON);
        else return curX;
    }
    this.getNewY = function(curY, velY){
        if(this.t > T_EPSILON) return curY + velY * (this.t - T_EPSILON);
        else return curY;
    }

    this.getImpactX = function(curX, speedX){
        return curX + speedX * this.t;
    }
    this.getImpactY = function(curY, speedY){
        return curY + speedY * this.t;
    }

    this.reset();
}

var CollisionPhysics = new (function(){
    this.temp = new Collision();

    this.pointIntersectsRectangleOuter = function(x, y, velX, velY, radius, x1, y1, x2, y2, timeLimit, response){
        response.reset();

        //Right Border
        this.pointIntersectsLineVertical(x, y, velX, velY, radius, x2, timeLimit, this.temp);
        if(this.temp.t < response.t) response.copy(this.temp);

        //Left Border
        this.pointIntersectsLineVertical(x, y, velX, velY, radius, x1, timeLimit, this.temp);
        if(this.temp.t < response.t) response.copy(this.temp);

        //Top Border
        this.pointIntersectsLineHorizontal(x, y, velX, velY, radius, y1, timeLimit, this.temp);
        if(this.temp.t < response.t) response.copy(this.temp);

        //Bottom Border
        this.pointIntersectsLineHorizontal(x, y, velX, velY, radius, y2, timeLimit, this.temp);
        if(this.temp.t < response.t) response.copy(this.temp);
    }

    this.pointIntersectsLineVertical = function(x, y, velX, velY, radius, lineX, timeLimit, response){
        response.reset();

        if(velX == 0) return;

        var distance;
        if(lineX > x) distance = lineX - x - radius;
        else distance = lineX - x + radius;

        var t = distance / velX;
        if(t > 0 && t <= timeLimit){
            response.t = t;
            response.nVelX = -velX;
            response.nVelY = velY;
        }
    }

    this.pointIntersectsLineHorizontal = function(x, y, velX, velY, radius, lineY, timeLimit, response){
        response.reset();

        if(velY == 0) return;

        var distance;
        if(lineY > y) distance = lineY - y - radius;
        else distance = lineY - y + radius;

        var t = distance / velY;
        if(t > 0 && t <= timeLimit){
            response.t = t;
            response.nVelX = velX;
            response.nVelY = -velY;
        }
    }

    this.pointIntersectsMovingPoint = function (p1X, p1Y, p1SpeedX, p1SpeedY, p1Radius,
                                                p2X, p2Y, p2SpeedX, p2SpeedY, p2Radius,
                                                timeLimit, p1Response, p2Response){
        p1Response.reset();
        p2Response.reset();

        var t = this.pointIntersectsMovingPointDetection(p1X, p1Y, p1SpeedX, p1SpeedY, p1Radius,
                                                         p2X, p2Y, p2SpeedX, p2SpeedY, p2Radius);
        
        if(t > 0 && t <= timeLimit){
            this.pointIntersectsMovingPointResponse(p1X, p1Y, p1SpeedX, p1SpeedY, p1Radius,
                                                    p2X, p2Y, p2SpeedX, p2SpeedY, p2Radius, 
                                                    p1Response, p2Response, t);
        }
   }

   this.pointIntersectsMovingPointDetection = function(p1X, p1Y, p1SpeedX, p1SpeedY, p1Radius,
                                                       p2X, p2Y, p2SpeedX, p2SpeedY, p2Radius){
        //Rearrange the parameters to set up the quadratic equation
        var centerX = p1X - p2X;
        var centerY = p1Y - p2Y;
        var speedX = p1SpeedX - p2SpeedX;
        var speedY = p1SpeedY - p2SpeedY;
        var radius = p1Radius + p2Radius;
        var radiusSq = radius * radius;
        var speedXSq = speedX * speedX;
        var speedYSq = speedY * speedY;
        var speedSq = speedXSq + speedYSq;

        //solve quadratic equation for collision time t
        var termB2minus4ac = radiusSq * speedSq - (centerX * speedY - centerY * speedX) * (centerX * speedY - centerY * speedX);
        if(termB2minus4ac < 0){
            //no intersection
            return Infinity;
        }

        var termMinusB = -speedX * centerX - speedY * centerY;
        var term2a = speedSq;
        var rootB2minus4ac = Math.sqrt(termB2minus4ac);
        var sol1 = (termMinusB + rootB2minus4ac) / term2a;
        var sol2 = (termMinusB - rootB2minus4ac) / term2a;

        //return smallest positive t, else return infinity
        if(sol1 > 0 && sol2 > 0) return Math.min(sol1, sol2);
        else if(sol1 > 0) return sol1;
        else if(sol2 > 0) return sol2;
        else return Infinity;
    }

   this.pointIntersectsMovingPointResponse = function(p1X, p1Y, p1SpeedX, p1SpeedY, p1Radius,
                                                      p2X, p2Y, p2SpeedX, p2SpeedY, p2Radius,
                                                      p1Response, p2Response, t){
        //Update the detected collisison time in CollisionResponse
        p1Response.t = t;
        p2Response.t = t;

        //Get the point of impact to form the line of collision
        var p1ImpactX = p1Response.getImpactX(p1X, p1SpeedX);
        var p1ImpactY = p1Response.getImpactY(p1Y, p1SpeedY);
        var p2ImpactX = p2Response.getImpactX(p2X, p2SpeedX);
        var p2ImpactY = p2Response.getImpactY(p2Y, p2SpeedY);

        //Direction along the line of collision is P, normal is N
        //get the direction along the line of collision
        var lineAngle = Math.atan2(p2ImpactY - p1ImpactY, p2ImpactX - p1ImpactX);

        //Project velocities from (x, y) to (p, n)
        var result = this.rotate(p1SpeedX, p1SpeedY, lineAngle);
        var p1SpeedP = result[0];
        var p1SpeedN = result[1];
        result = this.rotate(p2SpeedX, p2SpeedY, lineAngle);
        var p2SpeedP = result[0];
        var p2SpeedN = result[1];

        //Collision possible only if p1SpeedP - p2SpeedP > 0
        //Needed if the two balls overlap in their initial positions
        //Do not declare collision, so that they continue their
        //Course of movement until they are separated
        if(p1SpeedP - p2SpeedP <= 0){
            p1Response.reset();
            p2Response.reset();
            return;
        }

        //Assume that mass is proportional to the cube of the radius
        var p1Mass = p1Radius * p1Radius * p1Radius;
        var p2Mass = p2Radius * p2Radius * p2Radius;
        var diffMass = p1Mass - p2Mass;
        var sumMass = p1Mass + p2Mass;

        var p1SpeedPAfter, p1SpeedNAfter, p2SpeedPAfter, p2SpeedNAfter;

        p1SpeedPAfter = (diffMass*p1SpeedP + 2*p2Mass*p2SpeedP) / sumMass;
        p2SpeedPAfter = (2*p1Mass*p1SpeedP - diffMass*p2SpeedP) / sumMass;

        p1SpeedNAfter = p1SpeedN;
        p2SpeedNAfter = p2SpeedN;

        result = this.rotate(p1SpeedPAfter, p1SpeedNAfter, -lineAngle);
        p1Response.nVelX = result[0];
        p1Response.nVelY = result[1];
        result = this.rotate(p2SpeedPAfter, p2SpeedNAfter, -lineAngle);
        p2Response.nVelX = result[0];
        p2Response.nVelY = result[1];
   }

   this.rotate = function(x, y, theta){
       var sinTheta = Math.sin(theta);
       var cosTheta = Math.cos(theta);
       return [
            x * cosTheta + y * sinTheta,
            -x * sinTheta + y * cosTheta
       ];
   }
})();