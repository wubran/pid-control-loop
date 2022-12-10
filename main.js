canvascolor = "rgba(19, 23, 26, 1)";
var canvas = document.getElementById('screen');
var ctx = canvas.getContext('2d');

items = []

var click = false
var mouseX = 0;
var mouseY = 0;
var dragStartX = 0;
var dragStartY = 0;
var interacting = 0; // 1 is encoder
var pause = false;

const encoderX = 170;
const encoderY = 320;
const encoderR = 100;

const knobX = 170;
const knobY = 520;
const knobR = 60;

var theta = 0; // angular position
var omega = 0; // angular velocity
var alpha = 0; // angular acceleration

var senseTheta = 0;
var senseOmega = 0;
var senseAlpha = 0;

var targetTheta = 0;
var targetOmega = 0;
var targetAlpha = 0;

var errorP = 0;
var errorI = 0;
var errorD = 0;

var pGain = 1;
var iGain = 1;
var dGain = 1;

var encoderTicks = 18;

const sensor1position = 0;
var sensor2position = (2*Math.PI/encoderTicks)/4;
var sensor1val = 0;
var sensor2val = 0;

var historyMax = 500;
var graphScaleX = 500/historyMax;
var sensor1history = [];
var sensor2history = [];
var thetaHistory = [];
var senseThetaHistory = [];
var targetThetaHistory = [];

function sense(){
    sensor1val = Math.sin(encoderTicks*(theta+sensor1position));
    sensor2val = Math.sin(encoderTicks*(theta+sensor2position));

    senseTheta = 2*Math.PI*Math.floor(encoderTicks*theta/(2*Math.PI))/encoderTicks;
    errorP = targetTheta-senseTheta;
}

function pee(){
    return errorP * pGain;
}

function eye(){
    return 0;
}

function dee(){
    return 0;
}

function doCalcs(){
    let torque = pee() + eye() + dee();
    alpha = 0.0005*torque;
}

function update(){
    if(interacting!=1){
        omega += alpha;
        theta += omega;
    }
    thetaHistory.push(theta);
    senseThetaHistory.push(senseTheta);
    sensor1history.push(sensor1val);
    sensor2history.push(sensor2val);
    targetThetaHistory.push(targetTheta);
    if(thetaHistory.length>historyMax){
        thetaHistory.splice(0,1);
        senseThetaHistory.splice(0,1);
        sensor1history.splice(0,1);
        sensor2history.splice(0,1);
        targetThetaHistory.splice(0,1);
    }
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
        ctx.arc(encoderX,encoderY,encoderR,-theta+i*2*Math.PI/encoderTicks,-theta+(i+0.5)*2*Math.PI/encoderTicks)
        ctx.fill();
    }
    ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.arc(encoderX,encoderY,0.7*encoderR,0,2*Math.PI);
    ctx.fill();

    ctx.strokeStyle = "blue"
    ctx.beginPath();
    ctx.moveTo(encoderX+0.4*encoderR*Math.cos(theta), encoderY-0.4*encoderR*Math.sin(theta));
    ctx.lineTo(encoderX+0.6*encoderR*Math.cos(theta), encoderY-0.6*encoderR*Math.sin(theta));
    ctx.stroke();

    ctx.strokeStyle = "orange"
    ctx.beginPath();
    ctx.moveTo(encoderX,encoderY);
    for(let i=0; Math.abs(i)<Math.abs(theta); i+=0.05*Math.sign(theta-i)){
        // ctx.lineTo(encoderX+0.4*encoderR*i*Math.cos(i)/(i+1),encoderY-0.4*encoderR*i*Math.sin(i)/(i+1)); // use x/(x+1) asymptote
        ctx.lineTo(encoderX+0.4*encoderR*i*Math.cos(i)/(theta),encoderY-0.4*encoderR*i*Math.sin(i)/(theta));
    }
    ctx.stroke();

    ctx.strokeStyle = "lime"
    ctx.beginPath();
    ctx.moveTo(encoderX,encoderY);
    for(let i=0; Math.abs(i)<Math.abs(theta-targetTheta); i+=0.05*Math.sign(theta-i-targetTheta)){
        // ctx.lineTo(encoderX+0.4*encoderR*i*Math.cos(i)/(i+1),encoderY-0.4*encoderR*i*Math.sin(i)/(i+1)); // use x/(x+1) asymptote
        ctx.lineTo(encoderX+0.4*encoderR*(i)*Math.cos(i+targetTheta)/(theta-targetTheta),encoderY-0.4*encoderR*(i)*Math.sin(i+targetTheta)/(theta-targetTheta));
    }
    ctx.stroke();
}

function drawKnob(){
    ctx.fillStyle = "lightgray";
    ctx.beginPath()
    ctx.arc(knobX,knobY,knobR,0,2*Math.PI);
    ctx.fill();
    ctx.strokeStyle = "blue"
    ctx.beginPath();
    ctx.moveTo(knobX, knobY);
    ctx.lineTo(knobX+knobR*Math.cos(targetTheta), knobY-knobR*Math.sin(targetTheta));
    ctx.stroke();
}

function graph(x,y,height,colors,...histories){ //really should have made a "history class"
    let yMin = histories[0][0];
    let yMax = histories[0][0];
    for(let history of histories){
        yMin = Math.min(yMin,...history);
        yMax = Math.max(yMax,...history);
    }
    let yScale = 1
    if(yMax-yMin != 0){
        yScale = height/(yMax-yMin);
    }
    // axes
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x,y-1.1*yScale*(yMax-yMin))
    ctx.moveTo(x,y);
    ctx.lineTo(x+graphScaleX*historyMax,y);
    ctx.stroke();

    // labels
    let ticks = 5;
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.font = 12 + "px Arial";
    for(let i=0; i<ticks+1; i++){
        ctx.beginPath();
        ctx.moveTo(x-5,y-i*yScale*(yMax-yMin)/ticks);
        ctx.lineTo(x+5,y-i*yScale*(yMax-yMin)/ticks);
        ctx.stroke();
        ctx.fillText(Math.round(100*(i*(yMax-yMin)/ticks+yMin))/100,x-10,y-i*yScale*(yMax-yMin)/ticks+4);
    }

    // graph
    for(let i=0; i<histories.length; i++){
        ctx.beginPath();
        ctx.strokeStyle = colors[i];
        ctx.moveTo(x+graphScaleX,y+yScale*yMin-yScale*histories[i][0])
        for(let j=1; j<histories[i].length; j++){
            ctx.lineTo(x+graphScaleX*j,y+yScale*yMin-yScale*histories[i][j])
        }
        ctx.stroke();
    }
}

function drawGraphs(){
    graph(400,120,80,["red","lime"],sensor1history,sensor2history); //(x,y,yMin,yMax,yScale,color,history,history,history...)
    graph(400,330,150,["red","lime","lightblue"],thetaHistory,senseThetaHistory,targetThetaHistory);

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
    drawKnob();
    drawSensors();
    drawGraphs();
    if(pause){
        ctx.fillStyle = "rgba(255, 245, 80, 1)";
        ctx.font = canvas.width / 30 + "px Arial";
        ctx.fillText("paused", 35*canvas.width/40, 19*canvas.height/20);
    }
}


let oldTime = 0;
function loop(timestamp){
    fillscreen();
    if(!pause){
        sense();
        doCalcs();
        update();
    }
    oldTime = timestamp;
    requestAnimationFrame(loop)
}

requestAnimationFrame(loop);