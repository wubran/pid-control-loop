var canvas = document.getElementById('screen');

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
                // console.log(magDivRadius,event.movementY*(mouseX-encoderX),event.movementX*(mouseY-encoderY))
                // if(isNaN(magDivRadius)){
                //     return;
                // }
                // theta-=magDivRadius;
                let radMag = (event.movementY*(mouseX-encoderX) - event.movementX*(mouseY-encoderY))
                console.log(radMag)
                theta-=0.0005*radMag;
                return;
            case 2:
                let radMag2 = (event.movementY*(mouseX-knobX) - event.movementX*(mouseY-knobY))
                console.log(radMag2)
                targetTheta-=0.0005*radMag2;
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