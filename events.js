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
}

function onRelease(event){
    click = false;
}

function onMouseMove(event){
    mouseX = event.pageX;
    mouseY = event.pageY;
}

function onMouseLeave(event){
    click = false;
}

function canvasResize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}