let digits = 6;
let refresh = 30; //s

document.getElementById("digits").addEventListener("change", ()=>{
    digits = Math.floor(document.getElementById("digits").value);
    if(digits < 0) digits = 0;
}, false);

document.getElementById("refresh").addEventListener("change", ()=>{
    refresh = Math.floor(document.getElementById("refresh").value);
    if(refresh < 0) refresh = 0;
}, false);

window.onload = ()=>{
    document.getElementById("number").innerHTML = randomNum(digits);
    requestAnimationFrame(update);
}

let last_update = Date.now().valueOf();

function update(){
    if(Date.now().valueOf() - last_update > refresh * 1000){
        last_update = Date.now().valueOf();
        document.getElementById("number").innerHTML = randomNum(digits);
    }

    document.getElementById("timer").style.width = `${100*(Date.now().valueOf() - last_update)/(1000 * refresh)}%`
    requestAnimationFrame(update);
}

function randomNum(digits=6){
    return Math.floor(Math.random() * Math.pow(10, digits) + 1);
}
