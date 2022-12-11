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
var torque = 0;
var alpha = 0; // angular acceleration

var senseTheta = 0;
var errorOmega = 0;
var errorAbsement = 0;
var senseAlpha = 0;

var targetTheta = 0;
var targetOmega = 0;
var targetAlpha = 0;

var pGain = 5;
var iGain = 0;
var dGain = 100;
var pidGain = 4;

var encoderTicks = 18;
var encoderRes = 4;

const sensor1position = 0;
var sensor2position = (2*Math.PI/encoderTicks)/4;
var sensor1val = 0;
var sensor2val = 0;

var historyMax = 500;
var graphScaleX = 500/historyMax;
var sensor1history = [];
var sensor2history = [];
var thetaHistory = [];
var omegaHistory = [];
var torqueHistory = [];
var alphaHistory = [];
var senseThetaHistory = [];
var errorThetaHistory = [];
var errorOmegaHistory = [];
var errorAbsementHistory = [];
var targetThetaHistory = [];

var omegaLag = 5;
var absementLag = 200;

var maxTorque = 10;
var fviscous = 0.01;
var fdynamic = 0.001;
var fstatic = 0.000;

var inertia = 2000;
// var maxTheta = 10;

function sense(){
    sensor1val = Math.sin(encoderTicks*(theta-sensor1position));
    sensor2val = Math.sin(encoderTicks*(theta-sensor2position));

    senseTheta = 2*Math.PI*Math.floor(encoderRes*encoderTicks*theta/(2*Math.PI))/(encoderRes*encoderTicks);
    errorTheta = targetTheta-senseTheta;
    if(senseThetaHistory.length>=omegaLag+1){
        // errorOmega = (errorTheta-errorThetaHistory[errorThetaHistory.length-omegaLag])/omegaLag;
        // errorOmega = errorThetaHistory.slice(-omegaLag).reduce((old, now, index, me)=> old+(now-errorThetaHistory[index+errorThetaHistory.length-omegaLag-1])/(me.length), 0);
        // errorOmega = errorThetaHistory.slice(-omegaLag).reduce((old, now, index, me)=> old+(now-errorThetaHistory[index+errorThetaHistory.length-omegaLag-1])/(me.length-index+omegaLag), 0);
        // errorOmega = -omega;
        // errorOmega = -(senseTheta-thetaHistory[thetaHistory.length-omegaLag])/omegaLag
        errorOmega = -thetaHistory.slice(-omegaLag).reduce((old, now, index, me)=> old+(now-thetaHistory[index+thetaHistory.length-omegaLag-1])/(me.length), 0);
    }
    // errorAbsement = ((absementLag)*errorAbsement + errorTheta)/absementLag; //normal-ish average
    // errorAbsement += Math.sign(errorTheta); //normal-ish average
    // errorAbsement = (Math.sqrt(Math.abs(absementLag*absementLag*errorAbsement*errorTheta*1.1+1.1)))/absementLag; // not quite geo average
    // errorAbsement = errorAbsement*0.998 + errorTheta/500;
    // errorAbsement = ((absementLag)*(errorAbsement) + Math.sign(errorTheta)*Math.abs(errorTheta)**0.5)/absementLag;
    // errorAbsement = Math.sign((absementLag*errorAbsement)*Math.abs(absementLag*errorAbsement) + errorTheta*Math.abs(errorTheta))*Math.sqrt(Math.abs((absementLag*errorAbsement)*Math.abs(absementLag*errorAbsement) + errorTheta*Math.abs(errorTheta)))/absementLag;
    // errorAbsement = errorThetaHistory.reduce((now, old, ind)=> now+old/(errorThetaHistory.length-ind), 0)/(1.13*Math.log(errorThetaHistory.length+1));

    errorAbsement = 2*errorThetaHistory.slice(-absementLag).reduce((now, old)=> now+old, 0)/(absementLag+1);
    // errorAbsement = Math.sign(errorTheta)*errorThetaHistory.slice(-4).reduce((now, old)=> now*old/5, 1);
    // errorAbsement = 1*Math.sign(errorTheta)
    // console.log(errorAbsement)
}

function pee(){
    return errorTheta * pGain;
}

function eye(){
    return errorAbsement * iGain;
}

function dee(){
    return errorOmega * dGain;
}

function doCalcs(){
    torque = pidGain*(pee() + eye() + dee());
    alpha = Math.max(Math.min(torque,maxTorque),-maxTorque)/inertia;
}

function update(){
    if(interacting!=1){
        omega-=fviscous*omega;
        omega-=fdynamic*Math.sign(omega)*Math.min(1,Math.abs(omega));
        if(Math.abs(omega+=alpha) <= fstatic){
            omega = 0;
        }
        omega+= alpha;
        theta += omega;
    }
    thetaHistory.push(theta);
    omegaHistory.push(30*omega);
    torqueHistory.push(torque);
    alphaHistory.push(inertia*alpha);
    senseThetaHistory.push(senseTheta);

    errorThetaHistory.push(errorTheta);
    errorOmegaHistory.push(30*errorOmega);
    errorAbsementHistory.push(errorAbsement);

    sensor1history.push(sensor1val);
    sensor2history.push(sensor2val);

    targetThetaHistory.push(targetTheta);

    if(thetaHistory.length>historyMax){
        thetaHistory.splice(0,1);
        omegaHistory.splice(0,1);
        torqueHistory.splice(0,1);
        alphaHistory.splice(0,1);
        senseThetaHistory.splice(0,1);
        errorThetaHistory.splice(0,1);
        errorOmegaHistory.splice(0,1);
        errorAbsementHistory.splice(0,1);
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

function graph(x,y,height,labels,colors,histories){ //really should have made a "history class"
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

        ctx.fillStyle = colors[i];
        ctx.textAlign = "left"
        ctx.fillText(labels[i],x+graphScaleX*(histories[i].length-1)+4,y+yScale*yMin-yScale*histories[i][histories[i].length-1]+3);
    }
}

function drawGraphs(){
    graph(400,120,80,["s1","s2"],["lime","fuchsia"],[sensor1history,sensor2history]); //(x,y,yMin,yMax,yScale,color,history,history,history...)
    graph(400,270,100,["theta (true)", "theta (sensor)", "target"],["red","lime","lightblue","fuchsia"],[thetaHistory,senseThetaHistory,targetThetaHistory]);
    graph(400,440,120,["P","D","I"],["fuchsia","yellow","lime"],[errorThetaHistory,errorOmegaHistory,errorAbsementHistory]);
    // graph(400,600,120,["torque","alpha"],["lime","fuchsia"],[torqueHistory,alphaHistory]);
    graph(400,620,120,["alpha"],["fuchsia"],[alphaHistory]);

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