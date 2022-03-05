class Hexagon extends Phaser.Scene {

    constructor() {
        super({
            key: 'Hexagon',
            
        })
    }

graphics; //the hexagon
lineGraphics; //line being drawn by user
prevLineGraphics; //the lines leading up to the current circle
circleGraphics; //the circles
hexagonCoord = []; //Hexagon coordinates
circleArr = [[]];
drag; //the circle clicked on
rows;
cols;
dots = [];
xC; //x coordinate of the next selected circle
yC; //y coordinate of the next selected circle
    create()
    {
        //size of grid is 8x8
        this.rows = 8;
        this.cols = 8;
        var screenWidth = window.innerWidth; //size of screen width
        var screenHeight = window.innerHeight; //size of screen height
        var rad; //half the length of  the hexagon
        

        this.graphics = this.add.graphics();
        this.lineGraphics = this.add.graphics();
        this.circleGraphics = this.add.graphics();
        this.prevLineGraphics = this.add.graphics();
        this.xC = -1;
        this.yC = -1
      
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
                
                if(this.circleArr.length === i )
                {
                    this.circleArr.push([]);
                    this.circleArr[i].push(circle); 
                }
                else
                {
                    this.circleArr[i].push(circle);  
                }
 
                //console.log('[' + i + ',' + j + '] = ' + this.circleArr[i][j]);

            }
        }
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
        //this.dots.push(targets[0]);
        this.input.off('pointerdown', this.startDrag, this);
        this.dragObj = targets[0];//this.dots[this.dots.length-1];
        //console.log("current cooridnates --- x: " + this.dragObj.getData('x') + " y: " + this.dragObj.getData('y'));
        
        
        //this verfies there is a color data attached to the object attempted being dragged
        //if there is no color data, then it is not a circle
        try{
            //console.log("current cooridnates --- x: " + this.dragObj.getData('x') + " y: " + this.dragObj.getData('y'));
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
        var circleCoord = {x: -1, y: -1}; //the element number in the circle array that is the neighbor
        var circle;
        var neighborCircleColor;
        neighbors = this.getNeighbors(this.dragObj);
        //console.log(neighbors[0][0].x);

        //if this is the first circle, then add it to the list
        //the rest are added as they collide
        //console.log("length: " + this.dots.length);
        if(this.dots.length === 0)
        {
            this.dots.push(this.dragObj);
        }

        //continue to draw line from the current circle to wherever the cursor is
        this.draw();
        

        //check for collision with each neighbor
        for(let i = 0; i < 6; i++)
        {
            this.checkCollision(this.input, neighbors[i][0].x, neighbors[i][0].y); 
            circleCoord = {x: this.xC, y: this.yC};
            //console.log('x: ' + circleCoord.x + ' y: ' + circleCoord.y);
            if(circleCoord.x !== -1 && circleCoord.y !== -1)
            {
                i = 10; //break the loop
            }         
        }

        //if the coordinates are on the board...
        if((circleCoord.x > -1 && circleCoord.x < this.rows) && (circleCoord.y > -1 && circleCoord.y < this.cols))
        {
            //console.log("valid coordinates");
            circle = this.circleArr[circleCoord.x][circleCoord.y]; //the neighbor
            neighborCircleColor = circle.getData('color');

            //if the colors match...
            if(neighborCircleColor === this.dragObj.getData('color'))
            {
                
                this.xC = -1;
                this.yC = -1;
                var index = this.dots.indexOf(circle);
                //console.log(index);
                //if the circle is new, add it to the list
                if(index === -1)
                {
                    //console.log('x: ' + circle.getData('x') + ' y: ' + circle.getData('y'));
                    this.dots.push(circle);
                    //console.log(this.dots.length);
                    //console.log(this.dots[this.dots.length-1]);
                    for (let i = 0; i < this.dots.length; i++) {
                        const element = this.dots[i];
                        //console.log(element);
                        
                    }
                    this.lineGraphics.clear();
                    this.reDraw(); //if a new circle has been reached, draw lines from the first to the current
                    
                }
                //if the circle is the previous circle, the user moved back, so remove it from the list
                else if((this.dots[this.dots.length - 2] === this.dragObj) && this.dots.length !== 1)
                {
                    console.log("backedup");
                    this.input.on('pointerout', function (pointer, targetObject)
                    {
                        console.log("stopped dragging " + this.dots.length);

                        this.input.on('pointerup', this.stopDrag, this);
                        this.lineGraphics.clear();
                        this.prevLineGraphics.clear();
                        this.reDraw();
                        this.draw();
                    }, this);
                    this.dots.pop();
                    //this.lineGraphics.clear();
                    this.reDraw();
                }
                this.input.on('pointerover', this.startDrag, this);
                this.input.off('pointermove');
                this.input.on('pointerup', this.stopDrag, this);
            }
            
        }
    }

    stopDrag()
    {
        
        this.lineGraphics.clear();
        this.prevLineGraphics.clear();
        this.input.off("gameobjectover");
        this.input.off('pointerout');
        this.input.off('pointerup', this.doDrag, this);
        this.input.on('pointerdown', this.startDrag, this);
        this.input.off('pointerover');
        this.input.off('pointermove');
        this.input.off('pointerup', this.stopDrag, this);
        this.dots.pop();
    }

    draw() 
    {
        this.lineGraphics.clear();
        this.lineGraphics.beginPath();
        this.lineGraphics.beginPath();
        this.lineGraphics.lineStyle(10, this.dragObj.getData('color'), 1.0);        
        this.lineGraphics.moveTo(this.dragObj.x, this.dragObj.y);
        this.lineGraphics.lineTo(this.input.x, this.input.y);
        this.physics.add.existing(this.lineGraphics);
        this.lineGraphics.body.setSize(10, 10);
        this.lineGraphics.stroke();
        this.lineGraphics.closePath();
    }    

    reDraw()
    {
        this.lineGraphics.clear();
        this.prevLineGraphics.clear();
        this.prevLineGraphics.beginPath();
        this.prevLineGraphics.beginPath();
        this.prevLineGraphics.lineStyle(10, this.dragObj.getData('color'), 1.0);   
        
        //draw from beginning circle to new circle
        for(let i = 0; i < this.dots.length; i++)
        {
            //if this is not the last element draw a line from the previous dot, to the next dot
            if(this.hasNext(this.dots, i + 1))
            {
                this.prevLineGraphics.moveTo(this.dots[i].x, this.dots[i].y);
                this.prevLineGraphics.lineTo(this.dots[i+1].x, this.dots[i+1].y);
            }
        }
        this.prevLineGraphics.stroke();
        this.prevLineGraphics.closePath();
    }

    hasNext(arr, index)
    {
        //checks if the possible next index number is greate than the size of the array
        //example: checking if index, which is equal to 3, is greater than size of the array
            //is 3 > (3-1) //size is three, which means the last element is 2, so subtract one
        if(index > (arr.length - 1))
        {
            return false;
        }
        else
        {
            return true;
        }
    }


    //check if there is a collision between the circle it's at and the line

    /*
        Note: I was able to speed up this function by a significant amount by changing this function from checking the distance from input line to circle 
        which looked something like: distance = sqrt((circle.x - line.x)^2 + (circle.y - line.y)^2) 
        this took longer to process since it is math
        this final version is a listener function that checks when the mouse is over a circle (only circles are interactable), 
        if the circle is a neighbor, and it is a valid space (not outside the bounds), then it sends back the coordinates to be checked if the colors match
    */
    checkCollision(line, xCoord, yCoord)
    {
        //if the coordinate is within bounds (there is no coordinates smaller than zero or larger than the amount of rows)
        if((xCoord > -1 && xCoord < this.rows) && (yCoord > -1 && yCoord < this.cols))
        {
            var circle = this.circleArr[xCoord][yCoord]; //the neighboring circle of the circle we started from
        }

        //check if input is over interactable gameobject
        line.on('gameobjectover', function (pointer, targetObject)
        {
            if((targetObject === circle))
            {
                this.xC = xCoord;
                this.yC = yCoord;     
            }    
        }, this);   
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