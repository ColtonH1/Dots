var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#ffffff',
    parent: 'phaser-example',
    scene: [Hexagon]
};

var game = new Phaser.Game(config);



/*
console.log(window.innerWidth);
console.log(window.innerHeight);

var game = new Phaser.Game(config);

var hexagon;
var graphics;


function create() {
    graphics = this.add.graphics(0, 0);
    //hexagon = new Phaser.Geom.Polygon();
    drawGrid();
}


function drawGrid() {

    //size of grid is 8x8
    var rows = 8;
    var cols = 8;
    var rad = 100; //half the length of the hexagon
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    if(screenHeight > screenWidth)
    {
        rad = screenWidth / (rows + 2);
    }
    else
    {
        rad = screenHeight / (cols + 2);
    }    
    var startX = (((screenWidth / rows) / rad) * rows) + (screenWidth / rows);
    var startY = (((screenHeight / cols) / rad) * cols) + (screenHeight / cols);

    if(screenHeight > screenWidth)
    {
        rad -= rad / rows;
    }
    else
    {
        rad -= rad / cols;
    }   

    console.log(startX);
    console.log(startY);
    console.log(rad);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            var hexPoints = [];
            hexPoints = hexagonPoints(hexPoints, i, j, rad, startX, startY);
            var polygon = new Phaser.Geom.Polygon(hexPoints);
            //var polygon = this.add.Polygon(hexPoints);
            //var hex = new Phaser.Geom.Polygon(points);
            console.log(hexPoints);
            graphics.lineStyle(10, 0x000000, 10.0);
            graphics.strokePoints(polygon.points);
            console.log(polygon.points);
        }
    }
}

function hexagonPoints(hexPoints, row, col, rad, xDisplacement, yDisplacement) {


    //left most corner
    var width = (4 * (rad / 2 / Math.sqrt(3)));
    var y = rad / 2 + yDisplacement;
    var x = 0 + xDisplacement;

    //move down
    y += row * rad;
    if(col % 2 === 1)
    {
        y += rad / 2;
    }

    //move over for column
    x += col * (width * 0.75);

    //get each point
    
    hexPoints[0] = ({ x: x, y: y});
    hexPoints[1] = ({ x: x + width * 0.25, y: y - rad / 2});
    hexPoints[2] = ({ x: x + width * 0.75, y: y - rad / 2});
    hexPoints[3] = ({ x: x + width, y: y});
    hexPoints[4] = ({ x: x + width * 0.75, y: y + rad / 2});
    hexPoints[5] = ({ x: x + width * 0.25, y: y + rad / 2});
    hexPoints[6] = ({ x: x, y: y});
    

    return hexPoints;
}*/