// Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
function Shape(x, y, w, h, fill) {
    // This is a very simple and unsafe constructor. 
    // All we're doing is checking if the values exist.
    // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 20;
    this.h = h || 10;
    this.fill = fill || '#AAAAAA';
}

function Line(startx, starty, endx, endy) {
    // This is a very simple and unsafe constructor. 
    // All we're doing is checking if the values exist.
    // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
    this.startx = startx || 0;
    this.starty = starty || 0;
    this.endx = endx || 10;
    this.endy = endy || 10;

}

// Draws this shape to a given context
Shape.prototype.draw = function (ctx) {
    ctx.fillStyle = this.fill;
    ctx.fillRect(this.x, this.y, this.w, this.h);
}

Line.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.moveTo(this.startx, this.starty);
    ctx.lineTo(this.endx, this.endy);
    ctx.stroke();
}

// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function (mx, my) {
    // All we have to do is make sure the Mouse X,Y fall in the area between
    // the shape's X and (X + Height) and its Y and (Y + Height)
    return (this.x <= mx) && (this.x + this.w >= mx) &&
          (this.y <= my) && (this.y + this.h >= my);
}


function CanvasState(canvas) {

    // **** First some setup! ****

    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    // This complicates things a little but but fixes mouse co-ordinate problems
    // when there's a border or padding. See getMouse for more detail
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
    if (document.defaultView && document.defaultView.getComputedStyle) {
        this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
        this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
        this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
        this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
    }

    // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
    // They will mess up mouse coordinates and this fixes that
    var html = document.body.parentNode;
    this.htmlTop = html.offsetTop;
    this.htmlLeft = html.offsetLeft;
    // **** Keep track of state! ****

    this.valid = false; // when set to true, the canvas will redraw everything
    this.shapes = [];  // the collection of things to be drawn
    this.dragging = false; // Keep track of when we are dragging the current selected object.
    // In the future we could turn this into an array for multiple selection
    this.selection = null;
    this.dragoffx = 0; // See mousedown and mousemove events for explanation
    this.dragoffy = 0;

    // used for drawing line
    this.clicks = 0;
    this.lines = []; // the collection of lines to be drawn
    this.startClick = []; // saves the mouse coordinates when user clicks the starting postion of the line.

    // **** Then events! ****

    // This is an example of a closure!
    // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
    // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
    // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
    // This is our reference!
    var myState = this;

    // on mouse click, clear canvas
    $('#clear').on('click', function () {
        myState.clear();
    });

    //fixes a problem where double clicking causes text to get selected on the canvas
    canvas.addEventListener('selectstart', function (e) { e.preventDefault(); return false; }, false);

    // Up, down, and move are for dragging
    canvas.addEventListener('click', function (e) {
        var mouse = myState.getMouse(e);
        var mx = mouse.x;
        var my = mouse.y;
        var shapes = myState.shapes;
        myState.addShape(new Shape(mouse.x - 10, mouse.y - 10, 20, 20,
                               'rgba(0,255,0,.6)'));

        //check to see if user click is the beginning or end of the line.
        if (myState.clicks != 1) {
            // save begninning mouse position
            myState.startClick[0] = mx;
            myState.startClick[1] = my;
            myState.clicks++;
        }
        else {
            myState.addLine(new Line(myState.startClick[0], myState.startClick[1], mx, my));
            myState.clicks = 0;
        }

        // havent returned means we have failed to select anything.
        // If there was an object selected, we deselect it
        if (myState.selection) {
            myState.selection = null;
            myState.valid = false; // Need to clear the old selection border
        }
    }, true);

    // **** Options! ****

    this.selectionColor = '#CC0000';
    this.selectionWidth = 2;
    this.interval = 30;
    setInterval(function () { myState.draw(); }, myState.interval);
}

CanvasState.prototype.addShape = function (shape) {
    this.shapes.push(shape);
    this.valid = false;
}

CanvasState.prototype.addLine = function (line) {
    this.lines.push(line);
    this.valid = false;
}

CanvasState.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
}

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function () {
    // if our state is invalid, redraw and validate!
    if (!this.valid) {
        var ctx = this.ctx;
        var shapes = this.shapes;
        var lines = this.lines;
        this.clear();

        // ** Add stuff you want drawn in the background all the time here **

        // draw all shapes
        var l = shapes.length;
        for (var i = 0; i < l; i++) {
            var shape = shapes[i];
            // We can skip the drawing of elements that have moved off the screen:
            if (shape.x > this.width || shape.y > this.height ||
          shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
            shapes[i].draw(ctx);
        }

        // draw all lines
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            lines[i].draw(ctx);
        }

        // draw selection
        // right now this is just a stroke along the edge of the selected Shape
        /*
        if (this.selection != null) {
        ctx.strokeStyle = this.selectionColor;
        ctx.lineWidth = this.selectionWidth;
        var mySel = this.selection;
        ctx.strokeRect(mySel.x, mySel.y, mySel.w, mySel.h);
        }
        */
        // ** Add stuff you want drawn on top all the time here **

        this.valid = true;
    }
}

// Creates an object with x and y defined,
// set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky,
// we have to worry about padding and borders
CanvasState.prototype.getMouse = function (e) {
    var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

    // Compute the total offset
    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    // Add padding and border style widths to offset
    // Also add the <html> offsets in case there's a position:fixed bar
    offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
    offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;

    // We return a simple javascript object (a hash) with x and y defined
    return { x: mx, y: my };
}

// If you dont want to use <body onLoad='init()'>
// You could uncomment this init() reference and place the script reference inside the body tag
init();

function init() {
    var s = new CanvasState(document.getElementById('canvas1'));
    //s.addShape(new Shape(40, 40, 50, 50)); // The default is gray
    //s.addShape(new Shape(60, 140, 40, 60, 'lightskyblue'));
    // Lets make some partially transparent
    //s.addShape(new Shape(80, 150, 60, 30, 'rgba(127, 255, 212, .5)'));
    //s.addShape(new Shape(125, 80, 30, 80, 'rgba(245, 222, 179, .7)'));
}












/*

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

*/