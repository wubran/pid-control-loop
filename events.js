var canvas = document.getElementById('screen');
let sliders = document.getElementsByClassName("slider");
let inboxes = document.getElementsByClassName("inbox");

for(let i=0; i<3; i++){
    sliders[i].oninput = function() {
        let numVal = parseFloat(this.value);
        pidGains[i] = numVal;
        inboxes[i].value = numVal;
    }
    inboxes[i].oninput = function() {
        let numVal = parseFloat(this.value);
        pidGains[i] = numVal;
        sliders[i].value = numVal;
    }
}

canvasResize();

window.onresize = canvasResize;
canvas.addEventListener('mousedown', onClick);
canvas.addEventListener("mouseup", onRelease);
canvas.addEventListener('mouseleave', onMouseLeave);
canvas.addEventListener('mousemove', onMouseMove);
document.addEventListener('keydown', (event) => {
    const keyName = event.key;
    switch(keyName){
        case 'Control':
            return;
        case 'm':
            mousemode+=1;
            if(mousemode>2){
                mousemode=0;
            }
            return;
        case 'Escape':

            return;
        case ' ':
            pause = !pause;
            return;
    }
}, false);


function onClick(event){
    click = true;
    dragStartX = event.pageX;
    dragStartY = event.pageY;
    if((dragStartX-encoderX)*(dragStartX-encoderX)+(dragStartY-encoderY)*(dragStartY-encoderY) < (1.1*encoderR)*(1.1*encoderR)){
        interacting = 1;
    }
    if((dragStartX-knobX)*(dragStartX-knobX)+(dragStartY-knobY)*(dragStartY-knobY) < (knobR*knobR)){
        interacting = 2;
    }
}

function onRelease(event){
    if(click){
        switch(interacting){
            case 1:
                if(thetaHistory.length>5){
                    omega = (wheelSensitivity/10)*(thetaHistory[thetaHistory.length-1]-thetaHistory[thetaHistory.length-5])/4;
                }
                break;
            case 2:
                // let radMag2 = (event.movementY*(mouseX-knobX) - event.movementX*(mouseY-knobY))
                // targetTheta-=0.0008*Math.max(Math.min(radMag2,30),-30);
                break;
            case 0:
                break;

        }
    }
    click = false;
    interacting = 0;
}

function onMouseMove(event){
    mouseX = event.pageX;
    mouseY = event.pageY;
    if(click){
        switch(interacting){
            case 1:
                // let magDivRadius = (event.movementY*event.movementY+event.movementX*event.movementX)/(event.movementY*(mouseX-encoderX) - event.movementX*(mouseY-encoderY))
                // console.log((event.movementY*event.movementY+event.movementX*event.movementX),(event.movementY*(mouseX-encoderX) - event.movementX*(mouseY-encoderY)))
                // if(isNaN(magDivRadius) || !isFinite(magDivRadius)){
                //     return;
                // }
                // theta-=magDivRadius;

                let radMag = (event.movementY*(mouseX-encoderX) - event.movementX*(mouseY-encoderY))
                theta-=wheelSensitivity*0.0004*Math.max(Math.min(radMag,30),-30)*(frameTime/30);
                // console.log(event.movementX,event.movementY)
                return;
            case 2:
                let radMag2 = (event.movementY*(mouseX-knobX) - event.movementX*(mouseY-knobY))
                targetTheta-=wheelSensitivity*0.0004*Math.max(Math.min(radMag2,30),-30);
                return;
            case 0:
                return;

        }
    }
}

function onMouseLeave(event){
    click = false;
}

function canvasResize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}