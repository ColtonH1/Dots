class Level extends Phaser.Scene {
    constructor() 
    {
        super("Level");
    }
hexGraphics;
    create()
    {
        console.log("creating 1");
        
        this.hexGraphics = this.add.graphics();
        this.rows = 8;
        this.cols = 8;
        this.gridInfo = new Grid(this.rows, this.cols, this.hexGraphics, this);
        this.circleInfo = new Circle(this.rows, this.cols, this.gridInfo.getHexSize(), this.gridInfo.getHexCenter(), this);

        //this.input.on("pointerdown", this.select, this);
        //this.input.on("pointermove", this.drawPath, this);
        //this.input.on("pointerup", this.stop, this);
    }


}

class Grid
{
    constructor(rows, cols, hexGraphics, level)
    {
        this.rows = rows;
        this.cols = cols;
        this.hexGraphics = hexGraphics;
        this.level = level;

        this.create();
    }

    create()
    {
        console.log("creating 2");

        var screenWidth = window.innerWidth; //size of screen width
        var screenHeight = window.innerHeight; //size of screen height

        this.size = this.SetHexSize(screenWidth, screenHeight); //get size of hexagon        
        this.hexCenter = [];

        var startX = (screenWidth / this.size) + (screenWidth / this.rows); //offset of x
        var startY = (screenHeight / this.size) + (screenHeight / this.cols); //offset of y

        this.drawGrid(startX, startY);
    }

    getHexCenter()
    {
        return this.hexCenter;
    }

    getHexSize()
    {
        return this.size;
    }
    
    drawGrid(startX, startY) 
    {

        
        var firstCenter = {x: startX, y: startY}; //center of first hexagon

        //draw hexagon starting at coordinates (0, 0) in the center of the first hexagon
        for(let i = 0; i < this.rows; i++)
        {
            this.hexCenter[i] = [];
            for (let j = 0; j < this.cols; j++) 
            {
                this.hexCenter[i][j] = 
                {
                    isEmpty: false,
                    pixelCoord: this.drawHexagon(i, j, firstCenter)  
                }


            }
        }
    }

    //left corner of hexagon
    hexCorner(center, i)
    {
        //left most corner
        var deg = 60 * i + 30; //degree
        var rad = Math.PI / 180 * deg; //radian
        var x = center.x + this.size * Math.cos(rad);
        var y = center.y + this.size * Math.sin(rad);   
        return {x: x, y: y};   
    }

    drawHexagon(rowNum, colNum, center) 
    { 
        //console.log("drawing");
        var hexPoints = []; //array to hold the hexagon's coordinates
        var width = Math.sqrt(3) * this.size;
        var height = 2 * this.size;
        var vertDistance = height * .75;
        var thisCenter = {x: width * rowNum + center.x, y: vertDistance * colNum + center.y};   
        var y = this.size / 2;
        var x = 0;
    
        //move down
        y += rowNum * vertDistance;
        //if column is odd, move down an extra bit that is equal to half the 'size'
        if(colNum % 2 === 1)
        {
            thisCenter = {x: width * rowNum + center.x + (width / 2), y: vertDistance * colNum + center.y};   
        }
        
    
        //move over for column
        x += colNum * width;

             

        //8 times to close the hexagon
        for(let i = 0; i < 8; i++)
        {
            hexPoints[i] = this.hexCorner(thisCenter, i);
            //console.log(center.y);
        }


        //draw hexagon
        var polygon = new Phaser.Geom.Polygon(hexPoints);
        this.hexGraphics.lineStyle(10, 0x000000, 10.0);
        this.hexGraphics.strokePoints(polygon.points);


        return thisCenter;
    }

    SetHexSize(screenWidth, screenHeight)
    {
        var sizeOfHex;

        //get the smaller of the two
        if(screenHeight > screenWidth)
        {
            sizeOfHex = screenWidth / (this.rows + 5);
        }
        else
        {
            sizeOfHex = screenHeight / (this.cols + 5);
        }    
    
        //change size. If not changed, then the hexagons would take up the entire width and heighth given; we want it smaller
        if(screenHeight > screenWidth)
        {
            sizeOfHex -= sizeOfHex / this.rows;
        }
        else
        {
            sizeOfHex -= sizeOfHex / this.cols;
        }   

        return sizeOfHex;
    }
}

class Circle
{
    constructor(rows, cols, hexSize, hexCenter, level)
    {
        this.rows = rows;
        this.cols = cols;
        this.hexSize = hexSize;
        this.hexCenter = hexCenter;
        this.level = level;

        this.create();
    }

    create()
    {
        this.circleArr = []; //array to hold the circles created
        this.setCircle();
    }
    
    getCircles()
    {
        return this.circleArr;
    }

    setCircle()
    {
        var size = this.hexSize * .375; //make circles proportiontate to the hexagon size
        for(let i = 0; i < this.rows; i++)
        {
            this.circleArr[i] = [];
            for (let j = 0; j < this.cols; j++) 
            {
                var center = {x: this.hexCenter[i][j].pixelCoord.x, y: this.hexCenter[i][j].pixelCoord.y};
                this.circleArr[i][j] = this.drawCircle(center, size, i, j);            
            }
        }
    }

    drawCircle(center, size, i, j)
    {
        var color = this.chooseColor(); //choose random color

        let circle = this.level.add.circle(center.x, center.y, size, color).setInteractive(); //create interactive circle
        circle.setDataEnabled(); //allow data to be entered
        circle.setData({ 'color': color, 'x': i, 'y': j }); //set color and coordinates

        //to help with debugging
        this.level.add.text(center.x - (this.hexSize / 2), center.y, '(' + i + ', ' + j + ')', { font: '16px Courier', fill: '#000000' });

        return circle;
    }

    //randomly choose color
    chooseColor()
    {
        switch (Phaser.Math.Between(0, 7))
        {
            case 0:
                return 0xFF5733; //orange
            case 1:
                return 0x55FF33; //green
            case 2:
                return 0x33FFE6; //teal
            case 3:
                return 0x333FFF; //blue
            case 4:
                return 0xFF33F3; //pink
            case 5:
                return 0xAC33FF; //purple
            case 6:
                return 0xFF3333; //red
            case 7:
                return 0xFFF333; //yellow
            
        }

        
    }
}