/**
 * 
 * Home of the IT484 Battleship AI Code Base
 * 
 * @author Drew Short <warrick@sothr.com>
 * @author Aaron Willcutt
 */
// This is the home of the AI code //

function AI(engine)
{
    //load the engine
    this.engine = engine;
    
    // Define a Shot for shot history
    // ie new Shot(1,5,7,'hunt'); A shot at position 5,7 on turn 1 that is hunting
    function Shot(turn, x, y, type)
    {
        this.turn = turn;
        this.x = x;
        this.y = y;
        this.type = type;
    }
    
    //history of shots the AI has made in the form of [shot{x:x,y:y},shot{x:x,y:y}]
    this.shotHistory = [];
    
    //logic flags for triggering hunting vs killing mode
    this.foundShip = false;
    
    ////////////////////////
    // AI Front End Logic //
    ////////////////////////
    
    //ship placement code
    this.placeShips = function()
    {
        //make the engine calls to get a listing of ships and then place them. Perhaps randomly?
    };
    
    //this single "magic" function that performs the ai moves.
    this.executeTurn = function()
    {
        //check which mode we're in
        if (engine.isModeOne)
        {
            //mode one logic
            this.helperExecuteTurnModeOne();
        }
        else
        {
            //moe two logic
            this.helperExecuteTurnModeTwo();
        }
    };
    
    ////////////////////
    // Mode One Logic //
    ////////////////////
    
    this.helperExecuteTurnModeOne = function()
    {
        //all of the turn information is processed here for mode 1
    };
    
    ////////////////////////////////
    // Mode One Logic and Helpers //
    ////////////////////////////////
    
    
    
    
    
    
    ////////////////////
    // Mode Two Logic //
    ////////////////////
    
    this.helperExecuteTurnModeTwo = function()
    {
        //all of the turn information is processed here for mode 2
    };
    
    ////////////////////////////////
    // Mode Two Logic and Helpers //
    ////////////////////////////////








    this.helperFiringLogic = function()
    {
    
    //We generate a random number between 0-4 in order to generate a starting point for AI shot selection.
    //This should limit the ability of the opponent to plan ship position to avoid shots.
    //This will begin firing in the upper right corner of the board.
    
    //var startXCoord = (9 - randomInt);
    //var startYCoord = 0;
    
    //var xCoord = startXCoord;
    //var yCoord = startYCoord;
    };
    
    ////////////////////////////////
    // Shot Selection Code Mode 1 //
    ////////////////////////////////
    
    //This function fires in a diagonal x+1, y+1 pattern with the starting point specified in the parameters   
    this.helperCheckDiagonal = function(xCoord, yCoord)
    {
        while (xCoord<=9 && yCoord>=0)
        {
            //you can use this for now but we'll need a way to make it work with the engine later
            var mode1Ships = new mode1Ships();
            mode1Ships.regularShot.fire(xCoord, yCoord, engine.player1ShipGrid, engine.player2ShotGrid);
            xCoord++;
            yCoord++;
        }
    };
    
    //NOTE: There must be a better way to go about performing this. I can't find the pattern right now, however.
    //These calls will perform diagonal searching with the parameters given indicating the starting point. 
    //These shots should check most cells on the board
    
    
    
    //This searches for enemy ships by firing in a pattern as long as no ships are found
    this.helperHuntingShot = function()
    {
        // imported AI code //
        var randomInt = Math.floor(Math.random()*5);
        
        //We use x and y as starting coordinates and begin firing in a diagonal line (x+1, y+1) on cells which !=0 until an edge is reached.
        //When an edge is reached we begin a new diagonal by moving five cells to the left on the x-axis and diagonally firing again.
        //When an edge is reached we begin a new diagonal by moving left to x=0 and diagonally firing again from x=0, y=randomInt.
        //If (randomInt+5) < 9 we perform one more diagonal run
        
        this.checkDiagonal(0,(9-randomInt));
        
        this.checkDiagonal(0,(4-randomInt));
        
        this.checkDiagonal((1+randomInt),0 );
        
        this.checkDiagonal((6+randomInt),0 );
        
        this.checkDiagonal(0,(7-randomInt));
        
        this.checkDiagonal(0,(2-randomInt));
        
        this.checkDiagonal((3+randomInt),0 );
        
        this.checkDiagonal((8+randomInt),0 );
        
        this.checkDiagonal(0,(8-randomInt));
        
        this.checkDiagonal(0,(3-randomInt));
        
        this.checkDiagonal((2+randomInt),0 );
        
        this.checkDiagonal((7+randomInt),0 );
        
        this.checkDiagonal(0,(6-randomInt));
        
        this.checkDiagonal(0,(1-randomInt));
        
        this.checkDiagonal((randomInt),0 );
        
        this.checkDiagonal((5+randomInt),0 );
    };
    
    //method for sinking an enemy ship once located with hunting shot
    this.helperKillingShot = function(xCoord, yCoord)
    {
    //Create functions to locate orientation of found ship
    
    //TODO implement firing shots for each directional check.
    //you can use this for now but we'll need a way to make it work with the engine later
        var mode1Ships = new mode1Ships();
        this.fireNorth = function()
        {
            yCoord--;
            mode1Ships.regularShot.fire(xCoord, xCoord, engine.player1ShipGrid, engine.player2ShotGrid);
    
        };
        this.fireEast = function()
        {
            xCoord++;
            mode1Ships.regularShot.fire(xCoord, xCoord, engine.player1ShipGrid, engine.player2ShotGrid);
        };
        this.fireSouth = function()
        {
            yCoord++;
            mode1Ships.regularShot.fire(xCoord, xCoord, engine.player1ShipGrid, engine.player2ShotGrid);
        };
        this.fireWest = function()
        {
            xCoord--;
            mode1Ships.regularShot.fire(xCoord, xCoord, engine.player1ShipGrid, engine.player2ShotGrid);
        };
    
    
        
         //   once ship is hit we search for orientation. We limit shots to cells within the grid which are affected by fog of war.
         
          //While a ship is hit but not sunk we check one cell north of it
            if ((yCoord-1) > 0 && engine.player2ShotGrid[xCoord][yCoord-1] === 0)
               {
               this.fireNorth();
               }
         
            else if ((xCoord+1) < 10 && engine.player2ShotGrid[xCoord+1][yCoord] === 0)
               {
               this.fireEast();
               }
         
            else if (xCoord-1 > 0 && engine.player2ShotGrid[xCoord-1][yCoord] === 0)
               {
               this.fireSouth();
               }
         
            else if (yCoord+1 < 10 && engine.player2ShotGrid[xCoord][yCoord+1] === 0)
               {
               this.fireWest();
               }
         
    // TODO: Continue implementation of killingShot with strategy following results from orientation shots.
    };
    
    //As long as no ships have been hit we continue with hunting shots. When a ship has been hit we switch to kiling shot.
    
    this.huntingShot = function()
    {
        // it will yell about this since it cannot see it, but this will be available when loaded on the page
        if (this.huntingShot() !== ShotMessages[2])
        {
            this.huntingShot();
        }
        else
        {
            this.killingShot();
        }
    };
    
};