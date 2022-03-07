const eventsCenter = new Phaser.Events.EventEmitter()

class Level extends Phaser.Scene {
    constructor() 
    {
        super("Level");
    }
    
    preload()
    {
        //this.load.image('blueFlare', 'Assets/Sprites/blue-flare.png');
        //this.load.image('greenOrb', 'Assets/Sprites/green-orb.png');
        this.load.image('MenuBox', 'Assets/Sprites/Menu_Box.png');
        this.load.image('Button', 'Assets/Sprites/Button.png');
        this.load.image('QuitBox', 'Assets/Sprites/QuitBox.png');
    }

    create()
    {
        //user input


        //title text
		this.add.text(275, 50, 'DOTS', {
			fontFamily: 'Risque',
			fontSize: '48px',
			color: '#12FFEA',
			backgroundColor: '#AE4496',
			fontStyle: 'normal',
			stroke: '#040000',
			strokeThickness: 7,
			shadow: { offsetX: -5, offsetY: 5, color: '#060000', fill: true, stroke: true }
		});


        //line graphics
        this.hexGraphics = this.add.graphics(); //the lines drawing the hexagons
        this.lineGraphics = this.add.graphics(); //the line emmiting from the last chosen circle and following the user
        this.prevLineGraphics = this.add.graphics(); //the lines connecting all the chosen circles

        //variables
        this.isDragging = false;
        this.isDrawing = false; //keep track of if a draw class was created
        this.rows = 8;
        this.cols = 8;
        this.hexInfo; //holds the information about the hexagon array
        this.isPaused = false; //If the user can provide input to the game

        //images
        this.userInputBox = this.add.image(0, 0, "MenuBox").setDepth(1);
        this.menuBox = this.add.image(0, 0, "MenuBox").setDepth(1);
        this.restartButton = this.add.image(0, 0, "Button").setDepth(2);
        this.quitButton = this.add.image(0, 0, "Button").setDepth(2);
        this.quitBox = this.add.image(0, 0, "QuitBox").setDepth(10);
        this.makeButtons();

        //classes
        this.gridInfo = new Grid(this.rows, this.cols, this.hexGraphics, this); //make the hexagons
        this.hexInfo = this.gridInfo.getHexCenter(); //set the hexagon information
        this.circleInfo = new Circle(this.rows, this.cols, this.gridInfo.getHexSize(), this.hexInfo, this); //draw the circles
        this.ui = new UIEvents(this);

        var level = this;
        //input handlers
        this.input.on("gameobjectdown", this.startDraw, this); //start a move
        this.input.on("pointermove", this.continueDraw, this); //move input around 
        this.input.on("pointerup", this.stopDraw, this); //move finished
        this.restartButton.on("pointerup", this.ui.restart, this); //clicked restart
        //this.quitButton.on("pointerup", function (event) {}, this); //clicked quit
        this.quitButton.on("pointerup", this.quit, this); //clicked quit


    }

