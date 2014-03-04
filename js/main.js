var clicks = 0;
var lastClick = [0, 0];

var canvas = document.getElementById('myCanvas');

// draws a line by getting starting and ending point based on mouse clicks.
$(canvas).on('click', function (evt) {
    drawLine(canvas, evt);
});

// on mouse click, clear canvas
$('#clear').on('click', function () {
    //drawRectangle(canvas);
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
    // reset click counter
    clicks = 0;
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

    if (clicks != 1) {
        drawRectangle(canvas, mousPos, true);
        clicks++;
    }
    else {
        context.beginPath();
        context.moveTo(lastClick[0], lastClick[1]);
        context.lineTo(mousPos.x, mousPos.y);
        context.stroke();
        drawRectangle(canvas, mousPos, false);
        clicks = 0;
    }

    lastClick = [mousPos.x, mousPos.y]; // saves the last click

    //var message = 'Mouse position: ' + mousPos.x + ',' + mousPos.y;
    //writeMessage(canvas, message);
}

// draw small rectangle indicating whether it's the beginning or end of the line
function drawRectangle(canvas, coordinates, isStart) {
    var context = canvas.getContext('2d');

    context.beginPath();
    context.rect(coordinates.x + 5, coordinates.y + 5, 20, 10);
    context.fillStyle = 'yellow';
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.stroke();

    addText(canvas, coordinates, isStart);

}

// adds 'S' for start or 'E' for end depending on when the user clicks to create a line.
function addText(canvas, coordinates, isStart) {
    var context = canvas.getContext('2d');

    context.font = '10pt Calibri';
    context.fillStyle = 'blue';
    if (isStart) // if the user click is in the beginning...
        context.fillText('S', coordinates.x + 13, coordinates.y + 14);
    else
        context.fillText('E', coordinates.x + 13, coordinates.y + 14);
}

