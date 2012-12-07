/**
 * Home of the IT484 Battleship AI Code Base
 * 
 * @author Drew Short <warrick@sothr.com>
 * @author Aaron Willcutt
 */

function AI(engine)
{
    //load the engine
    this.engine = engine;
    
    //indicate if we should debug
    //this toggles the alerts in the engine
    this.debug = false;
    
    // Define a Shot for shot history
    // ie new Shot(1,5,7,'hunt'); A shot at position 5,7 on turn 1 that is hunting
    function Shot(x, y, type, message)
    {
        this.x = x;
        this.y = y;
        this.type = type;
        this.message = message;
    }
    
    //history of shots the AI has made in the form of [shot{x:x,y:y},shot{x:x,y:y}]
    this.shotHistory = [];
    
    //logic flags for triggering hunting vs killing mode
    //always start the AI in hunting mode
    this.areHunting = true;
    
    //indicator that the ship we are hunting is vertical
    this.killingIsVertical = false;
    
    //a log of all useful hit shots
    this.hitShots = [];
    
    //store the last hit we made
    this.getLastHit = function()
    {
        if (this.hitShots.length < 1)
        {
            return;
        }
        return this.hitShots[this.hitShots.length-1];
    }
    
    //store the last shot
    this.lastShot;
    
    //hits that are no longer useful
    this.exhaustedHitShots = [];
    
    /////////////////////
    // General Helpers //
    /////////////////////
    
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
  
  /**
       //Function to create a weighted array of shots to choose shots based on effectiveness rather than randomness. 
        function getWeightedShot()
        {
            //get a weighted shot type
            var shots = engine.getShotsNotOnCooldown();
            var numOfShots = shots.length-1;
            var weightedShotIndex = getRandomInt(0, numOfShots);
    		var currentShot = 0;
			
			while (currentShot<shots.length)
			{
				for (var i = 0; i < shots.length-1; i++)
				{
		
					//TODO implement setting the weight of each shot object to a specific value. 
		
				}
				currentShot++;
			}
			
            return shots[weightedShotIndex];
        }
        
  */
        
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
            //this.shotHistory.push(randShipCell);
            //fire the shot
            var result = engine.fireShot(randShipCell.x, randShipCell.y);
            this.helperParseShotResults(result);
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
            //this.shotHistory.push(randCell);
            //fire the shot
            var result = engine.fireShot(randCell.x, randCell.y);
            this.helperParseShotResults(result);
        }  
    };
    
    this.helperFireKillingCheaterShot = function()
    {
        //currently the same logic
        return this.helperFireHuntingCheaterShot();
    };
    
    ////////////////////
    // AI Helper Code //
    ////////////////////
    
    ///////////////////////////
    // AI Helper Parity Code //
    ///////////////////////////
    
    /**
     * checks outward in a t pattern. if it encounters a non 0 it returns false
     */
    this.helperCellCheckParityOutward = function(x,y,parityGrid,distance)
    {
        //check left,right,up,and down
        return (this.helperCellCheckParityUp(x,y,parityGrid,distance)
            && this.helperCellCheckParityDown(x,y,parityGrid,distance)
            && this.helperCellCheckParityLeft(x,y,parityGrid,distance)
            && this.helperCellCheckParityRight(x,y,parityGrid,distance));
    };
    
    /**
     * checks outward in a horizontal line to the left. if it encounters a non 0 it returns false
     */
    this.helperCellCheckParityUp = function(x,y,parityGrid,distance)
    {
        // Check Up
        //make sure up isn't off the grid
        if (y-distance >= 0)
        {
            // check Up //
            for(var i = 1; i <= distance; i++)
            {
                var mody = y - i;
                //if the cell is not empty then we we 
                if (parityGrid[x][mody] !== 0)
                {
                    return false;
                }
            }
            return true;
        }
        return false;
    };
    
    /**
     * checks outward in a vertical line to the down. if it encounters a non 0 it returns false
     */
    this.helperCellCheckParityDown = function(x,y,parityGrid,distance)
    {
        // Check Down //
        //make sure up isn't off the grid
        if (y+distance < parityGrid.length)
        {
            // check Up //
            for(var i = 1; i <= distance; i++)
            {
                var mody = y + i;
                //if the cell is not empty then we we 
                if (parityGrid[x][mody] !== 0)
                {
                    return false;
                }
            }
            return true;
        }
        return false;
    };
    
    /**
     * checks outward in a horizontal line to the left. if it encounters a non 0 it returns false
     */
    this.helperCellCheckParityLeft = function(x,y,parityGrid,distance)
    {
        // Check left //
        //make sure up isn't off the grid
        if (x-distance >= 0)
        {
            // check Up //
            for(var i = 1; i <= distance; i++)
            {
                var modx = x - i;
                //if the cell is not empty then we we 
                if (parityGrid[modx][y] !== 0)
                {
                    return false;
                }
            }
            return true;
        }
        return false;
    };
    
    /**
     * checks outward in a horizontal line to the right. if it encounters a non 0 it returns false
     */
    this.helperCellCheckParityRight = function(x,y,parityGrid,distance)
    {
        // Check left //
        //make sure up isn't off the grid
        if (x+distance < parityGrid.length)
        {
            // check Up //
            for(var i = 1; i <= distance; i++)
            {
                var modx = x + i;
                //if the cell is not empty then we we 
                if (parityGrid[modx][y] !== 0)
                {
                    return false;
                }
            }
            return true;
        }
        return false;
    };
    
    /**
     * Determine if a cell should be shot at for the sake of parity
     */
    this.helperFillParityCell = function(x,y,parityGrid,parityDistance)
    {
        //no need to calculate parity on cells that have already been shot at or recommended
        if (parityGrid[x][y] !== 0)
        {
            //this should never happen but is here just in case
            return;
        }
        //check up,down,left,and right for parity
        //if this cell is centered and there is no room to the left,right,up,and down then the cell is not parity
        if(!this.helperCellCheckParityOutward(x,y,parityGrid,parityDistance))
        {
            /**
             * Because the grid is built down and to the right from the top-left corner,
             * therefore we only need to check up and left
             */
            if(y-parityDistance >= 0)
            {
                if(this.helperCellCheckParityUp(x,y,parityGrid,parityDistance))
                {
                    //was a valid vertical parity cell
                    parityGrid[x][y] = 1;
                    return;
                }
            }
            //make sure it's not off the grid
            if(x-parityDistance >= 0)
            {
                if(this.helperCellCheckParityLeft(x,y,parityGrid,parityDistance))
                {
                    //was a valid horizontal cell
                    parityGrid[x][y] = 1;
                    return;
                }
            }
            parityGrid[x][y] = 0;
            return;
        }
        parityGrid[x][y] = 1;
    };
    
    /**
     * Generate a parity grid.
     * Useful for determining hunting shots
     */
    this.helperGenerateParityGrid = function(shotGrid)
    {
        var parityGrid = [];
        //find the smallest ship not destroyed
        var eShips = this.engine.getAliveEnemyShips();
        //the parity to catch a ship of min length
        var minLength = eShips[0].shipLength;
        for (var shipIndex = 0; shipIndex < eShips.length; shipIndex++)
        {
            if (eShips[shipIndex].shipLength < minLength) { minLength = eShips[shipIndex].shipLength; }
        }
        //parity distance to check
        var parityDistance = minLength - 1;
        //create starting parity grid (-1 in every location that has already been shot at regardless of outcome)
        for (var i = 0; i < shotGrid.length; i++)
        {
            parityGrid[i] = [];
            for (var j = 0; j < shotGrid.length; j++)
            {
                if (shotGrid[i][j] !== 0)
                {
                    parityGrid[i][j] = -1;
                }
                else
                {
                    parityGrid[i][j] = 0;
                }
            }
        }
        //populate the parity grid
        for (var x = 0; x < shotGrid.length; x++)
        {
            for (var y = 0; y < shotGrid.length; y++)
            {
                //fill the parity cell
                this.helperFillParityCell(x,y,parityGrid,parityDistance);
            }
        }
        return parityGrid;
    };
    
    /**
     * Get a list of shots that are ideal according to the parity grid
     */
    this.helperGetParityShots = function(shotGrid)
    {
        var parityGrid = this.helperGenerateParityGrid(shotGrid);
        var parityShots = [];
        var index = 0;
        //loop over the parity grid and generate the shots that are valid
        for (var x = 0; x < parityGrid.length; x++)
        {
            for (var y = 0; y < parityGrid[x].length; y++)
            {
                if (parityGrid[x][y] > 0)
                {
                    parityShots[index++] = {x:x, y:y};
                }
            }
        }
        return parityShots;
    };
    
    //////////////////////////////////
    // SHOOTING AI HELPER FUNCTIONS //
    //////////////////////////////////
    
    /**
     * Get an array of cells that are known to be hits
     * important for mode 2
     */ 
    this.helperGetKnownHitCells = function(shotGrid)
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
    };
    
    /**
     * Gets all cells for a particular ship
     */
    this.helperGetShipCells = function(ship)
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
    };
    
    /**
     * Remove ship cells from a hits array for the AI
     */
    this.helperRemoveShipCellsFromHitsArray = function(shipCells, arrayToRemoveFrom)
    {
        for (var i = 0; i < shipCells.length; i++)
        {
            var shipCell = shipCells[i];
            for (var j = 0; j < arrayToRemoveFrom.length; j++)
            {
                this.helperRemoveCellFromArray(shipCell, arrayToRemoveFrom);
            }
        }
    };
    
    /**
     * Remove a cell from the specified array if it exists in it
     */
    this.helperRemoveCellFromArray = function(cell, arrayToRemoveFrom)
    {
        for (var i = 0; i < arrayToRemoveFrom.length; i++)
        {
            var cellCompare = arrayToRemoveFrom[i];
            if (cell.x === cellCompare.x && cell.y === cellCompare.y)
                {
                    //remove it from the array
                    arrayToRemoveFrom.splice(i,1);
                }
        }
    };
    
    this.helperDetermineDirection = function(firstShot, secondShot)
    {
        //the shot was to the right
        if ((firstShot.x - secondShot.x) <= -1)
        {
            firstShot.horizontal = true;
            secondShot.horizontal = true;
        }
        //the shot was to the left
        else if ((firstShot.x - secondShot.x) >= 1)
        {
            firstShot.horizontal = true;
            secondShot.horizontal = true;
        }
        //the shot was to the down
        else if ((firstShot.y - secondShot.y) <= -1)
        {
            firstShot.vertical = true;
            secondShot.vertical = true;
        }
        //the shot was to the up
        else if ((firstShot.y - secondShot.y) >= 1)
        {
            firstShot.vertical = true;
            secondShot.vertical = true;
        }
    };
    
    /**
     * Goes through the list of shots returned from the fire function
     * Then determines if we have hit a ship
     * if we have it sets the booleans 
     * and stores the shots in an array to be used as reference points
     * 
     * If it finds that we have sunk a ship it reads the x,y pairs 
     * and removes all cells of that ship from the array of hits
     */
    this.helperParseShotResults = function(shotResults)
    {
        //get most recent shot history from the engine
        var lastShots = this.engine.getPlayerLastShots();
        //parse shot history
        if (lastShots.length > 0)
        {
            for (var i = 0; i < lastShots.length; i++)
            {
                var shot = lastShots[i];
                this.lastShot = shot;
                this.helperAddCellOnlyIfUnique(shot, this.shotHistory);
                //we have a hit
                //we don't care about revealed hits since 
                //there will be a seperate method for those
                if (shot.type === 2)
                {
                    //determine which direction the hit was in and add that info to the shot
                    if(typeof(this.getLastHit()) !== 'undefined')
                    {
                        //set the direction if this was a continued shot that hit
                        this.helperDetermineDirection(this.getLastHit(), shot);
                    }
                    //make sure to disable hunting
                    this.areHunting = false;
                    //add this shot to the hitShots if it is unique
                    this.helperAddCellOnlyIfUnique(shot, this.hitShots)
                }
                //put us in killing mode to take out revealed hits
                else if (shot.type === 4)
                {
                    this.areHunting = false;
                }
            }
        }
        //we sunk a ship!!!!!!!
        if (typeof(shotResults.name) !== 'undefined')
        {
            var cells = this.helperGetShipCells(shotResults);
            //remove the sunk ship cells from the hit shots
            this.helperRemoveShipCellsFromHitsArray(cells, this.hitShots);
            //finally pop the last hit
            this.getNextLastHit();
        }
        //reset to hunting mode if have no shots available in hitShots array
        if (this.hitShots.length < 1)
        {
            this.hitShots = [];
            //reset and go back to hunting mode
            this.areHunting = true;
            this.killingIsVertical = false;
        }
    };
    
    /**
     * removes the current hit from the list of valid hits
     * grabs the next valid hit
     */
    this.getNextLastHit = function()
    {
        //remove the last hit
        this.hitShots.pop();
        return this.getLastHit();
    };
    
    //in place addition only if the cell is unique
    this.helperAddCellOnlyIfUnique = function(addMe, toMe)
    {
        for (var i = 0; i < toMe.length; i++)
        {
            if (toMe[i].x === addMe.x && toMe[i].y === addMe.y)
            {
                //addMe is not unique
                return false;
            }
        }
        toMe.push(addMe);
        return true;
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
        
        //function to get the cells a ship would occupy
        function getShipCells(x,y,isVertical,ship, shipGrid)
        {
            var cells = [];
            var shipLength = ship.shipLength;
            if (isVertical)
            {
                var shipEndy = y + shipLength-1;
                for (var mody = y; mody <= shipEndy; mody++)
                {
                    cells.push({x:x,y:mody});
                }
            }
            else
            {
                var shipEndx = x + shipLength-1;
                for (var modx = x; modx <= shipEndx; modx++)
                {
                    cells.push({x:modx,y:y});
                }
            }
            return cells;
        }
        
        //in place addition only if the cell is unique
        function addOnlyIfUnique(addMe, toMe)
        {
            for (var i = 0; i < toMe.length; i++)
            {
                if (toMe[i].x === addMe.x && toMe[i].y === addMe.y)
                {
                    //addMe is not unique
                    return;
                }
            }
            toMe.push(addMe);
        }
        
        //find the cells we need to check for adjacency
        function getCellsToCheck(cells)
        {
            var shipGrid = engine.getShipGrid();
            var cellsToCheck = [];
            for (var i = 0; i < cells.length; i++)
            {
                var currentCell = cells.pop();
                cellsToCheck.push(currentCell);
                if (cellsToCheck.x-1 > 0 && cellsToCheck.y-1 > 0)
                {
                    addOnlyIfUnique({x:cellsToCheck.x-1,y:cellsToCheck.y-1},cellsToCheck);
                }
                if (cellsToCheck.x+1 < shipGrid.length && cellsToCheck.y-1 > 0)
                {
                    addOnlyIfUnique({x:cellsToCheck.x+1,y:cellsToCheck.y-1},cellsToCheck);
                }
                    if (cellsToCheck.x-1 > 0 && cellsToCheck.y+1 < shipGrid.length)
                {
                    addOnlyIfUnique({x:cellsToCheck.x-1,y:cellsToCheck.y+1},cellsToCheck);
                }
                if (cellsToCheck.x-1 < shipGrid.length && cellsToCheck.y+1 < shipGrid.length)
                {
                    addOnlyIfUnique({x:cellsToCheck.x+1,y:cellsToCheck.y+1},cellsToCheck);
                }
            }
            return cellsToCheck;
        }
        
        //make the verification smarter by only occasionally allowing a ship to be placed right next to another
        function isValidShipPlacement(x,y,isVertical,ship)
        {
            //one in ten chance of allowing placement next to another ship
            var allowPlacementNextToAnotherShip = (getRandomInt(0,100) < 5);
            //if the position isn't valid return false
            if (!engine.validateShipPlacement(x,y,isVertical,ship)) { return false; }
            //do additional checking
            //our current shipGrid
            var shipGrid = engine.getShipGrid();
            //if we're not allowed to be next to another ship we need to check the cells around our ship for other ships
            if (!allowPlacementNextToAnotherShip)
            {
                var cells = getShipCells(x,y,isVertical,ship, shipGrid);
                var cellsToCheck = getCellsToCheck(cells);
                for (var i = 0; i < cellsToCheck.length; i++)
                {
                    //if the adjacent cell is occupied we should not place our ship there
                    var cell = cellsToCheck[i];
                    if (shipGrid[cell.x][cell.y] !== 0)
                    {
                        return false;
                    }
                }
            }
            return true;
        }
        
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
                validPlacement = isValidShipPlacement(rx,ry,rvertical,ship);
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
        //check if we need to place our ships
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
        //go into hunter mode
        if (this.areHunting === true){
            this.helperExecuteModeOneHunt();
        }
        //we are in killer mode
        else{
            this.helperExecuteModeOneKiller();
        }
    };
    
    ////////////////////////////////
    // Mode One Logic and Helpers //
    ////////////////////////////////
    
    /**
     * determine if the provided cell is a valid target.
     * paricularly if at least one cell next to it hasn't been hit
     */
    this.helperModeOneIsCellValid = function(cell, grid)
    {
        var verticalCheck = typeof(cell.vertical) !== 'undefined';
        var horizontalCheck = typeof(cell.horizontal) !== 'undefined';
        if (verticalCheck && cell.vertical)
        {
            //check up
            if (cell.y-1 >= 0)
            {
                if ( grid[cell.x][cell.y-1] === 0)
                {
                    return true;
                }
            }
            if (cell.y+1 < grid.length)
            {
                if (grid[cell.x][cell.y+1] === 0)
                {
                    return true;
                }
            }
        }
        if (horizontalCheck && cell.horizontal)
        {
            //check right
            if (cell.x+1 < grid.length)
            {
                if ( grid[cell.x+1][cell.y] === 0)
                {
                    return true;
                }
            }
            //check left
            if (cell.x-1 >= 0)
            {
                if (grid[cell.x-1][cell.y] === 0)
                {
                    return true;
                }
            }
        }
        if (!verticalCheck && !horizontalCheck)
        {
            if (cell.y-1 >= 0)
            {
                if (grid[cell.x][cell.y-1] === 0)
                {
                    return true;
                }
            }
            //chcek right
            if (cell.x+1 < grid.length)
            {
                if (grid[cell.x+1][cell.y] === 0)
                {
                    return true;
                }
            }
            //check down
            if (cell.y+1 < grid.length)
            {
                if (grid[cell.x][cell.y+1] === 0)
                {
                    return true;
                }
            }
            //check left
            if (cell.x-1 >= 0)
            {
                if (grid[cell.x-1][cell.y] === 0)
                {
                    return true;
                }
            }
        }
        return false;
    };
    
    /**
     * 
     */
    this.helperModeOneGetCellToShootAt = function(cell, grid)
    {
        var target;
        //use orientation information if it is available
        var verticalCheck = typeof(cell.vertical) !== 'undefined';
        var horizontalCheck = typeof(cell.horizontal) !== 'undefined';
        if (verticalCheck)
        {
            if (verticalCheck && cell.vertical)
            {
                //check up
                if (cell.y-1 >= 0 && grid[cell.x][cell.y-1] === 0)
                {
                    target = {x:cell.x,y:cell.y-1};
                }
                else if (cell.y+1 < grid.length && grid[cell.x][cell.y+1] === 0)
                {
                    target = {x:cell.x,y:cell.y+1};
                }
            }
        }
        if (horizontalCheck)
        {
            if (horizontalCheck && cell.horizontal)
            {
                if (cell.x+1 < grid.length && grid[cell.x+1][cell.y] === 0)
                {
                    target = {x:cell.x+1,y:cell.y};
                }
                else if (cell.x-1 >= 0 && grid[cell.x-1][cell.y] === 0)
                {
                    target = {x:cell.x-1,y:cell.y};
                }
            }
        }
        //no information available so search around a little
        if (!verticalCheck && !horizontalCheck)
        {
            //check up
            if (cell.y-1 >= 0 && grid[cell.x][cell.y-1] === 0)
            {
                target = {x:cell.x,y:cell.y-1};
            }
            //chcek right
            else if (cell.x+1 < grid.length && grid[cell.x+1][cell.y] === 0)
            {
                target = {x:cell.x+1,y:cell.y};
            }
            //check down
            else if (cell.y+1 < grid.length && grid[cell.x][cell.y+1] === 0)
            {
                target = {x:cell.x,y:cell.y+1};
            }
            //check left
            else
            {
                target = {x:cell.x-1,y:cell.y};
            }
        }
        //choose a target
        return target;
    };
    
    //logic for hunting mode for mode one
    //return true if we made a hit and found a ship or not
    this.helperExecuteModeOneHunt = function()
    {
        if(this.debug){
            alert("AI is executing a hunting shot method");
        }
        //hunt according to parity
        //get a list of parity cell we can use to search for a ship
        var parityShots = this.helperGetParityShots(this.engine.getShotGrid());
        //choose a parity shot at random
        var randIndex = getRandomInt(0,parityShots.length-1);
        var cellToShootAt = parityShots[randIndex];
        //fire this shot
        var results = this.engine.fireShot(cellToShootAt.x,cellToShootAt.y);
        this.helperParseShotResults(results);
    };
    
    //return true if we sunk a ship or not
    this.helperExecuteModeOneKiller = function()
    {
        if(this.debug){
            alert("AI is executing a killing shot method");
        }
        var cellToShootAt;
        //shoot at known avaialable cells first
        var knownAvailableHits = this.helperGetKnownHitCells(this.engine.getShotGrid());
        if (knownAvailableHits.length > 0)
        {
            var knownAvailableHits = this.helperGetKnownHitCells(this.engine.getShotGrid());
            var randIndex = getRandomInt(0,knownAvailableHits.length-1);
            cellToShootAt = knownAvailableHits[randIndex];
        }
        var validCell = true;
        do
        {
            if (this.hitShots.length < 1)
            {
                this.hitShots = [];
                //if none of the hits work out we need to go back to hunting
                 this.helperExecuteModeOneHunt();
                 return;
            }
            var validCell = this.helperModeOneIsCellValid(this.getLastHit(), this.engine.getShotGrid());
            if (!validCell) { this.getNextLastHit(); }
            
        } while (!validCell);
        //now start hunting according to the lastHit
        cellToShootAt = this.helperModeOneGetCellToShootAt(this.getLastHit(), this.engine.getShotGrid());
        //fire this shot
        var results = this.engine.fireShot(cellToShootAt.x,cellToShootAt.y);
        this.helperParseShotResults(results);
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
        //go into hunter mode
        if (this.areHunting === true){
            this.helperExecuteModeTwoHunt();
        }
        //we are in killer mode
        else{
            this.helperExecuteModeTwoKiller();
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
        //add logic to choose shots based on weight
        var cellToShootAt;
        //shoot at known avaialable cells first
        var knownAvailableHits = this.helperGetKnownHitCells(this.engine.getShotGrid());
        if (knownAvailableHits.length > 0)
        {
            var knownAvailableHits = this.helperGetKnownHitCells(this.engine.getShotGrid());
            var randIndex = getRandomInt(0,knownAvailableHits.length-1);
            cellToShootAt = knownAvailableHits[randIndex];
        }
        //otherwise hunt according to parity
        else
        {
            //get a list of parity cell we can use to search for a ship
            var parityShots = this.helperGetParityShots(this.engine.getShotGrid());
            //choose a parity shot at random
            var randIndex = getRandomInt(0,parityShots.length-1);
            cellToShootAt = parityShots[randIndex];
        }
        //fire this shot
        var results = this.engine.fireShot(cellToShootAt.x,cellToShootAt.y);
        this.helperParseShotResults(results);
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
    
    
        
         // once ship is hit we search for orientation. We limit shots to cells within the grid which are affected by fog of war.
         
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