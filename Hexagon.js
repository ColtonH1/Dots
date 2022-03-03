class Hexagon extends Phaser.Scene {

    constructor() {
        super({
            key: 'Hexagon',
            
        })
    }

graphics;
lineGraphics;
circleGraphics;
hexagonCoord = []; //Hexagon coordinates
circleArr = [[]];
drag; //the circle clicked on
selected;
rows;
cols;
circleMatrix;
    create()
    {
        //size of grid is 8x8
        this.rows = 8;
        this.cols = 8;
        var screenWidth = window.innerWidth; //size of screen width
        var screenHeight = window.innerHeight; //size of screen height
        var rad; //half the length of  the hexagon
        var num = 0;
        

        this.graphics = this.add.graphics();
        this.lineGraphics = this.add.graphics();
        this.circleGraphics = this.add.graphics();
      
        rad = this.getGridSize();

        //set starting positions a certain amount away from the screen
        var startX = (((screenWidth / this.rows) / rad) * this.rows) + (screenWidth / this.rows);
        var startY = (((screenHeight / this.cols) / rad) * this.cols) + (screenHeight / this.cols);

        //i is for each row and j is for each column
        for (let i = 0; i < this.rows; i++) 
        {
            for (let j = 0; j < this.cols; j++) 
            {
                var hexagonCenter = this.drawGrid(i, j, rad, startX, startY);
                this.hexagonCoord.push([i, hexagonCenter.x], [j, hexagonCenter.y]);
                var circle = this.drawCircles(hexagonCenter, i, j);

                //console.log(circle);

                //this.circleArr[i].push(circle);
                
                //console.log([circle.getData('x')] + [circle]);
                
                //this.circleArr.push([circle.getData('x')]); 
                
                if(this.circleArr.length === i )
                {
                    this.circleArr.push([]);
                    this.circleArr[i].push([circle]); 
                }
                else
                {
                    this.circleArr[i].push([circle]);  
                }
                //this.circleArr[i].push([circle]);  
 
                console.log('[' + i + ',' + j + '] = ' + this.circleArr[i][j]);
                //this.circleArr[i][j].push([circle]); 

                /*
                if(this.circleArr.length != i)
                {
                    Phaser.Utils.Array.AddAt(this.circleArr[i], ([circle.getData('x'), ([circle.getData('y'), ([circle])])]), num);  
                }
                else
                {
                    console.log("first");
                    this.circleArr.push([circle.getData('x'), [circle.getData('y'), [circle]]]); 
                }*/
                
                //console.log(this.circleArr[2][0]);

            }
            //num = 0;
        }

        //console.log(Phaser.Utils.Array.Matrix.CheckMatrix([this.circleMatrix]));

        //this.circleMatrix = Phaser.Utils.Array.Matrix;
        //console.log(this.circleArr.length);
        for (let i = 0; i < this.circleArr.length; i++) {
            // get the size of the inner array
            var innerArrayLength = this.circleArr[i].length;
            // loop the inner array
            for (let j = 0; j < innerArrayLength; j++) {
                //console.log('[' + i + ',' + j + '] = ' + this.circleArr[i][j]);
                //console.log(Phaser.Utils.Array.Matrix.MatrixToString(this.circleMatrix));
            }
        }
    }

    update () {
        //this.time.timeScale = .025;
        this.physics.world.timeScale = 0.5; // physics

        //console.log(this.physics.world.timeScale);
    }

    getGridSize()
    {
        var screenWidth = window.innerWidth; //size of screen width
        var screenHeight = window.innerHeight; //size of screen height
        var rad;

        //get the smaller of the two
        if(screenHeight > screenWidth)
        {
            rad = screenWidth / (this.rows + 2);
        }
        else
        {
            rad = screenHeight / (this.cols + 2);
        }    
    
        //change rad. If not changed, then the hexagons would take up the entire width and heighth given; we want it smaller
        if(screenHeight > screenWidth)
        {
            rad -= rad / this.rows;
        }
        else
        {
            rad -= rad / this.cols;
        }   

        return rad;
    }
    
    drawGrid(row, col, rad, startX, startY) {

        var hexagonCenter;
        
        var hexPoints = []; //array to hold the hexagon's coordinates
        hexPoints = this.hexagonPoints(hexPoints, row, col, rad, startX, startY); 
        var polygon = new Phaser.Geom.Polygon(hexPoints);

        //draw hexagon
        this.graphics.lineStyle(10, 0x000000, 10.0);
        this.graphics.strokePoints(polygon.points);

        hexagonCenter = ({ x: hexPoints[0].x + (rad / 2), y: hexPoints[0].y});


        return hexagonCenter;

    }
    
    //determine the cooridnates of the hexagon
    hexagonPoints(hexPoints, row, col, rad, xDisplacement, yDisplacement) {
    
    
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
        hexPoints[7] = ({ x: x + width * 0.25, y: y - rad / 2});

        
    
        return hexPoints;
    }

    //draw the circles in the middle of the hexagon
    drawCircles(hexagonCenter, x, y)
    {
        var color = this.chooseColor();

        let circle = this.add.circle(hexagonCenter.x, hexagonCenter.y, 10, color).setInteractive(); 
        circle.setDataEnabled();
        circle.setData({ 'color': color, 'x': x, 'y': y });
        

        this.physics.add.existing(circle);

        

        const text = this.add.text(hexagonCenter.x, hexagonCenter.y, ('(' + x + ',' + y + ')'), { font: '16px Courier', fill: '#000000' });
        text.setFontSize(13);
    
        circle.on('drag', (pointer, dragX, dragY) => {
        circle.x = dragX
        circle.y = dragY
      })
        this.input.setDraggable(circle, false);
        this.input.on('pointerdown', this.startDrag, this);


        return circle;
    }

    //these next three are how to handle dragging
    startDrag(pointer, targets)
    {
        this.input.off('pointerdown', this.startDrag, this);
        this.dragObj = targets[0];
        
        //this verfies there is a color data attached to the object attempted being dragged
        try{
            //console.log(this.dragObj.getData('color'));
            this.dragObj.getData('color');
            this.input.on('pointermove', this.doDrag, this);  
        }
        catch(err)
        {
            console.log("Clicked an unclickable object");
        }
        finally
        {
            this.input.on('pointerup', this.stopDrag, this);
        }    

    }

    

    doDrag(pointer)
    {
        var neighbors = [];
        var circleCoord = [{x: -1, y: -1}]; //the element number in the circle array that is the neighbor
        var circle;
        var lineColor;
        var neighborCircleColor;
        neighbors = this.getNeighbors(this.dragObj);
        console.log(neighbors);

        //continue to draw line until user lets go
        this.lineGraphics.clear();
        this.lineGraphics.beginPath();
        this.lineGraphics.beginPath();
        this.lineGraphics.lineStyle(10, this.dragObj.getData('color'), 1.0);
        this.lineGraphics.moveTo(this.dragObj.x, this.dragObj.y);
        this.lineGraphics.lineTo(this.input.x, this.input.y);
        this.physics.add.existing(this.lineGraphics);
        this.lineGraphics.body.setSize(10, 10);

        lineColor = this.dragObj.getData('color');


        this.lineGraphics.stroke();
        this.lineGraphics.closePath();

        //check for collision with each neighbor
        for(let i = 0; i < 6; i++)
        {
            //console.log(this.input.x)
            //console.log(neighbors[i][0].x);
            circleCoord = this.checkCollision(this.input, neighbors[i][0].x, neighbors[i][0].y);          
            //console.log(circleNum);  
        }
        //console.log(circleNum);

        if((circleCoord.x > -1 && circleCoord.x < this.rows) && (circleCoord.y > -1 && circleCoord.y < this.cols))
        {
            if((circleCoord.x > -1 && circleCoord.x < this.rows) && (circleCoord.y > -1 && circleCoord.y < this.cols))
            {
                circle = this.circleArr[circleCoord.x][circleCoord.y]; 
                circle = circle[0]; 
                console.log(circle);
            }
            neighborCircleColor = circle.getData('color');
            console.log(neighborCircleColor);
        }
    }

    //check if there is a collision between the circle it's at and a neighboring circle
    checkCollision(line, xCoord, yCoord)
    {
        console.log("x: " + xCoord + " y: " + yCoord);


        var distance = 100; //the distance between the line and the circle...set to 100 so it will default to being too far
        var circleCoord; //the element number in the circle array that is the neighbor
        if((xCoord > -1 && xCoord < this.rows) && (yCoord > -1 && yCoord < this.cols))
        {
            var circle = this.circleArr[xCoord][yCoord]; 
            circle = circle[0]; 
            console.log(circle);
        }
        else
        {
            return [{x: -1, y: -1}];
        }

        distance = Phaser.Math.Distance.Between(line.x, line.y, circle.x, circle.y);

        console.log("line.x : " + line.x + " line.y : " + line.y);
        console.log("circle.x : " + circle.x + " circle.y : " + circle.y);


        
        console.log(distance);
        
        //if the distance is less than the radius of the circle then
        if(distance < 10)
        {
            circleCoord = [{x: xCoord, y: yCoord}];
            console.log('circle Coord: ' + circleCoord);
            console.log("hit!");
            return circleCoord;
        }
        else
        {
            return [{x: -1, y: -1}];
        }
    }

    stopDrag()
    {
        this.lineGraphics.clear();
        this.input.on('pointerdown', this.startDrag, this);
        this.input.off('pointermove', this.doDrag, this);
        this.input.off('pointerup', this.stopDrag, this)
    }

    //get the surrounding hexagons from the chosen circle
    getNeighbors(circle)
    {
        var neighbors = [6];
        var x = circle.getData('x');
        var y = circle.getData('y');

        //if the row is even
        if(y % 2 === 0)
        {
            //top middle
            neighbors[0] = [{x: x - 1, y: y}];
            //top right
            neighbors[1] = [{x: x - 1, y: y + 1}];
            //bottom right
            neighbors[2] = [{x: x, y: y + 1}];
            //bottom middle
            neighbors[3] = [{x: x + 1, y: y}];
            //bottom left
            neighbors[4] = [{x: x, y: y - 1}];
            //top left
            neighbors[5] = [{x: x - 1, y: y - 1}];
        }
        //row is odd
        else
        {
            //top middle
            neighbors[0] = [{x: x - 1, y: y}];
            //top right
            neighbors[1] = [{x: x, y: y + 1}];
            //middle right
            neighbors[2] = [{x: x + 1, y: y + 1}];
            //bottom middle
            neighbors[3] = [{x: x + 1, y: y}];
            //bottom left
            neighbors[4] = [{x: x + 1, y: y - 1}];
            //top left
            neighbors[5] = [{x: x, y: y - 1}];
        }

        return neighbors;
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