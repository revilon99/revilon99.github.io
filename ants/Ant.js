/*
Ant.js
NatureJS
Oliver Cass (c) 2020
All Rights Reserved
*/

const Ant = function(){
	this.newTarget = function(previous){
		var options = graph.getDirectConnectedNodes(this.node);
		
		var choice = null;
		if(options.length === 1) choice = options[0];
		else if(this.state == 0 && !this.foundFood){
			var p = [];
			
			//generate choice probabilities
			for(var i = 0; i < options.length; i++){
				if(options[i] === previous) p[i] = 0.1;
				else p[i] = 10;
			}
			for(var i = 0; i < options.length; i++){
				if(options[i] === previous) continue;
				var edge = null;
				for(var j = 0; j < graph.edges.length; j++){
					if(graph.edges[j][0] === this.node && graph.edges[j][1] === options[i]) edge = j;
					else if(graph.edges[j][1] === this.node && graph.edges[j][0] === options[i]) edge = j;
				}
				p[i] += pheromones[edge];
			}
			
			//normalize probabilty array
			var sum = 0;
			for(var a of p) sum += a;
			for(var i = 0; i < p.length; i++) p[i] = p[i] / sum;
			
			var pr = [];
			for(var i = 0; i < p.length; i++){
				pr[i] = 0;
				for(var j = i; j >= 0; j--) pr[i] += p[j];
			}
			
			var num = Math.random();
			for(var i = 0; i < pr.length; i++){
				if(num <= pr[i]) {
					choice = options[i];
					break;
				}
			}
		}else if(this.state == 0 && this.foundFood){
			this.pathPosition++;
			choice = this.path[this.pathPosition];
		}else if(this.state == 1 || this.state == 2){
			this.pathPosition--;
			choice = this.path[this.pathPosition];
		}
		
		return choice;
	}
	this.targetDelta = function(){
		if(this.targetNode === this.node){
			this.ticks = 0;
			this.targetTicks = 1;
			return {x: 0, y: 0};
		}
		
		var dx = graph.nodes[this.targetNode].x - graph.nodes[this.node].x;
		var dy = graph.nodes[this.targetNode].y - graph.nodes[this.node].y;
		var hyp = Math.sqrt( dx*dx + dy*dy );
				
		var delta = {
			x: this.speed * (dx / hyp),
			y: this.speed * (dy / hyp)			
		}
		
		this.ticks = 0;
		this.targetTicks = Math.floor(dx / delta.x);
		
		if(delta.x === NaN || delta.y === NaN) {
			delta.x = 0;
			delta.y = 0;
			this.targetTicks = 0;
			return delta;
		}
		
		
		var edge = null;
		for(var i = 0; i < graph.edges.length; i++){
			if(graph.edges[i][0] === this.node && graph.edges[i][1] === this.targetNode) { edge = i; break; }
			else if(graph.edges[i][1] === this.node && graph.edges[i][0] === this.targetNode) { edge = i; break; }
		}
		if(this.state === 1){
			pheromones[edge] += 3*this.targetTicks;
		}
		
		return delta;
	}
	
	this.x = graph.nodes[0].x;
	this.y = graph.nodes[0].y;
	this.speed = (param.antSpeed + 0.2*(Math.random() - 0.5)) / Math.sqrt(canvas.clientWidth*canvas.clientHeight);
	this.node = 0;
	this.state = 0;
	this.food = 0;
	this.path = [0];
	this.pathPosition = 0;
	this.foundFood = false;
	this.targetNode = this.newTarget(-1);
	this.delta = this.targetDelta();
	/*
	0 - looking for food (wanders until food is found)
	1 - return home leaving pheromone
	2 - return home
	*/
	
	this.offset = {
		x: Math.floor( Math.random() * param.antOffset),
		y: Math.floor( Math.random() * param.antOffset)
	}
	
	this.tick = function(){
		this.ticks++;
		if(this.ticks >= this.targetTicks){
			this.x = graph.nodes[this.targetNode].x;
			this.y = graph.nodes[this.targetNode].y;
			var previousNode = this.node;
			this.node = this.targetNode;
			
			if(this.state == 0) {
				if(!this.foundFood) this.path.push(this.node);
				
				for(var i = 0; i < food.length; i++) {
					if(food[i].node === this.node && food[i].amount >= 5) {
						this.state = 1;
						this.food = 5;
						food[i].amount -= 5;
						this.pathPosition = this.path.length - 2;
						this.foundFood = true;
						break;
					}else if(food[i].node === this.node && food[i].amount < 5 && food[i].node === this.path[this.path.length - 1]){
						this.foundFood = false;
						this.state = 2;
						this.pathPosition = this.path.length - 2;
						break;					
					}
				}
			}
			
			if(this.node === 0){
				this.state = 0;
				this.pathPosition = 0;
				if(!this.foundFood) this.path = [0];
				if(this.food > 0) {
					collectedFood += this.food;
					this.food = 0;
				}
			}
			
			if(this.path.length > graph.edges.length * 1.2) {
				this.state == 2;
				this.pathPosition = this.path.length - 2;
				console.log('i got lost');
			}
			
			this.targetNode = this.newTarget(previousNode);
			this.delta = this.targetDelta();
			
			return;
		}
		
		this.x += this.delta.x;
		this.y += this.delta.y;
	}
	
	this.color = function(){
		if(!param.debug) return '#000';
		switch(this.state){
			case 0:
				if(this.foundFood) return '#4242ad';
				else return '#000';
			case 1:
				return '#fff';
			case 2:
				return '#00fff7';
		}
	}
}