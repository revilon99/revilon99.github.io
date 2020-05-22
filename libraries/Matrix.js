/*
Matrix.js
Oliver Cass (c) 2020
All Rights Reserved
*/

const Matrix = new (function(){
    this.multiply = function(A, B){
        var aRows = A.length;
        var aColumns = A[0].length;
        var bRows = B.length;
        var bColumns = B[0].length;

        if(aColumns != bRows) return false;

        var C = new Array(aRows);

        for(var i = 0; i < aRows; i++){
            C[i] = [];
            for(var j = 0; j < bColumns; j++){
                C[i][j] = 0.0;
            }
        }

        for(var i = 0; i < aRows; i++){
            for(var j = 0; j < bColumns; j++){
                for(var k = 0; k < aColumns; k++){
                    C[i][j] += A[i][k] * B[k][j];
                }
            }
        }

        return C;
    }

    this.rotation = function(theta){
        return [
            [Math.cos(theta), -Math.sin(theta)],
            [Math.sin(theta),  Math.cos(theta)]
        ];
    }
})();