// IT484 Battleship implementation
/**
 *      Example ship grid with numbering for reference (x1,y1 to x2,y2)
 *      Carrier     :   0,0 to 4,0
 *      Battleship  :   0,1 to 0,4
 *      Cruiser     :   5,4 to 5,6
 *      Submarine   :   2,7 to 4,7
 *      Destroyer   :   8,7 to 8,8
 *
 *      0   1   2   3   4   5   6   7   8   9
 *  0   C   C   C   C   C   x   x   x   x   x
 *  1   B   x   x   x   x   x   x   x   x   x
 *  2   B   x   x   x   x   x   x   x   x   x
 *  3   B   x   x   x   x   x   x   x   x   x
 *  4   B   x   x   x   x   C   x   x   x   x
 *  5   x   x   x   x   x   C   x   x   x   x
 *  6   x   x   x   x   x   C   x   x   x   x
 *  7   x   x   S   S   S   x   x   x   D   x
 *  8   x   x   x   x   x   x   x   x   D   x
 *  9   x   x   x   x   x   x   x   x   x   x
 *
 *      Example Empty Shot Grid
 *      (0) indicates fog of war (nethier a hit or miss)
 *
 *      0   1   2   3   4   5   6   7   8   9
 *  0   0   0   0   0   0   0   0   0   0   0
 *  1   0   0   0   0   0   0   0   0   0   0
 *  2   0   0   0   0   0   0   0   0   0   0
 *  3   0   0   0   0   0   0   0   0   0   0
 *  4   0   0   0   0   0   0   0   0   0   0
 *  5   0   0   0   0   0   0   0   0   0   0
 *  6   0   0   0   0   0   0   0   0   0   0
 *  7   0   0   0   0   0   0   0   0   0   0
 *  8   0   0   0   0   0   0   0   0   0   0
 *  9   0   0   0   0   0   0   0   0   0   0
 *
 *      Example Sunk Shot Grid
 *      (1) indicates a miss
 *      (2) indicates a hit
 *
 *      0   1   2   3   4   5   6   7   8   9
 *  0   2   2   2   2   2   1   1   1   1   1
 *  1   2   1   1   1   1   1   1   1   1   1
 *  2   2   1   1   1   1   1   1   1   1   1
 *  3   2   1   1   1   1   1   1   1   1   1
 *  4   2   1   1   1   1   2   1   1   1   1
 *  5   1   1   1   1   1   2   1   1   1   1
 *  6   1   1   1   1   1   2   1   1   1   1
 *  7   1   1   2   2   2   1   1   1   2   1
 *  8   1   1   1   1   1   1   1   1   2   1
 *  9   1   1   1   1   1   1   1   1   1   1
 * 
 * @author Drew Short <warrick@sothr.com>
 */

//Clone functionality for custom objects
//doesn't clone methods unfortunately, no real way to fix that
function clone(obj)
{
    return JSON.parse(JSON.stringify(obj));
}

//clone a specific function
Function.prototype.clone = function() {
    var fct = this;
    var clone = function() {
        return fct.apply(this, arguments);
    };
    clone.prototype = fct.prototype;
    for (var property in fct) {
        if (fct.hasOwnProperty(property) && property !== 'prototype') {
            clone[property] = fct[property];
        }
    }
    return clone;
};

//For storing objects in the local storage
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

//For retriving objects from local storage. Returns a null if there is no object at the key
Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};

//Create an empty grid array
function createEmptyGridArray(size)
{
    var newGrid = [];
    for (var x = 0; x < size; x++)
    {
        newGrid[x] = [];
        for (var y = 0; y < size; y++)
        {
            newGrid[x][y] = 0;
        }
    }
    return newGrid;
}

///////////////////////////////
// Custom Object Defenitions //
///////////////////////////////

//Array of shot messages based on shot impact on the grid
var ShotMessages = [];
ShotMessages[0] = "FogOfWar";
ShotMessages[1] = "Miss";
ShotMessages[2] = "Hit";
ShotMessages[3] = "RevealMiss";
ShotMessages[4] = "RevealHit";

//the class that defines a ship on the grid.
function Ship(name, abbreviation, shipLength, shots)
{
    this.name = name; // name: the name of the ship type.
    this.shots = shots; // shots: an array of shot types available for this ship.
    this.shipLength = shipLength; // shipLength: the pre-defined length of the ship. This is used when populating the grid.
    this.damage = 0; //a simple damage counter. When this counter equals the length it is destroyed
    this.isVertical = false; //indicates if the ship is positioned vertically or horizontally
    this.abbreviation = abbreviation;

    //Indicates if the ship is destroyed 
    this.isDestroyed = function()
    {
        return (this.damage >= this.shipLength);
    };

    //decrement the cooldown on all shots for this ship
    this.decCooldown = function()
    {
        for (var i = 0; i < shots.length; i++)
        {
            this.shots[i].decCooldown();
        }
    };
}

//the class that defines a shot and how it will interact with the grids.
function Shot(shotName, shotCooldown)
{
    this.name = shotName;
    this.cooldownLength = shotCooldown;
    this.cooldownTimer = 0;

    //define what a shot does. This is the only function allowed  in this class so that cloning it is possible
    this.fire = function(x, y, targetShipGrid, shotGrid)
    {
        alert("I'm not implemented!!!!!!!");
    };

    //determine if the shot is ready to be fired again
    this.isAvailable = function()
    {
        return this.cooldownTimer === 0;
    };

    //set the cooldown timer
    this.fired = function()
    {
        this.cooldownTimer = this.cooldownLength;
    };

    //deincrement the cooldown timer, but only if it isn't ready
    this.decCooldown = function()
    {
        if (this.cooldownTimer > 0) { this.cooldownTimer--; }
    };
}

