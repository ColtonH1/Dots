class Hexagon extends Phaser.Scene {

    constructor() {
        super({
            key: 'Hexagon',
            physics: {
              arcade: {
                debug: true,
                gravity: { y: 0 }
              }}});
    }

graphics;
lineGraphics;
circleArr = [];
drag; //the circle clicked on
    create()
    {
        //this.physics.startSystem(Phaser.Physics.ARCADE);
        this.graphics = this.add.graphics();
        this.lineGraphics = this.add.graphics();
        this.drawGrid(); 
        if(this.circleArr === null)
        {
            console.error("No circles");
        }

        
    }
    
    drawGrid() {

        //size of grid is 8x8
        var rows = 8;
        var cols = 8;
        var rad = 100; //half the length of the hexagon (short for radius, despite this not being a circle)
        var screenWidth = window.innerWidth; //size of screen width
        var screenHeight = window.innerHeight; //size of screen height
        var hexagonNum = 0; //the number assigned to each hexagon which is unique to each one
        var hexagonCenter = [];
        
        //get the smaller of the two
        if(screenHeight > screenWidth)
        {
            rad = screenWidth / (rows + 2);
        }
        else
        {
            rad = screenHeight / (cols + 2);
        }    

        //set starting positions a certain amount away from the screen
        var startX = (((screenWidth / rows) / rad) * rows) + (screenWidth / rows);
        var startY = (((screenHeight / cols) / rad) * cols) + (screenHeight / cols);
    
        //change rad. If not changed, then the hexagons would take up the entire width and heighth given; we want it smaller
        if(screenHeight > screenWidth)
        {
            rad -= rad / rows;
        }
        else
        {
            rad -= rad / cols;
        }   
    
    
        //i is for each row and j is for each column
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                var hexPoints = []; //array to hold the hexagon's coordinates
                hexPoints = this.hexagonPoints(hexPoints, i, j, rad, startX, startY); 
                var polygon = new Phaser.Geom.Polygon(hexPoints);

                //draw hexagon
                this.graphics.lineStyle(10, 0x000000, 10.0);
                this.graphics.strokePoints(polygon.points);

                hexagonCenter[hexagonNum] = ({ x: hexPoints[0].x + (rad / 2), y: hexPoints[0].y});


                hexagonNum++;

            }
        }
        this.drawCircles(hexagonCenter);
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
    drawCircles(hexagonCenter)
    {
        for (let i = 0; i < hexagonCenter.length; i++) 
        {
            var color = this.chooseColor();
            let circle = this.add.circle(hexagonCenter[i].x, hexagonCenter[i].y, 10, color).setInteractive(); 
            circle.setDataEnabled();
            circle.setData({ 'color': color, 'location': i});
            

            //this.physics.arcade.add.existing(circle);

            this.circleArr.push(circle);

            const text = this.add.text(hexagonCenter[i].x, hexagonCenter[i].y, i, { font: '16px Courier', fill: '#000000' });
            text.setFontSize(15);
        
            circle.on('drag', (pointer, dragX, dragY) => {
            circle.x = dragX
            circle.y = dragY
          })
            this.input.setDraggable(circle, false);
            this.input.on('pointerdown', this.startDrag, this);

          
            
        } 
    }

    //these next three are how to handle dragging
    startDrag(pointer, targets)
    {
        this.input.off('pointerdown', this.startDrag, this);
        this.dragObj = targets[0];

        //this verfies there is a color data attached to the object attempted being dragged
        try{
            console.log(this.dragObj.getData('color'));
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

    test(lineGraphics, dragObj)
    {
        console.log("collide");
    }
    doDrag(pointer)
    {
        var neighbors = [];

        //continue to draw line until user lets go
        this.lineGraphics.clear();
        this.lineGraphics.beginPath();
        this.lineGraphics.beginPath();
        this.lineGraphics.lineStyle(10, this.dragObj.getData('color'), 1.0);
        this.lineGraphics.moveTo(this.dragObj.x, this.dragObj.y);
        this.lineGraphics.lineTo(this.input.x, this.input.y);
        this.physics.add.existing(this.lineGraphics);
        this.lineGraphics.body.setSize(10, 10);
        this.physics.add.overlap(this.lineGraphics, this.dragObj, null, this);
        
        

        neighbors = this.getNeighbors(this.dragObj);

        //console.log(this.lineGraphics);
        if(Phaser.Geom.Intersects.LineToCircle(this.lineGraphics, this.dragObj))
        {
            console.log("found");
        }

        this.lineGraphics.stroke();
        this.lineGraphics.closePath();
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
        var location = circle.getData('location');

        //neighbor 1 (top left) = location - 1
        neighbors[0] = location - 1;
        //neighbor 2 (top middle) = location - 8
        neighbors[1] = location - 8;
        //neighbor 3 (top right) = location - 7
        neighbors[2] = location - 7;
        //neighbor 4 (bottom right) = location + 1
        neighbors[3] = location + 1;
        //neighbor 5 (bottom middle) = location + 8
        neighbors[4] = location + 8;
        //neighbor 6 (bottom left) = location + 7
        neighbors[5] = location + 7;
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