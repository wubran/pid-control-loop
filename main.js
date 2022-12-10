canvascolor = "rgba(19, 23, 26, 1)";
var canvas = document.getElementById('screen');
var ctx = canvas.getContext('2d');

items = []

var click = false
var mouseX = 0;
var mouseY = 0;
var pause = false;

const encoderX = 170;
const encoderY = 320;
const encoderR = 100;

var theta = 0; // angular position
var omega = 0; // angular velocity
var alpha = 0; // angular acceleration

var targetTheta = 2;
var targetOmega = 0;
var targetAlpha = 0;

var errorP = 0;
var errorI = 0;
var errorD = 0;

var encoderTicks = 18;

const sensor1position = 0;
var sensor2position = Math.PI/4;

function pee(){

}

function eye(){

}

function dee(){

}

function drawEncoder(){
    ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.arc(encoderX,encoderY,1.1*encoderR,0,2*Math.PI);
    ctx.fill();
    ctx.fillStyle = "red";
    for(let i=0; i<encoderTicks; i++){
        ctx.beginPath();
        ctx.moveTo(encoderX,encoderY);
        ctx.arc(encoderX,encoderY,encoderR,theta+i*2*Math.PI/encoderTicks,theta+(i+0.5)*2*Math.PI/encoderTicks)
        ctx.fill();
    }
    ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.arc(encoderX,encoderY,0.7*encoderR,0,2*Math.PI);
    ctx.fill();

    ctx.strokeStyle = "blue"
    ctx.beginPath();
    ctx.moveTo(encoderX,encoderY);
    ctx.lineTo(encoderX+encoderR*Math.cos(theta)/2, encoderY-encoderR*Math.sin(theta)/2)
    ctx.stroke();
}

function drawSensors(){
    ctx.fillStyle = "lime"
    ctx.beginPath()
    ctx.moveTo(encoderX+encoderR, encoderY)
    ctx.lineTo(encoderX+encoderR+20, encoderY-10)
    ctx.lineTo(encoderX+encoderR+20, encoderY+10)
    ctx.lineTo(encoderX+encoderR, encoderY)
    ctx.fill();

    ctx.fillStyle = "fuchsia"
    ctx.beginPath()
    ctx.moveTo(encoderX+encoderR*Math.cos(sensor2position), encoderY-encoderR*Math.sin(sensor2position))
    ctx.lineTo(encoderX+(encoderR+20)*Math.cos(sensor2position-0.1), encoderY-(encoderR+20)*Math.sin(sensor2position-0.1))
    ctx.lineTo(encoderX+(encoderR+20)*Math.cos(sensor2position+0.1), encoderY-(encoderR+20)*Math.sin(sensor2position+0.1))
    ctx.lineTo(encoderX+encoderR*Math.cos(sensor2position), encoderY-encoderR*Math.sin(sensor2position))
    ctx.fill();
}

function fillscreen(){
    ctx.fillStyle = canvascolor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawEncoder();
    drawSensors();
    if(pause){
        ctx.fillStyle = "rgba(255, 245, 80, 1)";
        ctx.font = canvas.width / 30 + "px Arial";
        ctx.fillText("paused", 35*canvas.width/40, 19*canvas.height/20);
    }
}


let oldTime = 0;
function loop(timestamp){
    fillscreen();
    for(var i = 0; i < items.length; i++){
        items[i].draw();
        if(!pause){
            items[i].calc(timestamp-oldTime);
        }
        oldTime = timestamp;
    }
    requestAnimationFrame(loop)
}

requestAnimationFrame(loop);