//clone a ship and its function
function cloneShip(originalShip)
{
    var clonedShip = clone(originalShip);
    //walk through the shots and clone each
    var clonedShots = [];
    for(var i = 0; i < originalShip.shots.length; i++)
    {
        clonedShots[i] = cloneShot(originalShip.shots[i]);
    }
    clonedShip.shots = clonedShots;
    clonedShip.decCooldown = originalShip.decCooldown.clone();
    clonedShip.isDestroyed = originalShip.isDestroyed.clone();
    return clonedShip;
}

//clone a shot and its functions
function cloneShot(originalShot)
{
    var clonedShot = clone(originalShot);
    clonedShot.fire = originalShot.fire.clone();
    clonedShot.isAvailable = originalShot.isAvailable.clone();
    clonedShot.fired = originalShot.fired.clone();
    clonedShot.decCooldown = originalShot.decCooldown.clone();
    return clonedShot;
}

///////////////////////
// BattleShip Engine //
///////////////////////

//the engine that will interface with the GUI and manage the logic of the game
function Engine()
{
    //The available ships (this is an array of available ship objects)
    //availableShips

    // The grids to be used //
    //Player1 Grids
    this.player1ShipGrid = [];
    this.player1ShotGrid = [];
    //Player2 Grids
    this.player2ShipGrid = [];
    this.player2ShotGrid = [];

    //a history of shots for each player
    this.player1ShotHistory = [];
    this.player2ShotHistory = [];

    //an array of ships for each player
    this.player1Ships = [];
    this.player2Ships = [];

    //Watch value to represent who's turn it is
    this.isFirstPlayer = true;

    //turn counter
    //initialized to 0 so that when we change players to setup ship it ends up at one for the first turn
    this.turnCounter = 0;
    
    //current user selected shot
    this.player1SelectedShot;
    this.player2SelectedShot;

    /**
     * Select a shot to fire
     */
    this.selectShot = function(shot)
    {
        if (this.isFirstPlayer) { this.player1SelectedShot = shot; }
        else { this.player2SelectedShot = shot; }
    };

    /**
     * Fire the selected shot at the opponenet
     * returns an undefined if there was an error
     * returns the ship(s) destroyed if any were destroyed
     * returns false if no ships were destroyed
     * TODO: I can be minimized and made easier to read by using a helper function
     */
    this.fireShot = function(x, y)
    {
        var message = "";
        //firing logic if this is the first player shooting
        if (this.isFirstPlayer)
        {
            var shipsBeforeShot = this.helperDetermineShipsNotSunk(this.player2Ships);
            //make sure that the shot that has been selected actually exists
            if (typeof(this.player1SelectedShot) === 'undefined')
            {
                alert("The shot that has been selected does not exist, please make sure you are in the right mode.");
                return;
            }
            //check if the shot is available and alert if it is not
            if (!this.player1SelectedShot.isAvailable())
            {
                alert(this.player1SelectedShot.name + " has " + this.player1SelectedShot.cooldownTimer + " turns before it is usable again.");
                return;
            }
            message = this.player1SelectedShot.fire(x, y, this.player2ShipGrid, this.player1ShotGrid);
            if (message instanceof Array)
            {
                var i = 0;
                while ( i < message.length )
                {
                    this.player1ShotHistory.push("p1_t"+this.turnCounter+": "+message[i]);
                    i++;
                }
            }
            else
            {
                this.player1ShotHistory.push("p1_t"+this.turnCounter+": "+message);
            }
            var shipsAfterShot = this.helperDetermineShipsNotSunk(this.player2Ships);
            //check if we have sunk any ships and if so add a message and return the ship that was sunk
            var sunkShips = this.helperCompareShipsForSunk(shipsBeforeShot, shipsAfterShot);
            //check if we sunk any ships
            if (sunkShips !== false)
            {
                //check if it is an array or not
                if (sunkShips instanceof Array)
                {
                    for(var i = 0; i < sunkShips.length; i++)
                    {
                        this.player1ShotHistory.push("p1_t"+this.turnCounter+": Sunk "+sunkShips[i].name);
                    }
                }
                else
                {
                    this.player1ShotHistory.push("p1_t"+this.turnCounter+": Sunk "+sunkShips.name);
                }
            }
            //indicate that we have fired this shot
            this.player1SelectedShot.fired();
            return sunkShips;
        }
        //firing logic if this is the second player shooting
        else
        {
            var shipsBeforeShot = this.helperDetermineShipsNotSunk(this.player1Ships);
            //make sure that the shot that has been selected actually exists
            if (typeof(this.player2SelectedShot) === 'undefined')
            {
                alert("The shot that has been selected does not exist, please make sure you are in the right mode.");
                return;
            }
            //check if the shot is available and alert if it is not
            if (!this.player2SelectedShot.isAvailable())
            {
                alert(this.player2SelectedShot.name + " has " + this.player2SelectedShot.cooldownTimer + " turns before it is usable again.");
                return;
            }
            message = this.player2SelectedShot.fire(x, y, this.player1ShipGrid, this.player2ShotGrid);
            if (message instanceof Array)
            {
                var i = 0;
                while ( i < message.length )
                {
                    this.player2ShotHistory.push("p2_t"+this.turnCounter+": "+message[i]);
                    i++;
                }
            }
            else
            {
                this.player2ShotHistory.push("p2_t"+this.turnCounter+": "+message);
            }
            var shipsAfterShot = this.helperDetermineShipsNotSunk(this.player1Ships);
            //check if we have sunk any ships and if so add a message and return the ship that was sunk
            var sunkShips = this.helperCompareShipsForSunk(shipsBeforeShot, shipsAfterShot);
            //check if we sunk any ships
            if (sunkShips !== false)
            {
                //check if it is an array or not
                if (sunkShips instanceof Array)
                {
                    for(var i = 0; i < sunkShips.length; i++)
                    {
                        this.player2ShotHistory.push("p2_t"+this.turnCounter+": Sunk "+sunkShips[i].name);
                    }
                }
                else
                {
                    this.player2ShotHistory.push("p2_t"+this.turnCounter+": Sunk "+sunkShips.name);
                }
            }
            //indicate that we have fired this shot
            this.player2SelectedShot.fired();
            //return the sunk ship(s)
            return sunkShips;
        }
    };
    
    this.helperFireShotDetermineIsHit = function(message)
    {
        //check the message for "Hit"
        if (message.indexOf("Hit") !== -1)
        {
            return true;
        }
        return false;
    };
    
    //get an array of ships that are not destroyed
    this.helperDetermineShipsNotSunk = function(ships)
    {
        var shipsNotSunk = [];
        var j = 0;
        for (var i = 0; i < ships.length; i++)
        {
            //if the ship is not sunk add it to the return array
            if (!ships[i].isDestroyed())
            {
                shipsNotSunk[j++] = ships[i];
            }
        }
        return shipsNotSunk;
    };
    
    //compare two ship arrays to determine if a new ship has been sunk
    //returns false if a ship is not sunk
    //returns the ship that was sunk if one was sunk
    this.helperCompareShipsForSunk = function(shipsOld, shipsNew)
    {
        //if the arrays are the same size then nothing has changed
        if (shipsOld.length === shipsNew.length)
        {
            return false;
        }
        else
        {
            var ships = [];
            var j = 0;
            //now loop through the ship arrays and compare them to find the one that isn't contained
            for (var i = 0; i < shipsOld.length; i++)
            {
                //see if the ship is missing from the new ship array
                var temp = this.helperFireShotDetermineContainsShip(shipsNew, shipsOld[i]);
                //if it isn't contained we've found a missing ship
                if (!temp)
                {
                    ships[j++] = shipsOld[i];
                }
                //continue looping because it is possible to destroy multiple ships per turn
            }
            if (ships.length === 0)
            {
                return false;
            }
            else if (ships.length === 1)
            {
                return ships[0];
            }
            else
            {
                return ships;
            }
        }
    };
    
    //determine what ship is missing between two arrays
    this.helperFireShotDetermineContainsShip = function(shipsToSearch, shipToLookFor)
    {
        for (var i = 0; i < shipsToSearch.length; i++)
        {
            if (shipsToSearch[i].name === shipToLookFor.name)
            {
                return true;
            }
        }
        return false;
    };
    
    /**
     * internal function to verify if the requested ship placement is valid
     * Returns true if it is valid, false otherwise
     */
    this.helperValidateShipPlacement = function(startx,starty,isVertical,ship,shipGrid)
    {
        //check if the positioning is valid for a vertical placement
        if(isVertical)
        {
            var endy = starty + ship.shipLength;
            //if it will be positioned off the grid it is an immediate false
            if (endy > 9) { return false; }
            //make sure there are no ships already in these cells
            for (var i = starty; i < endy; i++)
            {
                if (shipGrid[startx][i] !== 0) { return false; }
            }
        }
        //check if the positioning is valid for a horizontal placement
        else
        {
            var endx = startx + ship.shipLength;
             //if it will be positioned off the grid it is an immediate false
            if (endx > 9) { return false; }
            //make sure there are no ships already in these cells
            for (var i = startx; i < endx; i++)
            {
                if (shipGrid[i][starty] !== 0) { return false; }
            }
        }
        //placement passes all tests
        return true;
    };

    //determines if the request placement is valid 
    this.validateShipPlacement = function(startx,starty,isVertical,ship)
    {
        if(this.isFirstPlayer)
        {
            return this.helperValidateShipPlacement(startx,starty,isVertical,ship,this.player1ShipGrid);
        }
        else
        {
            return this.helperValidateShipPlacement(startx,starty,isVertical,ship,this.player2ShipGrid);
        }
    };

    //this is a player agnostic function for placing a ship on a specific grid
    this.helperPlaceShipOnGrid = function(x, y, ship, grid)
    {
        //place the ship vertically
        if (ship.isVertical)
        {
            //place the ship vertically
            var endY = y + ship.shipLength;
            var posY = y;
            for (posY; posY < endY; posY++)
            {
                grid[x][posY] = ship;
            }
        }
        //place the ship horizontally
        else
        {
            //place the ship horizontally
            var endX = x + ship.shipLength;
            var posX = x;
            for (posX; posX < endX; posX++)
            {
                grid[posX][y] = ship;
            }
        }
    };

    //place a ship on the current player;s grid
    this.placeShip = function(startx, starty, isVertical, ship, overridePlacement)
    {
        //only palce a ship if its placement is valid
        if (overridePlacement || this.validateShipPlacement(startx,starty,isVertical,ship))
        {
            //The grid location of the ship (important for placing the ship on the grid)
            ship.startx = startx; //store the starting x location of the ship
            ship.starty = starty; //store the starting y location of the ship
            ship.isVertical = isVertical; //store if the ship is vertical or not
            
            //create a clone so we don't get reference errors
            var shipClone = cloneShip(ship);
            
            //sort by player
            if (this.isFirstPlayer)
            {
                //store the ship for the player at the end of the ship array
                this.player1Ships.push(shipClone);
                //now populate the array with the ship
                this.helperPlaceShipOnGrid(startx, starty, shipClone, this.player1ShipGrid);
            }
            else
            {
                //store the ship for the player at the end of the ship array
                this.player2Ships.push(shipClone);
                //now populate the array with the ship
                this.helperPlaceShipOnGrid(startx, starty, shipClone, this.player2ShipGrid);
            }
        }
    };

    //return the shot history of the current player
    this.getShotHistory = function()
    {
        if (this.isFirstPlayer) { return this.player1ShotHistory; }
        return this.player2ShotHistory;
    };

    //return the shot types that are available for the current player
    this.getAvailableShots = function()
    {
        var availableShots = [];
        //the regular shot is always available and is the first shot listed
        availableShots[0] = regularShot;
        var i = 1;
        //get the first player's available shots
        if (this.isFirstPlayer)
        {
            for (var j = 0; j < this.player1Ships.length; j++)
            {
                var ship = this.player1Ships[j];
                //skip the ship if it is destroyed
                if (!ship.isDestroyed())
                {
                    for (var k = 0; k < ship.shots.length; k++)
                    {
                        var shot = ship.shots[k];
                        availableShots[i++] = shot;
                    }
                }
            }
        }
        //get the second player's available shots
        else
        {
            for (var j = 0; j < this.player2Ships.length; j++)
            {
                var ship = this.player2Ships[j];
                if (!ship.isDestroyed())
                {
                    for (var k = 0; k < ship.shots.length; k++)
                    {
                        var shot = ship.shots[k];
                        availableShots[i++] = shot;
                    }
                }
            }
        }
        return availableShots;
    };
    
    //return the shot types that are not on cooldown
    //this returns only an array of shots from ships that exist and are not on cooldown
    this.getShotsNotOnCooldown = function()
    {
        var shotsNotOnCooldown = [];
        var j = 0;
        var shots = this.getAvailableShots();
        for (var i = 0; i < shots.length; i++)
        {
            if (shots[i].isAvailable())
            {
                shotsNotOnCooldown[j++] = shots[i];
            }
        }
        return shotsNotOnCooldown;
    };

    //get the ships available for the current player
    this.getPlayerShips = function()
    {
        if (this.isFirstPlayer)
        {
            return this.player1Ships;
        }
        else
        {
            return this.player2Ships;
        }
    };
    
    //get an array of all 'alive' player ships
    this.getAlivePlayerShips = function()
    {
        return this.helperDetermineShipsNotSunk(this.getPlayerShips());
    };
    
    //gets the opponent's ships
    this.getEnemyShips = function()
    {
        if (this.isFirstPlayer)
        {
            return this.player2Ships;
        }
        else
        {
            return this.player1Ships;
        }
    };
    
    //get an array of a;; 'alive' enemy ships
    this.getAliveEnemyShips = function()
    {
        return this.helperDetermineShipsNotSunk(this.getEnemyShips());
    };

    /**
     * Returns the shot grid of the current player
     */
    this.getShotGrid = function()
    {
        if (this.isFirstPlayer) { return clone(this.player1ShotGrid); }
        return clone(this.player2ShotGrid);
    };
    
    /**
     * Returns the enemy shot grid
     */
    this.getEnemyShotGrid = function()
    {
        if (this.isFirstPlayer) { return clone(this.player2ShotGrid); }
        return clone(this.player1ShotGrid);
    };

    /**
     * Returns the ship grid for the current player
     */
    this.getShipGrid = function()
    {
        if (this.isFirstPlayer) { return clone(this.player1ShipGrid); }
        return clone(this.player2ShipGrid);
    };

    //clear the local storage and prepare the engine for a new game
    //TODO: implement this
    this.forfit = function()
    {
        this.isFirstPlayer = true;
        this.turnCounter = 0;
        //clear the data from session storage
        this.clearLocalStorage();
    };
    
    //returns true if the opponent has no ships left
    this.isGameOver = function()
    {
        //check if the current player has no ships
        //check first players ship
        if (this.isFirstPlayer)
        {
            if (this.player2Ships.length > 0){
                var i = 0;
                while (i < this.player2Ships.length)
                {
                    //if one ship isn't destroyed then the the game is still going
                    if (!this.player2Ships[i].isDestroyed())
                    {
                        return false;
                    }
                    i++;
                }
                alert("The game is over, Player 1 wins");
                return true;
            }
        }
        //check second players ship
        else
        {
            if (this.player1Ships.length > 0){
                var i = 0;
                while (i < this.player1Ships.length)
                {
                    //if one ship isn't destroyed then the the game is still going
                    if (!this.player1Ships[i].isDestroyed())
                    {
                        return false;
                    }
                    i++;
                }
                alert("The game is over, Player 2 wins");
                return true;
            }
        }
        return false;
    };

    //return a list of available ships
    this.getAvailableShips = function()
    {
        var clonedAvailableShips = [];
        //return clone of the array of ships
        for (var i = 0; i < this.availableShips.length; i++)
        {
            clonedAvailableShips[i] = cloneShip(this.availableShips[i]);
        }
        return clonedAvailableShips;
    };

    //walk through deincrement all the timers on the shots in all the ships
    this.decShipShotTimers = function(ships)
    {
        regularShot.decCooldown();
        for (var i = 0; i < ships.length; i++)
        {
            ships[i].decCooldown();
        }
    };

    //trigger a player switch
    this.changePlayers = function()
    {
        //check if he game has ended
        if (this.isGameOver())
        {
            //return true to indicate that the game is over
            return true;
        }
        //change to the second player
        if (this.isFirstPlayer)
        {
            //decrement all shot timers for current players ships
            this.decShipShotTimers(this.player1Ships);
            this.turnCounter++;
            this.isFirstPlayer = false;
            
            //implement the ai call here so that the ai player is always the second player
            if(this.numberOfPlayers === 1)
            {
                //AI magic here pl0x
                this.ai.executeTurn();
                //return control to the first player
                this.changePlayers();
            }
            
        }
        //change to first player and increment the turn counter
        else
        {
            this.decShipShotTimers(this.player2Ships);
            this.turnCounter++;
            this.isFirstPlayer = true;
        }
        //save the current game state;
        this.saveToLocalStorage();
    };

    //This must be called to save the state when switching pages
    this.saveToLocalStorage = function()
    {
        //we need to remove the ai temporarily and add it back after the save to avoid a circular reference
        var temp = this.ai;
        this.ai = null;
        //save in the session
        sessionStorage.setObject("gameEngine", this);
        //now restore the ai
        this.ai = temp;
        //indicate that the engine was retrieved from sessionStorage
        this.fromStorage = true;
        sessionStorage.gameStateSaved = "true";
    };

    //clear the local storage
    this.clearLocalStorage = function()
    {
        this.fromStorage = false;
        sessionStorage.clear(); //clear session storage
    };
}

