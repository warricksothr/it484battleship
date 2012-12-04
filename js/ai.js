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
    
    //indicate if we should debug
    //this toggles the alerts in the engine
    this.debug = false;
    
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
    
    /////////////////////
    // General Helpers //
    /////////////////////
    
    this.wasAHit = function(message)
    {
        return this.engine.helperFireShotDetermineIsHit(message);
    };
    
    /////////////////////////////////////////////////////////////////////////
    // AI: BAD DREW CODE RANDOM FOR TESTING PURPOSES REPLACE ME SOON!!!!!! //
    /////////////////////////////////////////////////////////////////////////
    
    this.helperFireRandomShot = function()
    {
        var shots = engine.getShotsNotOnCooldown();
        var numOfShots = shots.length-1;
        var randomShotIndex = getRandomInt(0, numOfShots);
        var shot = shots[randomShotIndex];
        if(this.debug){
            alert("I am a dumb AI and I will fire a random shot");
        }
        //select the random shot
        engine.selectShot(shot);
        
        var max = engine.getShotGrid().length-1;
        var randx = getRandomInt(0,max);
        var randy = getRandomInt(0,max);
        
        engine.fireShot(randx, randy);
    };
    
    ///////////////////////////////
    // Cheater AI Implementation //
    ///////////////////////////////
    
    /**
     * implementation of shot that randomly decides if it will hit a ship or not
     * if it decides to hit a ship it will randomly choose which ship to hit
     * otherwise it will randomly decide on a cell that has not already been shot at
     * 
     * the logic of this AI is a step above the dumb random AI
     */
    this.helperFireHuntingCheaterShot = function(difficulty)
    {
        if (typeof(difficulty) === 'undefined') { difficulty = 0.75; }
        
        function getRandomShot()
        {
            //get a random shot type
            var shots = engine.getShotsNotOnCooldown();
            var numOfShots = shots.length-1;
            var randomShotIndex = getRandomInt(0, numOfShots);
            return shots[randomShotIndex];
        }
        
        //choose a random shot
        var shot = getRandomShot();
        
        if(this.debug){
            alert("I am a slightly smarter AI and a bit of a cheater so I will randomly alternate between firing random shots and shots aimed at ships. Also I will not shoot at the same location twice");
        }
        
        // set the random shot as our selected shot
        engine.selectShot(shot);
        
        //determine the minimum for success
        var minSuccess = Math.floor(99*difficulty);
        
        //determine if we will aim for a ship or not
        var aimForShip = getRandomInt(0, 99);
        
        //get our shot grid and aalisting of enemy ships
        var shotGrid = engine.getShotGrid();
        var enemyShips = engine.getEnemyShips();
        
        //function tht determines if a location is a valid location
        //that is if the cell hasn't already been shot or is a revealed hit
        function isValidCell(x,y,shotGrid)
        {
            //return true if the grid is a fog or the grid is a reveal hit.
            //since no one in their right mind would shoot at an already existing hit, miss or reveal miss
            if (shotGrid[x][y] === 0 || shotGrid[x][y] === 4)
            {
                return true;
            }
            else{
                return false;
            }
        }
        
        //choose a random cell that is not already been fired at
        function chooseRandomCell(shotGrid)
        {
            var validCell = false;
            var randx = 0;
            var randy = 0;
            do{
                validCell = false;
                randx = getRandomInt(0,shotGrid.length-1);
                randy = getRandomInt(0,shotGrid.length-1);
                validCell = isValidCell(randx,randy,shotGrid);
            } while(!validCell);
            return {x:randx, y:randy};
        }
        
        //gets all the cells containing a specific ship
        function getShipCells(ship)
        {
            var cells = [];
            var shipStartx = ship.startx;
            var shipStarty = ship.starty;
            var shipIsVertical = ship.isVertical;
            var shipLength = ship.shipLength;
            if (shipIsVertical)
            {
                var shipEndy = shipStarty + shipLength-1;
                for (var mody = shipStarty; mody <= shipEndy; mody++)
                {
                    cells.push({x:shipStartx,y:mody});
                }
            }
            else
            {
                var shipEndx = shipStartx + shipLength-1;
                for (var modx = shipStartx; modx <= shipEndx; modx++)
                {
                    cells.push({x:modx,y:shipStarty});
                }
            }
            return cells;
        }
        
        //gets all cells that enemy ships are in
        function getCellsWithEnemyShips(enemyShips)
        {
            var cells = [];
            //loop through enemy ship
            for (var i = 0; i < enemyShips.length; i++)
            {
                //add the found cells to our list of ship cells
                cells = cells.concat(getShipCells(enemyShips[i]));
            }
            return cells;
        }
        
        //gets all cells that enemy ships are in that we haven't hit
        function getCellsWithEnemyShipsNotAlreadyHit(shotGrid, enemyShips)
        {
            var validCells = [];
            var j = 0;
            var cells = getCellsWithEnemyShips(enemyShips);
            for (var i = 0; i < cells.length; i++)
            {
                if (isValidCell(cells[i].x, cells[i].y, shotGrid))
                {
                    validCells[j++] = cells[i];
                }
            }
            return validCells;
        }
        
        //get a random cell containing an enemy ship that isn't already hit
        function getRandomShipCellNotAlreadyHit(shotGrid, enemy)
        {
            var validCells = getCellsWithEnemyShipsNotAlreadyHit(shotGrid, enemy);
            var randomEnemyShipCell = getRandomInt(0, validCells.length-1);
            return validCells[randomEnemyShipCell];
        }
        
        //get cells that are known to be hits
        function getKnownHits(shotGrid)
        {
            var cells = [];
            //walk through the shot grid to find reveal hits...
            for (var x = 0; x < shotGrid.length; x++)
            {
                for (var y = 0; y < shotGrid.length; y++)
                {
                    //if reveal hit, add it to our listing
                    if (shotGrid[x][y] === 4)
                    {
                        cells.push({x:x, y:y});
                    }
                }
            }
            return cells;
        }
        
        //get <count> cells that are known to be hits
        //choose the cells randomly and if count cells are not available, then supplement with random cells
        function getRandomKnownHits(count, shotGrid)
        {
            var knownHits = getKnownHits(shotGrid);
            var cells = [];
            //pad the end of knownHits with random shots if count is larger than knownHits
            while (knownHits.length < count)
            {
                knownHits.push(chooseRandomCell(shotGrid));
            }
            while (cells.length < count)
            {
                var randIndex = getRandomInt(0,knownHits.length-1);
                cells.push(knownHits.splice(randIndex,1)[0]);
            }
            return cells;
        }
        
        //shoot at a ship
        if (aimForShip >= minSuccess)
        {
            var randShipCell = getRandomShipCellNotAlreadyHit(shotGrid, enemyShips);
            if(this.debug)
            {
                alert("shooting at enemy ship located at ("+randShipCell.x+","+randShipCell.y+")");
            }
            //push the shot onto the history
            this.shotHistory.push(randShipCell);
            //fire the shot
            engine.fireShot(randShipCell.x, randShipCell.y);
            var hit = this.wasAHit(arrayPeek(this.engine.getShotHistory()));
            return hit;
        }
        //shoot at a random cell that we haven't already shot at
        else
        {
            //try to shoot at known hits before anything else
            var randCell = getRandomKnownHits(1,shotGrid)[0];
            if(this.debug)
            {
                alert("shooting randomly at cell ("+randCell.x+","+randCell.y+")");
            }
            //push the shot onto the history
            this.shotHistory.push(randCell);
            //fire the shot
            engine.fireShot(randCell.x, randCell.y);
            var hit = this.wasAHit(arrayPeek(this.engine.getShotHistory()));
            return hit;
        }  
    };
    
    this.helperFireKillingCheaterShot = function()
    {
        //currently the same logic
        return this.helperFireHuntingCheaterShot();
    };
    
    ////////////////////////
    // AI Front End Logic //
    ////////////////////////
    
    //ship placement code
    this.helperPlaceShips = function()
    {
        //make the engine calls to get a listing of ships and then place them. Perhaps randomly?
        //TODO: really do me. but for now I'll be randomized ship placement
        if(this.debug){
            alert("AI is placing their ships on the board");
        }
        var ships = engine.getAvailableShips();
            
        //place a ship on the grid randomly
        //check validity of position before placing it
        function placeShipRandomly(ship)
        {
            var validPlacement = false;
            do
            {
                validPlacement = false;
                //it will complain about these since they exist getRandomInt
                var rx = getRandomInt(0, 9);
                var ry = getRandomInt(0, 9);
                var rvertical = getRandomInt(0,1);
                validPlacement = engine.validateShipPlacement(rx,ry,rvertical,ship);
                if (validPlacement)
                {
                    engine.placeShip(rx, ry, rvertical, ship);
                }
            } while(!validPlacement);
        }
        
        //place ships randomly
        for (var i = 0; i < ships.length; i++)
        {
            placeShipRandomly(ships[i]);
        }
    };
    
    //this single "magic" function that performs the ai moves.
    this.executeTurn = function()
    {
        //check if we need to place ou ships
        if(engine.getPlayerShips().length < 1)
        {
            //place ships
            this.helperPlaceShips();
        }
        //check which mode we're in
        else if (engine.isModeOne)
        {
            //mode one logic
            this.helperExecuteTurnModeOne();
        }
        else
        {
            //moe two logic
            this.helperExecuteTurnModeTwo();
        }
        //and return flow to the engine
        return;
    };
    
    ////////////////////
    // Mode One Logic //
    ////////////////////
    
    this.helperExecuteTurnModeOne = function()
    {
        //all of the turn information is processed here for mode 1
        if(this.debug){
            alert("AI is pretending to work and is in mode 1. I fight for the users.");
        }
        //go into killer mode
        if (this.foundShip === true){
            //TODO: leave killer mode on the confirmation of a destroyed ship
            this.foundShip = this.helperExecuteModeOneKiller();
        }
        //we are in hunting mode
        else{
            //TODO: set found ship when we get a hit and go into killer mode
            this.foundShip = this.helperExecuteModeOneHunt();
        }
    };
    
    ////////////////////////////////
    // Mode One Logic and Helpers //
    ////////////////////////////////
    
    //return true if we made a hit and found a ship or not
    this.helperExecuteModeOneHunt = function()
    {
        if(this.debug){
            alert("AI is executing a hunting shot method");
        }
        //currently using a sub par AI
        return this.helperFireHuntingCheaterShot();
    };
    
    //return true if we sunk a ship or not
    this.helperExecuteModeOneKiller = function()
    {
        if(this.debug){
            alert("AI is executing a killing shot method");
        }
        return this.helperFireHuntingCheaterShot();
    };
    
    ////////////////////
    // Mode Two Logic //
    ////////////////////
    
    this.helperExecuteTurnModeTwo = function()
    {
        //all of the turn information is processed here for mode 2
        if(this.debug){
            alert("AI is pretending to work and is in mode 1. I fight for the users.");
        }
        //go into killer mode
        if (this.foundShip === true){
            //TODO: leave killer mode on the confirmation of a destroyed ship
            this.foundShip = this.helperExecuteModeTwoKiller();
        }
        //we are in hunting mode
        else{
            //TODO: set found ship when we get a hit and go into killer mode
            this.foundShip = this.helperExecuteModeTwoHunt();
        }
    };
    
    ////////////////////////////////
    // Mode Two Logic and Helpers //
    ////////////////////////////////

    //return true if we made a hit and found a ship or not
    this.helperExecuteModeTwoHunt = function()
    {
        if(this.debug){
            alert("AI is executing a hunting shot method");
        }
        //currently using a sub par AI
        return this.helperFireHuntingCheaterShot();
    };
    
    //return true if we sunk a ship or not
    this.helperExecuteModeTwoKiller = function()
    {
        if(this.debug){
            alert("AI is executing a killing shot method");
        }
        return this.helperFireKillingCheaterShot();
    };

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