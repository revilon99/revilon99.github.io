/*
    verlet/UI.js
    Oliver Cass (c) 2021
    All Rights Reserved

    A simple script that creates a circular UI system on a double click
*/

class UI{
    verlet;

    lastClick = 0;
    doubleClickTime = 200;
    showMenu = false;
    menuLoc = new Vector();
    menuTextDiv;
    menuText;

    centreRad = 3;
    centerDist = 50;
    defaultRad = 10;
    highlightRad = 15;

    buttons = [];

    constructor(verlet){
        this.verlet = verlet;

        let resize = this.resize;
        this.resize();
        verlet.canvas.addEventListener('resize', resize, false);

        let _this = this;

        verlet.canvas.addEventListener('click', function(e){
            let mouse = new Vector(e.offsetX, e.offsetY);
            verlet.mouse = mouse;
            _this.click(mouse, verlet, _this);
        }, false);
        verlet.canvas.addEventListener('mousemove', function(e){
            let mouse = new Vector(e.offsetX, e.offsetY);
            _this.mousemove(mouse, verlet, _this);
        }, false);
        verlet.canvas.addEventListener('mouseout', function(){
            verlet.mouse = new Vector(-100, -100);
        }, false);
        verlet.canvas.addEventListener('mousedown', function(){
            verlet.mousedown = true;
        }, false);
        verlet.canvas.addEventListener('mouseup', function(){
            verlet.mousedown = false;
        }, false);

        this.menuTextDiv = document.createElement("div");
        this.menuTextDiv.style = `
            position: absolute;
            left: 100px;
            top: 100px;
            width: ${this.centerDist * 4}px;
            color: white;
            font-size: 20px;
            font-family: 'Arial';
            text-align: center;
        `;

        this.menuText = document.createElement("a");
        this.menuTextDiv.appendChild(this.menuText);
        document.body.appendChild(this.menuTextDiv);
    }

    addButton(name, click){
        this.buttons.push({name: name, highlight: false, click: click})
    }

    resize(){
        this.verlet.canvas.width = this.verlet.canvas.clientWidth;
        this.verlet.canvas.height = this.verlet.canvas.clientHeight;
    }

    click(mouse, verlet, ui){
        let dt = new Date().getTime() - ui.lastClick;

        if(ui.showMenu){
            let clicked = -1;

            let theta = 360 / ui.buttons.length;
            for(let i = 0; i < ui.buttons.length; i++){
                let x = ui.menuLoc.x + ui.centerDist*Math.sin((theta*i*Math.PI)/180);
                let y = ui.menuLoc.y - ui.centerDist*Math.cos((theta*i*Math.PI)/180);

                if(
                    mouse.x > x - ui.highlightRad &&
                    mouse.x < x + ui.highlightRad &&
                    mouse.y > y - ui.highlightRad &&
                    mouse.y < y + ui.highlightRad) {
                        clicked = i;
                        break;
                    }
            }

            if(clicked == -1) ui.showMenu = false;
            else {
                ui.buttons[clicked].click(verlet);
                ui.showMenu = false;
                this.menuText.innerHTML = "";
            }
        }else if(dt < ui.doubleClickTime) { // double click
            for(let b of this.buttons) b.highlight = false;

            ui.showMenu = true;
            ui.menuLoc = mouse;
            if(verlet.state < 1) verlet.state = 1;
        }else {
            verlet.click(mouse, verlet);
            setTimeout(function(){
                if(ui.showMenu) verlet.unclick(mouse, verlet);
            }, ui.doubleClickTime);
        }

        ui.lastClick = new Date().getTime();
    }

    mousemove(mouse, verlet, ui){
        if(ui.showMenu){
            let highlight = false;
            let theta = 360 / ui.buttons.length;
            for(let i = 0; i < ui.buttons.length; i++){
                let x = ui.menuLoc.x + ui.centerDist*Math.sin((theta*i*Math.PI)/180);
                let y = ui.menuLoc.y - ui.centerDist*Math.cos((theta*i*Math.PI)/180);

                ui.buttons[i].highlight = (
                    mouse.x > x - ui.highlightRad &&
                    mouse.x < x + ui.highlightRad &&
                    mouse.y > y - ui.highlightRad &&
                    mouse.y < y + ui.highlightRad);

                if(ui.buttons[i].highlight){
                    highlight = true;
                    this.menuText.innerHTML = ui.buttons[i].name;
                    this.menuTextDiv.style.left = `${ui.menuLoc.x - 2*ui.centerDist}px`;
                    this.menuTextDiv.style.top = `${ui.menuLoc.y + 1.5*ui.centerDist}px`;
                    break;
                }
            }

            if(!highlight) this.menuText.innerHTML = "";
        }else{
            verlet.mousemove(mouse, verlet);
        }
    }

    render(ctx){
        if(this.showMenu){
            //hide background slightly
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, this.verlet.canvas.width, this.verlet.canvas.height)

            // draw menu
            ctx.fillStyle = "white";

            //draw center
            this.fillCircle(ctx, this.menuLoc.x, this.menuLoc.y, this.centreRad);

            //draw buttons
            let theta = 360 / this.buttons.length;

            for(let i = 0; i < this.buttons.length; i++){
                let rad = this.defaultRad;
                if(this.buttons[i].highlight) {
                    rad = this.highlightRad;

                }

                this.fillCircle(ctx, this.menuLoc.x + this.centerDist*Math.sin((theta*i*Math.PI)/180), this.menuLoc.y - this.centerDist*Math.cos((theta*i*Math.PI)/180), rad);
            }
        }
    }

    fillCircle(ctx, x, y, rad){
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}
