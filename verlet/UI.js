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

    lastTouch = 0;
    touchTime = 20;
    touchTemp = new Vector();

    buttons = [];

    constructor(verlet, centerRad=3, centerDist=50, defaultRad=10, highlightRad=15){
        this.verlet = verlet;

        this.centerRad    = centerRad;
        this.centerDist   = centerDist;
        this.defaultRad   = defaultRad;
        this.highlightRad = highlightRad;

        this.centerRad    *= verlet.scale;
        this.centerDist   *= verlet.scale;
        this.defaultRad   *= verlet.scale;
        this.highlightRad *= verlet.scale;

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
            verlet.mouseupEvt(verlet);
        }, false);
        verlet.canvas.addEventListener('mousedown', function(){
            verlet.mousedownEvt(verlet);
        }, false);
        verlet.canvas.addEventListener('mouseup', function(){
            verlet.mouseupEvt(verlet);
        }, false);

        // mobile events
        verlet.canvas.addEventListener('touchstart', function(e){
            _this.fullscreen();
            let touch = e.targetTouches[0]; // only allow for 1 touch
            let rect = verlet.canvas.getBoundingClientRect();
            let mouse = new Vector(touch.clientX - rect.left, touch.clientY - rect.top);
            verlet.mousedownEvt(verlet, mouse);
            _this.touchTimeout = new Date().getTime();
            _this.touchTemp = mouse;
        }, false);
        verlet.canvas.addEventListener('touchmove', function(e){
            let touch = e.targetTouches[0]; // only allow for 1 touch
            let rect = verlet.canvas.getBoundingClientRect();
            let mouse = new Vector(touch.clientX - rect.left, touch.clientY - rect.top);
            _this.touchTemp = mouse;
            _this.mousemove(mouse, verlet, _this);
        }, false);
        verlet.canvas.addEventListener('touchend', function(){
            let dt = new Date().getTime() - _this.lastTouch;
            if(dt < _this.touchTime) _this.click(_this.touchTemp, verlet, _this);
            verlet.mouseupEvt(verlet, _this.touchTemp);
        }, false);
        verlet.canvas.addEventListener('touchcancel', function(){
            verlet.mouseupEvt(verlet);
        }, false);



        this.menuTextDiv = document.createElement("div");
        this.menuTextDiv.style = `
            position: absolute;
            left: calc(50vw - ${this.centerDist * 3}px);
            top: calc(100vh - 90px);
            width: ${this.centerDist * 6}px;
            color: white;
            font-size: 20px;
            font-family: 'Arial';
            text-align: center;
        `;

        this.menuText = document.createElement("a");
        this.menuTextDiv.classList.add("noSelect");
        this.menuText.classList.add("noSelect");
        this.menuText.innerHTML = "Double tap to begin..";
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
            verlet.state = 1;
            this.menuText.innerHTML = "";
        }else {
            verlet.click(mouse, verlet);
            let state = verlet.state;
            setTimeout(function(){
                if(ui.showMenu) verlet.unclick(mouse, verlet, state);
            }, ui.doubleClickTime*1.5);
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
                    this.menuTextDiv.style.left = `${ui.menuLoc.x - 3*ui.centerDist}px`;
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
            this.fillCircle(ctx, this.menuLoc.x, this.menuLoc.y, this.centerRad);

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

    fullscreen(){
        var doc = window.document;
        var docEl = doc.documentElement;

        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;

        if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            let p = requestFullScreen.call(docEl);
        }
    }

    static isMobile(){
        return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
                || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4)))

    }
}