//define init as a prototype of Engine so it isn't recreated each time an Engine object is created.
//This is good because the initialization code is entirely static.
//The ideal way to initialize an engine is by calling new Engine().init(ai) so as to initialize the engine with previous data. This acts a pseudo constructor for that purpose.
Engine.prototype.init = function(AI)
{
    //I am used to initialize the engine
    var newEngine = new Engine();

    //Here I will check the local storage for previous game data and load it if found
    //check if there is any current game state stored
    if (sessionStorage.gameStateSaved && sessionStorage.gameStateSaved === "true")
    {
        //get saved state
        var savedState = sessionStorage.getObject("gameEngine");

        //set engine variables from saved state
        newEngine.isFirstPlayer = savedState.isFirstPlayer;
        newEngine.isModeOne = savedState.isModeOne;
        newEngine.numberOfPlayers = savedState.numberOfPlayers;
        newEngine.turnCounter = savedState.turnCounter;
        newEngine.fromStorage = savedState.fromStorage;

        //copy shot histories over
        newEngine.player1ShotHistory = savedState.player1ShotHistory;
        newEngine.player2ShotHistory = savedState.player2ShotHistory;

        //copy shot grids
        newEngine.player1ShotGrid = savedState.player1ShotGrid;
        newEngine.player2ShotGrid = savedState.player2ShotGrid;

        //copy the ship grids which will be updated further down
        newEngine.player1ShipGrid = savedState.player1ShipGrid;
        newEngine.player2ShipGrid = savedState.player2ShipGrid;

        //initialize with the proper ships and shots
        newEngine.selectGameMode(newEngine.numberOfPlayers, newEngine.isModeOne);

        //create mapping of available ships to be used for populating player listings
        var availableShipsClone = newEngine.getAvailableShips();
        var availableShipsMap = {};
        for (var j = 0; j < availableShipsClone.length; j++)
        {
            var availableShip = availableShipsClone[j];
            availableShipsMap[availableShip.name] = availableShip;
        }

        //synchronize loaded ship and shot info with engine, then place ships
        //process: load player 1 ship array from saved state
        newEngine.isFirstPlayer = true;
        for (var i = 0; i < savedState.player1Ships.length; i++)
        {
            //first player ship that is missing shot functions
            var oldShip = savedState.player1Ships[i];

            //then clone a ship of the appropriate type from the available ships
            var newShip = cloneShip(availableShipsMap[oldShip.name]);

            //then populate the correct damage and shot data
            newShip.damage = oldShip.damage;
            newShip.isVertical = oldShip.isVertical;
            newShip.startx = oldShip.startx;
            newShip.starty = oldShip.starty;

            //then copy all the shot data
            for (var k = 0; k < newShip.shots.length; k++)
            {
                newShip.shots[k].cooldownLength = oldShip.shots[k].cooldownLength;
                newShip.shots[k].cooldownTimer = oldShip.shots[k].cooldownTimer;
            }

            //then place it on the board
            newEngine.placeShip(newShip.startx, newShip.starty, newShip.isVertical, newShip, true);
        }

        //same for player 2
        newEngine.isFirstPlayer = false;
        for (var i = 0; i < savedState.player2Ships.length; i++)
        {
            //first player ship that is missing shot functions
            var oldShip = savedState.player2Ships[i];

            //then clone a ship of the appropriate type from the available ships
            var newShip = cloneShip(availableShipsMap[oldShip.name]);

            //then populate the correct damage and shot data
            newShip.damage = oldShip.damage;
            newShip.isVertical = oldShip.isVertical;
            newShip.startx = oldShip.startx;
            newShip.starty = oldShip.starty;

            //then copy all the shot data
            for (var k = 0; k < newShip.shots.length; k++)
            {
                newShip.shots[k].cooldownLength = oldShip.shots[k].cooldownLength;
                newShip.shots[k].cooldownTimer = oldShip.shots[k].cooldownTimer;
            }

            //then place it on the board
            newEngine.placeShip(newShip.startx, newShip.starty, newShip.isVertical, newShip, true);
        }

        //change back to the correct player we loaded from
        newEngine.isFirstPlayer = savedState.isFirstPlayer;
    }
    else
    {
        //initialize the starting arrays with nothing of size 10x10
        newEngine.player1ShipGrid = createEmptyGridArray(10);
        newEngine.player1ShotGrid = createEmptyGridArray(10);
        newEngine.player2ShipGrid = createEmptyGridArray(10);
        newEngine.player2ShotGrid = createEmptyGridArray(10);
    }
    
    //only initialize the ai if we were given one
    if(AI)
    {
        //initialize the ai
        var ai = new AI(newEngine);
        newEngine.ai = ai;
    }
    //finally I will return the new engine
    return newEngine;
};

