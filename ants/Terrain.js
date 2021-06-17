/*
Terrain.js
NatureJS
Oliver Cass (c) 2020
All Rights Reserved
*/

const Terrain = new (function(){
	this.generate = function(canvas, graph){
		var ctx = canvas.getContext('2d');
			
		for(var x = 0; x < canvas.clientWidth; x += 3){
			for(var y = 0; y < canvas.clientHeight; y += 3){
				var num = Math.floor( Math.random() * 8 );
				switch(num){
					case 0:
						ctx.fillStyle = "#30690e";
						break;
					case 1:
						ctx.fillStyle = '#489c16';
						break;
					case 2:
						ctx.fillStyle = '#3d9608';
						break;
					case 3:
						ctx.fillStyle = '#47b009';
						break;
					case 4:
						ctx.fillStyle = '#41821b';
						break;
					case 5:
						ctx.fillStyle = '#356917';
						break;
					case 6:
						ctx.fillStyle = '#295e09';
						break;
					case 7:
						ctx.fillStyle = '#307805';
						break;
				}
				ctx.fillRect(x, y, 3, 3);
			}
		}
		
		/*
		for(var x = 0; x < canvas.clientWidth; x++){
			for(var y = 0; y < canvas.clientHeight; y++){
				var count = 0;
				for(var e of graph.edges){
					var dist = distToSegmentSquared({x: (x / canvas.clientWidth), y: (y / canvas.clientHeight)}, graph.nodes[e[0]], graph.nodes[e[1]]);
					if(dist < (param.antOffset*2 / canvas.clientWidth)*(param.antOffset*2 / canvas.clientWidth)) {
						count++;
						var num = Math.floor( Math.random() * 8 );
						switch(num){
							case 0:
								ctx.fillStyle = "#472a0e";
								break;
							case 1:
								ctx.fillStyle = '#63401c';
								break;
							case 2:
								ctx.fillStyle = '#593715';
								break;
							case 3:
								ctx.fillStyle = '#593614';
								break;
							default:
								ctx.fillStyle = '#593714';
								break;
						}
					}
				}
				
				if(count > 0) ctx.fillRect(x, y, 1, 1);
			}
		}
		*/
		ctx.lineWidth = param.antOffset*2 + 4;
		for(var e of graph.edges){
			ctx.strokeStyle = "#472a0e";
			ctx.beginPath();
			
			ctx.moveTo(graph.nodes[e[0]].x*canvas.clientWidth, graph.nodes[e[0]].y*canvas.clientHeight);
			ctx.lineTo(graph.nodes[e[1]].x*canvas.clientWidth, graph.nodes[e[1]].y*canvas.clientHeight);
			ctx.stroke();
			ctx.closePath();		
		}
		
		for(var n of graph.nodes){
			ctx.fillStyle = '#472a0e';
			ctx.beginPath();
			ctx.moveTo(n.x * canvas.clientWidth, n.y * canvas.clientHeight);
			ctx.arc(n.x * canvas.clientWidth, n.y * canvas.clientHeight, param.antOffset + 2, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.closePath();
		}
		return ctx.getImageData(0, 0, canvas.clientWidth, canvas.clientHeight);
	}
	//https://stackoverflow.com/a/1501725
	function sqr(x) { return x * x }
	function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
	function distToSegmentSquared(p, v, w) {
	  var l2 = dist2(v, w);
	  if (l2 == 0) return dist2(p, v);
	  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
	  t = Math.max(0, Math.min(1, t));
	  return dist2(p, { x: v.x + t * (w.x - v.x),
						y: v.y + t * (w.y - v.y) });
	}
	function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }
})();