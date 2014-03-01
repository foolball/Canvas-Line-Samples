var clicks = 0;
var lastClick = [0, 0];

var canvas = document.getElementById('myCanvas');

// on mouse click, gets mouse position and displays it on canvas.
$(canvas).on('click', function (evt) {
    drawLine(canvas, evt);
});

// on mouse click, clear canvas
$('#clear').on('click', function () {
    clearCanvas(canvas);
});

// function to display mouse position
function writeMessage(canvas, message) {
    // clears canvas
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '18pt Calibri';
    context.fillStyle = 'black';
    context.fillText(message, 10, 25);
}

function clearCanvas(canvas) {
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// function to get mouse position
function getMousePos(canvas, evt) {
    //getBoundingClientRect(): Returns a TextRectangle object that represents the bounding rectangle of the current element.
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// draw line
function drawLine(canvas, evt) {
    var mousPos = getMousePos(canvas, evt);
    var context = canvas.getContext('2d');

    if (clicks != 1)
        clicks++;
    else {
        context.beginPath();
        context.moveTo(lastClick[0], lastClick[1]);
        context.lineTo(mousPos.x, mousPos.y);
        context.stroke();
        clicks = 0;
    }

    lastClick = [mousPos.x, mousPos.y];
   // lastClick[0] = mousPos.x;
    //lastClick[1] = mousPos.y;

    //var message = 'Mouse position: ' + mousPos.x + ',' + mousPos.y;
    //writeMessage(canvas, message);
}