    userInput()
    {
        
        this.message = this.add.text(640, 250, "Enter the amount of rows you would like on the board", {
            color: "#FFFFFF",
            fontSize: 60,
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(2);
    }

    startDraw(pointer, gameObject, event)
    {
        if(!this.isPaused)
        {
            var lineSize = this.circleInfo.getCircleSize();
            this.draw = new Draw(lineSize, this);
            this.draw.select(gameObject);
            this.isDragging = true;
            this.isDrawing = true; 
        }
        else
        {
            this.stopDraw();
        }
    }

    continueDraw()
    {      
        if(this.isDragging && !this.isPaused)
        {
            this.draw.drawPath();            
        }
        else 
        {
            this.stopDraw();
        }
    }

    stopDraw()
    {
        if(this.isDrawing)
        {
            this.removeCircles();
            this.dropCircles();
            this.isDrawing = false;
            this.draw.stop();  
        }
        else
        {

        }
        this.isDragging = false;        
    }

    removeCircles()
    {
        var chainLength;

        if(this.isDragging)
        {
            chainLength = this.draw.getChainLength();          
            if(chainLength > 1)
            {
                this.draw.emptyChain();
            }
        }
    }

    dropCircles()
    {
        var emptySpaces = this.countEmptySpaces();

        /* * * * * * * * NOTICE * * * * * * * *
        *
        * this time, rows and columns are BACKWARDS since we want to check each row of the current column
        *
        */

        while(emptySpaces > 0)
        {
            for (let i = 0; i < this.cols; i++) 
            {
                for(let j = this.rows - 1; j >= 0; j--)
                {
                    //if the last row in the current column is empty, drop circles
                    if(this.hexInfo[j][i].isEmpty)
                    {
                        //console.log("x: " + j + " y: " + i + " is empty");
                        this.circleInfo.fallCircles(j, i);
                    }
                }      
            }   
            emptySpaces = this.countEmptySpaces();
        }
        
    }

    countEmptySpaces()
    {
        var result = 0;
        for(let i = 0; i < this.rows; i++)
        {
            for(let j = 0; j < this.cols; j++)
            {
                if(this.hexInfo[i][j].isEmpty)
                {
                    result++;
                }
            }
        }
        return result;
    }

    makeButtons()
    {
        this.quitBox.setPosition(333, 333);
        this.quitBox.visible = false;

        this.menuBox.setPosition(333, 333);
        this.menuBox.visible = false;

        this.restartButton.setPosition(333, 275);
        this.restartButton.setInteractive();        
        this.restartButton.visible = false;
        this.restartText = this.add.text(250, 260, 'Restart', { fontSize: '40px', fill: '#000' });  
        this.restartText.visible = false;
        this.restartText.setDepth(3);

        this.quitButton.setPosition(333, 350);
        this.quitButton.setInteractive();        
        this.quitButton.visible = false;
        this.quitText = this.add.text(280, 330, 'Quit', { fontSize: '40px', fill: '#000' });   
        this.quitText.visible = false;    
        this.quitText.setDepth(3);
    }


    /* * * * * * * * NOTE * * * * * * * *
    *
    * Since there is only one scene to this level, quitting doesn't actually do anything
    * Therefore, the 'quit' button just informs the user they pressed quit
    *
    */
    quit()
    {
        console.log("Quit in level");
        //this.quitBox.setScale({x: 4, y: 1.75});
        //this.quitBox.setScaleX(4);
        //this.quitBox.setScaleY(1.75);
        //this.quitBox.visible = true;

		this.add.text(150, this.scale.height * 0.5 + 175, 'YOU QUIT!', {
			fontFamily: 'Risque',
			fontSize: '100px',
			color: '#000202',
			backgroundColor: '#000000',
			fontStyle: 'normal',
			stroke: '#008DFF',
			strokeThickness: 10,
			shadow: { offsetX: -2, offsetY: 2, color: '#060000', fill: true, stroke: true }
		}).setDepth(11).setAngle(-45);
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
        var screenWidth = 800;//window.innerWidth; //size of screen width
        var screenHeight = 600;//window.innerHeight; //size of screen height

        this.size = this.SetHexSize(screenWidth, screenHeight); //get size of hexagon        
        this.hexCenter = [];

        var startX = (screenWidth / this.size) + (screenWidth / this.rows); //offset of x
        var startY = (screenHeight / this.size) + (screenHeight / (this.cols / 2)); //offset of y

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
                    pixelCoord: this.drawHexagon(j, i, firstCenter), 
                    x: i, 
                    y: j
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
            sizeOfHex = screenWidth / (this.rows * 2);
        }
        else
        {
            sizeOfHex = screenHeight / (this.cols * 2);
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

    //find how many empty spaces are below this column
    getEmptySpaceCount(col)
    {
        var result = 0;

        for(let i = 0; i < this.rows; i++)
        {
            if(this.hexCenter[i][col].isEmpty)
            {
                result++;
            }
        }

        return result;
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
        this.newCircleArr = []; //array of circles yet to be seen (the ones that will fall when a match is made)
        this.setCircle();
    }
    
    getCircles()
    {
        return this.circleArr;
    }

    getCircleSize()
    {
        return this.size;
    }

    setCircle()
    {
        this.size = this.hexSize * .375; //make circles proportiontate to the hexagon size
        for(let i = 0; i < this.rows; i++)
        {
            this.circleArr[i] = [];
            for (let j = 0; j < this.cols; j++) 
            {
                this.circleArr[i][j] = this.drawCircle(i, j);  
            }
        }
    }

    drawCircle(x, y)
    {
        var color = this.chooseColor(); //choose random color  
        var center;
        //anything above negative one is in the original circle list 
        if(x > -1)
        {
            center = {x: this.hexCenter[x][y].pixelCoord.x, y: this.hexCenter[x][y].pixelCoord.y};
        }
        //anything below negative one is in the replacement circle list
        else
        {
            var h = 2 * this.hexSize; //height of a hexagon
            var vertDistance = h * .75; //vertical distance between the centers of adjacent hexagons
            var width = Math.sqrt(3) * this.hexSize; //width is equal to the horizontal distance between two adjacent hexagons

            center = {x: this.hexCenter[0][y].pixelCoord.x + (width / 2), y: this.hexCenter[0][y].pixelCoord.y - vertDistance};
        }

        let circle = this.level.add.circle(center.x, center.y, this.size, color).setInteractive(); //create interactive circle
        circle.setDataEnabled(); //allow data to be entered
        circle.setData({ 'color': color, 'x': x, 'y': y }); //set color and coordinates
  

        //to help with debugging
        //this.level.add.text(center.x - (this.hexSize / 2), center.y, '(' + circle.getData('x') + ', ' + circle.getData('y') + ')', { font: '16px Courier', fill: '#000000' });

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

    fallCircles(i, j)
    {
        //start right above the empty row that was found, which was i
        for(let k = i - 1; k > -2; k--)
        {
            if(k > -1 && !this.level.hexInfo[k][j].isEmpty)
            {
                this.moveGradually(this.circleArr[k][j], this.level.hexInfo[k + 1][j].pixelCoord.x, this.level.hexInfo[k + 1][j].pixelCoord.y);
                this.circleArr[k + 1][j] = this.circleArr[k][j]; //update circle array with the correct coordinates of the moved circle
                this.circleArr[k + 1][j].setData({'x': k + 1, 'y': j}); //update the circle's data that is saying its coordinates

                this.level.hexInfo[k][j].isEmpty = true; //mark the one that just lost a circle as empty
                this.level.hexInfo[k + 1][j].isEmpty = false; //this hexagon is filled, so it is no longer empty

            }
            //k is -1, so we are looking to make a new circle for row 0
            else if(k === -1)
            {
                this.dropNewCircles(j);
            }
        }

    }

    dropNewCircles(col)
    {
        var newCircle = this.drawCircle(-1, col); //draw a new circle in the same column, but a row back

        this.moveGradually(newCircle, this.level.hexInfo[0][col].pixelCoord.x, this.level.hexInfo[0][col].pixelCoord.y);
        
        this.circleArr[0][col] = newCircle; //update circle array with the correct coordinates of the moved circle
        this.circleArr[0][col].setData({'x': 0, 'y': col});

        this.level.hexInfo[0][col].isEmpty = false; //this hexagon is filled, so it is no longer empty

    }

    moveGradually(target, x, y)
    {   
        this.level.tweens.add({
            targets: target,
            x: x,
            y: y,
            duration: 1500,
            ease: Phaser.Math.Easing.Bounce.Out
        });  
    }
}

class Draw
{
    constructor(lineSize, level)
    {
        this.lineSize = lineSize; //size of line to be draw
        this.level = level;
        //this.hexInfo = hexInfo;

        this.create();
    }

    create()
    {
        this.isDragging = false;
        this.circle; //the last circle chosen
        this.lineColor; //color of line to be drawn
    }

    getChainLength()
    {
        return this.chosenArr.length;
    }

    select(gameObject)
    {
        this.chosenArr = []; //array of chosen circles
        this.chosenArr.push(gameObject);
        this.circle = gameObject;
        this.lineColor = this.circle.getData('color');
        this.isDragging = true;
        this.level.input.on("gameobjectover", this.newCircle, this);
    }

    drawPath()
    {

        if(this.isDragging)
        {
            this.draw();            
        }

    }

    stop()
    {
        this.isDragging = false;
        this.level.lineGraphics.clear();
        this.level.prevLineGraphics.clear();
        this.chosenArr = []; //empty the array
        this.level.input.off("gameobjectover");
    } 

    newCircle(pointer, gameObject)
    {
        var index = this.chosenArr.indexOf(gameObject);

        //console.log('index: ' + index);
        if(index === -1)
        {      
            if(this.isValid(gameObject))
            {
                this.chosenArr.push(gameObject); //add new circle to the chosen array
                this.circle = gameObject; //new circle is now the circle we are looking at
                this.redraw(); //redraw the board            
            }
        }
        else if(index === this.chosenArr.length - 2 )
        {
            this.backup();
        }

    }

    isValid(newCircle)
    {
        //console.log("color of newCircle: " + newCircle.getData('color') + " color if old circle: " + this.circle.getData('color') + " good neighbor: " + this.checkNeighbors(newCircle));
        if((newCircle.getData('color') === this.circle.getData('color')) && this.checkNeighbors(newCircle))
        {
            return true;
        }
        
    }

    //check if the new circle is a neighbor to the current circle
    checkNeighbors(newCircle)
    {
        var currentCircle = this.circle;
        var x = currentCircle.getData('x'); //x coordinate of circle we are coming from
        var y = currentCircle.getData('y'); //y coordinate of circle we are coming from
        var xPrime = newCircle.getData('x'); //x cooridnate of circle we are checking
        var yPrime = newCircle.getData('y'); //y coordinate of circle we are checking
        //console.log("currentCircle x: " + x + " y: " + y + " new circle x: " + xPrime + " y: " + yPrime);

        //even rows
        if(x % 2 === 0)
        {
            //right middle
            if((xPrime === x) && (yPrime === (y + 1)))
            {
                //console.log("even middle right");
                return true;
            }
            //right top
            if((xPrime === (x - 1)) && (yPrime === y))
            {
                //console.log("even top right");
                return true;
            }
            //left top
            if((xPrime === (x - 1)) && (yPrime === (y - 1)))
            {
                //console.log("even top left");
                return true;
            }
            //left middle
            if((xPrime === x) && (yPrime === (y - 1)))
            {
                //console.log("even middle left");
                return true;
            }
            //left bottom
            if((xPrime === (x + 1)) && (yPrime === (y - 1)))
            {
                //console.log("even left bottom");
                return true;
            }
            //right bottom
            if((xPrime === (x + 1)) && (yPrime === y))
            {
                //console.log("even bottom right");
                return true;
            }
        }
        //odd rows
        else
        {
            //right middle
            if((xPrime === x) && (yPrime === (y + 1)))
            {
                //console.log("odd middle right");
                return true;
            }
            //right top
            if((xPrime === (x - 1)) && (yPrime === (y + 1)))
            {
                //console.log("odd top right");
                return true;
            }
            //left top
            if((xPrime === (x - 1)) && (yPrime === y))
            {
                //console.log("odd top left");
                return true;
            }
            //left middle
            if((xPrime === x) && (yPrime === (y - 1)))
            {
                //console.log("odd middle left");
                return true;
            }
            //left bottom
            if((xPrime === (x + 1)) && (yPrime === y))
            {
                //console.log("odd bottom left");
                return true;
            }
            //right bottom
            if((xPrime === (x + 1)) && (yPrime === (y + 1)))
            {
                //console.log("odd bottom right");
                return true;
            }
        }
    }



    //draw the line coming from the most recent circle and following the user
    draw() 
    {
        this.circle = this.chosenArr[this.chosenArr.length-1]; //circle is the last circle in the array
        //draw a continous line
        this.level.lineGraphics.clear();
        this.level.lineGraphics.beginPath();
        this.level.lineGraphics.beginPath();
        this.level.lineGraphics.lineStyle(this.lineSize, this.lineColor, 1.0);        
        this.level.lineGraphics.moveTo(this.circle.x, this.circle.y);
        this.level.lineGraphics.lineTo(this.level.input.x, this.level.input.y);
        this.level.physics.add.existing(this.level.lineGraphics);
        this.level.lineGraphics.body.setSize(this.lineSize, this.lineSize);
        this.level.lineGraphics.stroke();
        this.level.lineGraphics.closePath();
    } 

    //draw the lines leading up to the most recent circle
    redraw()
    {
        this.level.lineGraphics.clear();
        this.level.prevLineGraphics.clear();
        this.level.prevLineGraphics.beginPath();
        this.level.prevLineGraphics.beginPath();
        this.level.prevLineGraphics.lineStyle(this.lineSize, this.lineColor, 1.0);   
        
        //draw from beginning circle to new circle
        for(let i = 0; i < this.chosenArr.length; i++)
        {
            //if this is not the last element draw a line from the previous dot, to the next dot
            if(this.hasNext(this.chosenArr, i + 1))
            {
                this.level.prevLineGraphics.moveTo(this.chosenArr[i].x, this.chosenArr[i].y);
                this.level.prevLineGraphics.lineTo(this.chosenArr[i+1].x, this.chosenArr[i+1].y);
            }
        }
        this.level.prevLineGraphics.stroke();
        this.level.prevLineGraphics.closePath();
    }

    backup()
    {
        this.chosenArr.pop();
        this.level.lineGraphics.clear();
        this.redraw();
        this.circle = this.chosenArr[this.chosenArr.length - 1];
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

    emptyChain()
    {
        for(let i = 0; i < this.chosenArr.length;)
        {
            var deleteCircle = this.chosenArr.pop();  
            var x = deleteCircle.getData('x');
            var y = deleteCircle.getData('y');

            this.level.hexInfo[x][y].isEmpty = true; //tell the hexagon above it that it is now empty
            //this.level.add.text(this.hexInfo[x][y].pixelCoord.x, this.hexInfo[x][y].pixelCoord.y, "empty", { font: '16px Courier', fill: '#000000' });

            //console.log(this.level.hexInfo);
            deleteCircle.destroy();
            eventsCenter.emit('update-score', 1);
            
        }
    }
}

class UIEvents
{
    constructor(level)
    {
        this.level = level;

        this.create();
    }

    create()
    {
        //var
        this.score = 0;
        this.initalTime = 30; //time in seconds

        //text
        //this.scoreText = this.level.add.text(100, 100, 'Score: 0', { fontSize: '20px', fill: '#000' });  
        this.scoreText = this.text(100, 90, 'Score: 0', '30px', 0x00FF00, 1, 0, 0);
        //this.timerText = this.level.add.text(475, 100, 'Time: 0', { fontSize: '20px', fill: '#000' });  
        this.timerText = this.text(475, 90, 'Time: 0', '30px', 0x00FF00, 1, 0, 0);
        //this.gameOverText = this.level.add.text(275, 100, 'Game Over', { fontSize: '20px', fill: '#000' }); 
        this.gameOverText = this.text(235, 175, "Game Over", '40px', '#FF1212', 7, -5, 5); 
        this.finalScoreText = this.text(190, 400, ('Final Score: ' + this.score), '50px', '#77CCBB', 8, -3, 3).setDepth(3);
        this.gameOverText.visible = false;
        this.finalScoreText.visible = false;

        //listen for updates on score
        eventsCenter.off('update-score');
        eventsCenter.on('update-score', this.updateScore, this);

        //timer
        this.timedEvent = this.level.time.addEvent({ delay: 1000, callback: this.onEvent, callbackScope: this, loop: true });
    }

    text(x, y, text, size, color, strokeSize, offsetX, offsetY)
    {
        //const x = this.scale.width * 0.5
		//const y = this.scale.height * 0.5

		var text = this.level.add.text(x, y, text, {
			fontFamily: 'Risque',
			fontSize: size,
			color: color,
			fontStyle: 'normal',
			stroke: '#040000',
			strokeThickness: strokeSize,
			shadow: { offsetX: offsetX, offsetY: offsetY, color: '#060000', fill: true, stroke: true }
		}).setDepth(2)

        return text;
    }

    //update score
    updateScore(score)
    {
        this.score += score;
        this.scoreText.setText('Score: ' + this.score);
    }

    //update countdown
    onEvent(timeLeft)
    {
        this.initalTime -= 1;
        this.timerText.setText('Time: ' + this.initalTime);
        if(this.initalTime === 0)
        {
            this.timedEvent.paused = true;
            this.gameOver();
        }
    }

    //what happens when the timer runs out
    gameOver()
    {
        this.level.isPaused = true;
        //set everything visible
        this.gameOverText.visible = true;

        this.level.menuBox.visible = true;
        this.finalScoreText.setText("Final Score: " + this.score);
        this.finalScoreText.visible = true;

        this.level.restartButton.visible = true;
        this.level.restartText = this.text(265, 245, "Restart", '45px', '#77CCBB', 2, -1, 1);
        this.level.restartText.visible = true;

        this.level.quitButton.visible = true; 
        this.level.quitText = this.text(285, 320, "Quit", '45px', '#77CCBB', 2, -1, 1); 
        this.level.quitText.visible = true;  
    }

    restart()
    {
        console.log("restart");
        this.scene.restart(); // restart current scene
    }

    quit(level)
    {
        console.log("quit");
        level.quitBox.setScale(5);
        level.quitBox.visible = true;
    }
}