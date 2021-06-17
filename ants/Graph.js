/*
Graph.js
NatureJS
Oliver Cass (c) 2020
All Rights Reserved
*/

const Graph = function(){
	this.nodes = [];
	this.edges = [];
	
	this.generate = function(minNodes=10, maxNodes=40, minRadius=0.001, margin=0.05, numClosedLoops=4, minAngle=15){
		minAngle = minAngle * (Math.PI / 180);
		var numNodes = Math.floor( Math.random() * (maxNodes - minNodes) ) + minNodes;
		for(var i = 0; i < numNodes; i++) {
			var newNodeFound = false;
			var nNode = null;
			
			do{
				nNode = {
					x: Math.random() * (1 - 2*margin) + margin,
					y: Math.random() * (1 - 2*margin) + margin
				}
				
				newNodeFound = true;
				for(var n of this.nodes) if(this.nodeDistSq(n, nNode) < minRadius*minRadius) newNodeFound = false;
			}while(!newNodeFound);
			
			
			this.nodes.push(nNode);
		}
		console.log('Nodes Generated...');
		
		//generate edges of closest nodes
		for(var i = 0; i < this.nodes.length; i++){
			var closest = null;
			var dist = Infinity;
			
			for(var j = 0; j < this.nodes.length; j++){
				if(i === j) continue;
				var d = this.nodeDistSq(this.nodes[i], this.nodes[j]);
				if(d < dist) {
					dist = d;
					closest = j;
				}
			}
			
			if(closest == null) continue;
			
			var edge  = [i, closest];
			var edge2 = [closest, i];
			
			var unique = true;
			for(var e of this.edges){
				if(e[0] === i && e[1] === closest) unique = false;
				else if(e[1] === i && e[0] === closest) unique = false;
				
				if(!unique) break;
			}
			
			if(unique) this.edges.push(edge);
		}
		console.log('Closest Edges Generated...');
		
		//connect closest two nodes that are unconnected
		for(var i = 0; i < this.nodes.length; i++){
			var closest = null;
			var dist = Infinity;
			var connectedNodes = this.getAllConnectedNodes(i);
			if(connectedNodes.length >= this.nodes.length - 1) break;
			
			for(var j = i+1; j < this.nodes.length; j++){
				
				if(connectedNodes.includes(j)) continue;
				
				var d = this.nodeDistSq(this.nodes[i], this.nodes[j]);
				
				if(d > dist) continue;
				
				//check if new edge would intersect with any other edge
				var intersect = false;
				for(var e of this.edges){
					if(this.intersects(this.nodes[i].x, this.nodes[i].y, this.nodes[j].x, this.nodes[j].y,  this.nodes[e[0]].x, this.nodes[e[0]].y, this.nodes[e[1]].x, this.nodes[e[1]].y)){
						intersect = true;
						break;
					}
				}
				if(intersect) continue;
				
				//check if new edge if too close to existing edges
				var tooClose = false;
				var currentNodes = this.getDirectConnectedNodes(i);
				for(var n of currentNodes){
					var angle = this.findAngle(this.nodes[n], this.nodes[i], this.nodes[j])
					if(angle < minAngle)  {
						tooClose = true;
						break;
					}
				}
				currentNodes = this.getDirectConnectedNodes(j);
				for(var n of currentNodes){
					var angle = this.findAngle(this.nodes[n], this.nodes[j], this.nodes[i])
					if(angle < minAngle)  {
						tooClose = true;
						break;
					}
				}
				if(tooClose) continue;
				
				if(d < dist) {
					dist = d;
					closest = j;
				}
			}
			
			if(closest == null) continue;
			
			var edge  = [i, closest];
			
			var unique = true;
			for(var e of this.edges){
				if(e[0] === i && e[1] === closest) unique = false;
				else if(e[1] === i && e[0] === closest) unique = false;
				
				if(!unique) break;
			}
			if(unique) this.edges.push(edge);
		}
		console.log('Closest Graphs Generated...');
		
		// connect two furthest away nodes without intersection
		// at this point all nodes are connected, but there should be no closed loops
		var jump = Math.ceil(numNodes / numClosedLoops);
		for(var i = 0; i < this.nodes.length; i += jump){
			var furthest = null;
			var dist = 0;
			
			for(var j = 0; j < this.nodes.length; j++){
				if(i === j) continue;
				
				//check if new edge would intersect with any other edge
				var intersect = false;
				for(var e of this.edges){
					if(this.intersects(this.nodes[i].x, this.nodes[i].y, this.nodes[j].x, this.nodes[j].y,  this.nodes[e[0]].x, this.nodes[e[0]].y, this.nodes[e[1]].x, this.nodes[e[1]].y)){
						intersect = true;
						break;
					}
				}
				if(intersect) continue;
				
				//check if new edge if too close to existing edges
				var tooClose = false;
				var currentNodes = this.getDirectConnectedNodes(i);
				for(var n of currentNodes){
					var angle = this.findAngle(this.nodes[n], this.nodes[i], this.nodes[j])
					if(angle < minAngle)  {
						tooClose = true;
						break;
					}
				}
				currentNodes = this.getDirectConnectedNodes(j);
				for(var n of currentNodes){
					var angle = this.findAngle(this.nodes[n], this.nodes[j], this.nodes[i])
					if(angle < minAngle)  {
						tooClose = true;
						break;
					}
				}
				if(tooClose) continue;
				
				var d = this.nodeDistSq(this.nodes[i], this.nodes[j]);
				if(d > dist){
					furthest = j;
					dist = d;
				}
			}
			if(furthest == null) continue;
			
			var edge  = [i, furthest];
			var edge2 = [furthest, i];
			
			var unique = true;
			for(var e of this.edges){
				if(e[0] === i && e[1] === furthest) unique = false;
				else if(e[1] === i && e[0] === furthest) unique = false;
				
				if(!unique) break;
			}
			if(unique) {
				this.edges.push(edge);
			}
		}
		console.log('Closed Loops Generated..');
	}
	
	this.nodeDistSq = function(a, b){
		return (a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y);
	}
	
	this.connected = function(a, b){ //a and b are the index of the node in nodes
		var connections = this.getAllConnectedNodes(a);
		return connections.includes(b);
	}

	this.getAllConnectedNodes = function(a){
		var connectedNodes = this.getDirectConnectedNodes(a);
		
		for(var i = 0; i < connectedNodes.length; i++){
			var iConnections = this.getDirectConnectedNodes(connectedNodes[i]);
			
			for(var j = 0; j < iConnections.length; j++){
				if(!connectedNodes.includes(iConnections[j]) && iConnections[j] != a && iConnections[j] != connectedNodes[i]) {
					connectedNodes.push(iConnections[j]);
				}
			}
		}
		
		return connectedNodes;
	}

	this.getDirectConnectedNodes = function(a){ //a and b are the index of the node in nodes
		var connectedNodes = [];
		for(var e of this.edges){
			if(e[0] === a) connectedNodes.push(e[1]);
			else if(e[1] === a) connectedNodes.push(e[0]);
		}
		return connectedNodes;
	}
	
	// returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
	// https://stackoverflow.com/a/24392281
	this.intersects = function(a,b,c,d,p,q,r,s) {
	  var det, gamma, lambda;
	  det = (c - a) * (s - q) - (r - p) * (d - b);
	  if (det === 0) {
		return false;
	  } else {
		lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
		gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
		return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
	  }
	}
	this.findAngle = function(A,B,C) {
		var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
		var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
		var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
		return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
	}
};
