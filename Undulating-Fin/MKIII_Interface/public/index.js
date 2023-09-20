// Control
function tick(){

    // orbit operation
    document.getElementById('rig').object3D.rotation.set(
        deg2rad(camera.pitch),
        deg2rad(camera.yaw),
        deg2rad(camera.roll)
    );
    document.getElementById('rig').object3D.rotation.x += Math.PI;

    requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// Networking

let fin_params;

var socket = io();

socket.on("update", function(fin){
    fin_params = fin;
    fin.yaw *= 4.28;
    fin.pitch *= -4.28;
    fin.roll *= 4.28;

    document.getElementById('fin').setAttribute('rotation', {x: fin.roll, y: fin.yaw, z: fin.pitch});

    document.getElementById("roll").innerHTML = fin.roll;
    document.getElementById("pitch").innerHTML = fin.pitch;
    document.getElementById("yaw").innerHTML = fin.yaw;
    document.getElementById("pressure").innerHTML = fin.pressure;
    document.getElementById("current").innerHTML = fin.current;
    document.getElementById("a").innerHTML = fin.a;
    document.getElementById("w").innerHTML = fin.w;
    document.getElementById("k").innerHTML = fin.k;
    document.getElementById("i").innerHTML = fin.i;
});

let ascene = document.getElementById('3d-scene');


// Orbit Function
let fin_model = document.getElementById('fin');
let scale = 0.05;
let scale_delta = 0.01;

let orbit = false;
let orbit_origin = {
    x: 0,
    y: 0
};

let camera = {
    roll: 0,
    pitch: 180,
    yaw: 0
};

let camera_origin = {
    roll: camera.roll,
    pitch: camera.pitch,
    yaw: camera.yaw
}

ascene.addEventListener('mousedown', function(e){
    orbit = true;
    orbit_origin.x = e.clientX;
    orbit_origin.y = e.clientY;
    camera_origin = {
        roll: camera.roll,
        pitch: camera.pitch,
        yaw: camera.yaw
    }
}, false);
ascene.addEventListener('mousemove', function(e){
    if(!orbit) return;

    let dx = e.clientX - orbit_origin.x;
    let dy = -(e.clientY - orbit_origin.y);

    camera.pitch = camera_origin.pitch + dy*1;
    camera.yaw = camera_origin.yaw - dx*1;
}, false);
window.addEventListener('mouseup', function(){ // window for event user moves mouse out of canvas during orbit
    orbit = false;
}, false);
ascene.addEventListener('wheel', function(e){
   scale -= e.deltaY/100 * scale_delta;
   fin_model.setAttribute('scale', {x: scale, y: scale, z: scale});
}, false);

function deg2rad(x){
    return x*Math.PI/180;
}