//prototype method that loads the ships available
//ships is an array of ships available to be placed on the board at the start of the game
Engine.prototype.loadShips = function(ships)
{
    this.availableShips = ships;
};

//select the game mode and store in the local cache.
//This should only be called from the front page when selecting the version of the game to run.
//basically this is used to switch between single and multi player, and toggle game mode
Engine.prototype.selectGameMode = function(numberOfPlayers, modeOne)
{
    //set the correct booleans for modes 1 and 2 also load the correct ships
    //load mode 1 ships and set booleans
    if (modeOne)
    {
        this.loadShips(mode1Ships());
        //Watch value for the current mode
        this.isModeOne = true;
    }
    //load mode 2 ships and set booleans
    else
    {
        this.loadShips(mode2Ships());
        this.isModeOne = false;
    }

    //TODO: initialize the AI as player 2
    if (numberOfPlayers == 1)
    {
        //remove me later
        alert("Single Player is not implemented. The AI may not be function or be super buggy. You have been warned, pray I don't warn you further.");
        this.numberOfPlayers = 1;
    }
    else if (numberOfPlayers == 2)
    {
        this.numberOfPlayers = 2;
    }
    else
    {
        alert("Invalid number of players: " + numberOfPlayers);
    }
};

//fire a generic shot
function fireGenericShot(x, y, targetShipGrid, shotGrid)
{
    var message = "("+x+","+y+") ";
    //implementation of a regular shot and how it interacts with the grid
    if (shotGrid[x][y] === 1 || shotGrid[x][y] === 2)
    {
        message += ShotMessages[shotGrid[x][y]];
    }
    //reveal miss converted to actual miss
    else if (shotGrid[x][y] === 3)
    {
        shotGrid[x][y] = 1;
        message += ShotMessages[1];
    }
    //reveal hit converted to actual hit
    else if (shotGrid[x][y] === 4)
    {
        targetShipGrid[x][y].damage++;
        shotGrid[x][y] = 2;
        message += ShotMessages[2];
    }
    //miss
    else if (targetShipGrid[x][y] === 0)
    {
        shotGrid[x][y] = 1;
        message += ShotMessages[1];
    }
    //hit
    else if (targetShipGrid[x][y].name !== 0)
    {
        targetShipGrid[x][y].damage++;
        shotGrid[x][y] = 2;
        message += ShotMessages[2];
    }
    return message;
}

