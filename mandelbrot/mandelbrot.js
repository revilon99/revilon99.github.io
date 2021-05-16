/*
mandelbrot.js
*/

const MAX_ITER = 500;

function mandelbrot(cx, cy){
	let x = 0, y = 0, i = 0, d, nx, ny;
	do{
		nx = x*x - y*y;
		ny = 2*x*y;
		
		x = nx + cx;
		y = ny + cy;
		
		d = x*x + y*y;
		i++;
	}while(d <= 4 && i < MAX_ITER);
	return [i, d <= 4];
}