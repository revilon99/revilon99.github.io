var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
const { SerialPort, ReadlineParser } = require('serialport')

app.get("/", function(req, res){
	res.sendFile(__dirname + "/public/index.html");
});
app.get("/index.js", function(req, res){
	res.sendFile(__dirname + "/public/index.js");
});
app.get("/MKIII.glb", function(req, res){
	res.sendFile(__dirname + "/public/MKIII.glb");
});

io.on("connection", function(socket){
	/*console.log("a user connected");
	socket.on("light", function(lightOn){
		
		port.write('1');
		
		io.emit("status_update", lightOn);
	});*/
});

http.listen(3000, function(){
	console.log("listening on *:3000");
});

const port = new SerialPort({ path: 'COM5', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
// Read the port data
port.on("open", () => {
    console.log('serial port open');
});
parser.on('data', data =>{
    fromSerial(data);
    
});

let fin = {
    roll: 0.00,
    pitch: 0.00,
    yaw: 0.00,
    pressure: 0,
    current: 0
};

let count = 0;
let map = ["roll", "pitch", "yaw", "pressure", "current", "a", "w", "k", "i"];

function fromSerial(data){
    let arr = data.split(/\r\n|\n\r|\r|\n/);

    for(let i = 0; i < arr.length; i++){
        
        if(arr[i] == '') continue;
        let d = arr[i];

        if(d == "START"){
            count = 0;
        }else if(d == "END"){
            
            io.emit("update", fin);
        }else{
            fin[map[count]] = d;
            count++;
        }
    }
}