//define a regular shot
var regularShot = new Shot("Regular Shot", 1);
//because of the way cloning objects works in javascript, each shot object can only have the fire function, all logic for firing should be in this function.
regularShot.fire = function(x, y, targetShipGrid, shotGrid)
{
    return fireGenericShot(x, y, targetShipGrid, shotGrid);
};

//This defines all the ships available in mode 1 of the game
function mode1Ships()
{
    //define the ships in mode 1. This array of ships will be copied onto the grid of each players
    return new Array(
        new Ship("Carrier", "Ca", 5, []
        ),
        new Ship("Battleship", "B", 4, []
        ),
        new Ship("Cruiser", "Cr", 3, []
        ),
        new Ship("Submarine", "S", 3, []
        ),
        new Ship("Destroyer", "D", 2, []
        )
    );
}

//This defines all the ships available in mode 1 of the game
function mode2Ships()
{
    //Array of shot messages based on shot impact on the grid
    // ShotMessages[0] = "FogOfWar";
    // ShotMessages[1] = "Miss";
    // ShotMessages[2] = "Hit";
    // ShotMessages[3] = "RevealMiss";
    // ShotMessages[4] = "RevealHit";
    
    //define special shots
    //Carrier Special Shot
    var goliathShot = new Shot("Photon Bomb Run", 8);
    goliathShot.fire = function(x, y, targetShipGrid, shotGrid)
    {
        //Shot hits 3 consecutive places. Player chooses a starting grid point
        //and a direction? How will this be handled from input via UI?
        
        //lets simply make it random on the direction... ~DS
        //this shot will take a center spot and randomly shoot up,down,left,right if it is valid
        
        //determine randomly if the shot will go vertically or horizontally
        var messages = [];
        var random = getRandomInt(0,1);
        var isVertical = true;
        if (random === 0) { isVertical = false; }
        if (isVertical)
        {
            random = getRandomInt(0,1);
            var isUp = true;
            if (random === 0) { isUp = false; }
            if (isUp)
            {
                //check if going up will go off the board
                var endy = y - 2;
                if (endy < 0)
                {
                    messages[0] = fireGenericShot(x, y, targetShipGrid, shotGrid);
                    messages[1] = fireGenericShot(x, y+1, targetShipGrid, shotGrid);
                    messages[2] = fireGenericShot(x, y+2, targetShipGrid, shotGrid);
                }
                //if its fine we'll shoot up
                else
                {
                    messages[0] = fireGenericShot(x, y, targetShipGrid, shotGrid);
                    messages[1] = fireGenericShot(x, y-1, targetShipGrid, shotGrid);
                    messages[2] = fireGenericShot(x, y-2, targetShipGrid, shotGrid);
                }
            }
            else
            {
                //check if going down will go off the board
                var endy = y + 2;
                if (endy > 9)
                {
                    messages[0] = fireGenericShot(x, y, targetShipGrid, shotGrid);
                    messages[1] = fireGenericShot(x, y-1, targetShipGrid, shotGrid);
                    messages[2] = fireGenericShot(x, y-2, targetShipGrid, shotGrid);
                }
                //if its fine we'll shoot down
                else
                {
                    messages[0] = fireGenericShot(x, y, targetShipGrid, shotGrid);
                    messages[1] = fireGenericShot(x, y+1, targetShipGrid, shotGrid);
                    messages[2] = fireGenericShot(x, y+2, targetShipGrid, shotGrid);
                }
            }
        }
        else
        {
            random = getRandomInt(0,1);
            var isLeft = true;
            if (random === 0) { isLeft = false; }
            if (isLeft)
            {
                //check if going left will go off the board
                var endx = x - 2;
                if (endx < 0)
                {
                    messages[0] = fireGenericShot(x, y, targetShipGrid, shotGrid);
                    messages[1] = fireGenericShot(x+1, y, targetShipGrid, shotGrid);
                    messages[2] = fireGenericShot(x+2, y, targetShipGrid, shotGrid);
                }
                //if its fine we'll shoot left
                else
                {
                    messages[0] = fireGenericShot(x, y, targetShipGrid, shotGrid);
                    messages[1] = fireGenericShot(x-1, y, targetShipGrid, shotGrid);
                    messages[2] = fireGenericShot(x-2, y, targetShipGrid, shotGrid);
                }
            }
            else
            {
                //check if going right will go off the board
                var endx = x - 2;
                if (endx > 9)
                {
                    messages[0] = fireGenericShot(x, y, targetShipGrid, shotGrid);
                    messages[1] = fireGenericShot(x-1, y, targetShipGrid, shotGrid);
                    messages[2] = fireGenericShot(x-2, y, targetShipGrid, shotGrid);
                }
                //if its fine we'll shoot right
                else
                {
                    messages[0] = fireGenericShot(x, y, targetShipGrid, shotGrid);
                    messages[1] = fireGenericShot(x+1, y, targetShipGrid, shotGrid);
                    messages[2] = fireGenericShot(x+2, y, targetShipGrid, shotGrid);
                }
            }
        }
        return messages;
    };
    
    //Battleship Special Shot
    var ravagerShot = new Shot("Black Hole", 12);
    ravagerShot.fire = function(x, y, targetShipGrid, shotGrid)
    {
        //Shot hits in a central location and then hits one grid point
        //in each direction up, right, down, left from chosen location
        //if the cell is already miss or hit
        var messages = [];
        var i = 0;
        if (x-1 >= 0) { messages[i++] = fireGenericShot(x-1, y, targetShipGrid, shotGrid); }
        messages[i++] = fireGenericShot(x, y, targetShipGrid, shotGrid);
        if (x+1 <= 9) { messages[i++] = fireGenericShot(x+1, y, targetShipGrid, shotGrid); }
        if (y-1 >= 0) { messages[i++] = fireGenericShot(x, y-1, targetShipGrid, shotGrid); }
        if (y+1 <= 9) { messages[i++] = fireGenericShot(x, y+1, targetShipGrid, shotGrid); }
        return messages;
    };
    
    //Cruiser Special Shot
    var harvesterShot = new Shot("Scrap Radar", 6);
    harvesterShot.fire = function(x, y, targetShipGrid, shotGrid)
    {
        //Shot is fired at location and if it would be a hit, it reveals grid
        //points to the up, right, down, left locations if they would be a hit
        //or not as well. Hits similar to Black Hole but hits as reveal hit or
        //reveal miss instead of true hit or miss.
        
        function fireScrapShot(x, y, targetShipGrid, shotGrid)
        {
            var message = "("+x+","+y+") ";
            //implementation of a regular shot and how it interacts with the grid
            if (shotGrid[x][y] > 0 && shotGrid[x][y] < 5)
            {
                message += ShotMessages[shotGrid[x][y]];
            }
            //reveal miss
            else if (targetShipGrid[x][y] === 0)
            {
                shotGrid[x][y] = 3;
                message += ShotMessages[3];
            }
            //reveal hit
            else if (targetShipGrid[x][y].name !== 0)
            {
                shotGrid[x][y] = 4;
                message += ShotMessages[4];
            }
            return message;
        }
        
        var messages = [];
        var i = 0;
        if (x-1 >= 0) { messages[i++] = fireScrapShot(x-1, y, targetShipGrid, shotGrid); }
        messages[i++] = fireScrapShot(x, y, targetShipGrid, shotGrid);
        if (x+1 <= 9) { messages[i++] = fireScrapShot(x+1, y, targetShipGrid, shotGrid); }
        if (y-1 >= 0) { messages[i++] = fireScrapShot(x, y-1, targetShipGrid, shotGrid); }
        if (y+1 <= 9) { messages[i++] = fireScrapShot(x, y+1, targetShipGrid, shotGrid); }
        return messages;
        
    };
    
    //Submarine Special Shot
    var destroyerShot = new Shot("Plasma Salvo", 4);
    destroyerShot.fire = function(x, y, targetShipGrid, shotGrid)
    {
        //Player independently chooses 3 locations for "regular" shots
        
        //player chooses one location, and then two other locations are chosen at random (but will not shoot at a space other than occupied by a 0 (fog of war)) ~DS
        
        function getRandomCell(exclude, shotGrid)
        {
            var cell = {};
            var valid = false;
            do
            {
                var randomx = getRandomInt(0,9);
                var randomy = getRandomInt(0,9);
                var alreadyHave = false;
                //check if it is in the excludes
                for (var i = 0; i < exclude.length; i++)
                {
                    if (exclude[i][0] === randomx && exclude[i][1] === randomy)
                    {
                        alreadyHave = true;
                        break;
                    }
                }
                //try again
                if (alreadyHave)
                {
                    valid = false;
                    //loop again
                    continue;
                }
                //check if we've already shot here
                if (shotGrid[randomx][randomy] > 0)
                {
                    valid = false;
                    //loop again
                    continue;
                }
                //we found a unique cell that is empty
                valid = true;
                cell.x = randomx;
                cell.y = randomy;
            }
            while (!valid);
            return cell;
        }
        
        var messages = [];
        var exclude = [];
        exclude[0] = [x,y];
        var cell1 = getRandomCell(exclude, shotGrid);
        exclude[1] = [cell1.x, cell1.y];
        var cell2 = getRandomCell(exclude, shotGrid);
        
        messages[0] = fireGenericShot(x, y, targetShipGrid, shotGrid);
        messages[1] = fireGenericShot(cell1.x, cell1.y, targetShipGrid, shotGrid);
        messages[2] = fireGenericShot(cell2.x, cell2.y, targetShipGrid, shotGrid);
        
        return messages;
    };
    
    //Interceptor Special Shot
    var interceptorShot = new Shot("Homing Missile", 6);
    interceptorShot.fire = function(x, y, targetShipGrid, shotGrid)
    {
        //Player chooses a cell location. Spaces that have already been hit are
        //invalid locations for homing missile to hit. Homing missile hits the
        //"closest" grid space that would be a hit from chosen cell location
        
        //check if a cell is a valid
        function isValidCell(x,y,shotGrid)
        {
            if (x < 0 || y < 0) { return false; }
            if (x >= shotGrid.length || y >= shotGrid.length ) { return false; }
            return true;
        }
        
        //check if a cell contains a valid target
        //not already shot at and contains a ship
        function isValidTarget(x,y,shipGrid,shotGrid)
        {
            //check if the location has already been searched
            if (shotGrid[x][y] > 0)
            {
                return false;
            }
            if (shipGrid[x][y] === 0)
            {
                return false;
            }
            return true;
        }
        
        //seach for the nearest ship
        function hitSearch(x,y,shipGrid,shotGrid)
        {
            var cell = {};
            //indicate if we have found our nearest target
            var found = false;
            //position modifier
            var posMod = 0;
            
            //search the selected cell and if it is valid return it
            if(isValidTarget(x,y,shipGrid,shotGrid))
            {
                found = true;
                cell.x = x;
                cell.y = y;
                return cell;
            }
            
            //new expanding search
            //simple clockwise search
            do
            {
                //increment the position finder
                posMod++;
                //check above
                //loop through cells x-1,y-1, x,y-1 and x+1,y-1 first
                var modx;
                var mody = y-posMod;
                for (modx = x-posMod; modx <= (x+posMod); modx++)
                {
                    //if the cell is valid we'll check it for a target
                    if (isValidCell(modx,mody,shotGrid))
                    {
                        //if the cell is a valid target set the vaiables and break out of the loop
                        if (isValidTarget(modx,mody,shipGrid,shotGrid))
                        {
                            found = true;
                            cell.x=modx;
                            cell.y=mody;
                            break;
                        }
                    }
                }
                //only continue searching if we haven't found anything yet
                if(!found)
                {
                    //search right side down
                    //loop through cells x+1,y, x+1,y+1
                    modx = x+posMod;
                    //start with cell y-(posMod+1)
                    for (mody = (y-(posMod+1)); mody <= (y+posMod); mody++)
                    {
                         //if the cell is valid we'll check it for a target
                        if (isValidCell(modx,mody,shotGrid))
                        {
                            //if the cell is a valid target set the vaiables and break out of the loop
                            if (isValidTarget(modx,mody,shipGrid,shotGrid))
                            {
                                found = true;
                                cell.x=modx;
                                cell.y=mody;
                                break;
                            }
                        }
                    }
                }
                //only continue searching if we haven't found anything yet
                if(!found)
                {
                    //search below
                    //loop through cells x,y+1, x-1,y+1
                    mody = y+posMod;
                    for (modx = (x+(posMod-1)); modx >= (x-posMod); modx--)
                    {
                         //if the cell is valid we'll check it for a target
                        if (isValidCell(modx,mody,shotGrid))
                        {
                            //if the cell is a valid target set the vaiables and break out of the loop
                            if (isValidTarget(modx,mody,shipGrid,shotGrid))
                            {
                                found = true;
                                cell.x=modx;
                                cell.y=mody;
                                break;
                            }
                        }
                    }
                }
                //only continue searching if we haven't found anything yet
                if(!found)
                {
                    //search left side up
                    //loop through cells x-1,y
                    modx = x-posMod;
                    for (mody = (y+(posMod-1)); mody > (y-posMod); mody--)
                    {
                         //if the cell is valid we'll check it for a target
                        if (isValidCell(modx,mody,shotGrid))
                        {
                            //if the cell is a valid target set the vaiables and break out of the loop
                            if (isValidTarget(modx,mody,shipGrid,shotGrid))
                            {
                                found = true;
                                cell.x=modx;
                                cell.y=mody;
                                break;
                            }
                        }
                    }
                }
            }
            while(!found);
            return cell;
        }
        
        var target = hitSearch(x, y, targetShipGrid, shotGrid);
        var message = "("+target.x+","+target.y+") ";
        shotGrid[target.x][target.y] = 4;
        message += ShotMessages[4];
        return message;
    };

    //define the ships in mode 2. This array of ships will be copied onto the grid of each players
    return new Array(
        //carrier
        new Ship("Stardust Goliath", "SG", 5, new Array(
                goliathShot
            )
        ),
        //battleship
        new Ship("Galaxy Ravager", "GR", 4, new Array(
                ravagerShot
            )
        ),
        //cruiser
        new Ship("Scrap Harvester", "SH", 3, new Array(
                harvesterShot
            )
        ),
        //submarine
        new Ship("Star Destroyer", "SD",3, new Array(
                destroyerShot
            )
        ),
        //destroyer
        new Ship("Interceptor", "I", 2, new Array(
                interceptorShot
            )
        )
    );
}

/////////////////////////
// Section for AI Code //
/////////////////////////

//ai code has been moved into ai.js

///////////////////////////
// Now Start The Engines //
///////////////////////////

//create the engine that will be used and initialize it.
//init is called to initialize the engine if it already setup or create new data for the engine
//"ai" represents the global ai to be passed in and used with the engine
var ENGINE = new Engine().init(AI);