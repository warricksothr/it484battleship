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
    for (property in fct) {
        if (fct.hasOwnProperty(property) && property !== 'prototype') {
            clone[property] = fct[property];
        }
    }
    return clone;
};

//this is a player agnostic function for placing a ship on a specific grid
function placeShipOnGrid(x, y, ship, grid)
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
}

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
function Ship(name, shipLength, shots)
{
    this.name = name; // name: the name of the ship type.
    this.shots = shots; // shots: an array of shot types available for this ship.
    this.shipLength = shipLength; // shipLength: the pre-defined length of the ship. This is used when populating the grid.
    this.damage = 0; //a simple damage counter. When this counter equals the length it is destroyed
    this.isVertical = false; //indicates if the ship is positioned vertically or horizontally
    
    //Indicates if the ship is destroyed 
    this.isDestroyed = function()
    {
        return this.damage >= this.shipLength;
    };

    //decrement the cooldown on all shots for this ship
    this.decCooldown = function()
    {
        for (var i = 0; i < shots.length; i++)
        {
            shots[i].decCooldown();
        }
    }
}

//the class that defines a shot and how it will interact with the grids.
function Shot(shotName, shotCooldown)
{
    this.name = shotName;
    this.cooldownLength = shotCooldown;
    this.cooldownTimer = 0;
    
    //define what a shot does. This is the only function allowed  in this class so that cloning it is possible
    this.fire = function(x, y, targetShipGrid, shotGrid) {};
    
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

//the class the represents the data to be returned when a turn is complete.
//Drew: not sure how to approach this yet, just a mockup consideration
function TurnData()
{
    
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

//walk through deincrement all the timers on the shots in all the ships
function decShipShotTimers(ships)
{
    for (var i = 0; i < ships.length; i++)
    {
        ships[i].decCooldown();
    }
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
    
    //fire a shot at the opponent's ship grid
    this.fireShot = function(x, y, shot)
    {
        var message = "";
        //firing logic if this is the first player shooting
        if (this.isFirstPlayer)
        {
            message = shot.fire(x, y, this.player2ShipGrid, this.player1ShotGrid);
            this.player1ShotHistory.push("player1: " + x + "," + y + " " + message);
        }
        //firing logic if this is the second player shooting
        else 
        {
            message = shot.fire(x, y, this.player1ShipGrid, this.player2ShotGrid);
            this.player2ShotHistory.push("player2: " + x + "," + y + " " + message);
        }
    };
    
    //place a ship on the current player;s grid
    this.placeShip = function(startx,starty,isVertical,ship)
    {
        //The grid location of the ship (important for placing the ship on the grid)
        ship.startx = startx;
        ship.starty = starty;
        ship.isVertical = isVertical;
        
        //create a clone so we don't get reference errors
        var shipClone = cloneShip(ship)
        
        //sort by player
        if (this.isFirstPlayer)
        {
            //store the ship for the player at the end of the ship array
            this.player1Ships.push(shipClone);
            //now populate the array with the ship
            placeShipOnGrid(startx, starty, shipClone, this.player1ShipGrid);
        }
        else
        {
            //store the ship for the player at the end of the ship array
            this.player2Ships.push(shipClone);
            //now populate the array with the ship
            placeShipOnGrid(startx, starty, shipClone, this.player2ShipGrid);
        }
    };
    
    //return the shot history of the current player
    this.getShotHistory = function()
    {
        if (this.isFirstPlayer) { return this.player1ShotHistory; }
        return this.player2ShotHistory;
    };
    
    //return the shot types that are available
    this.getAvailableShots = function() {};
    
    //return the shot types that are on cooldown
    this.getShotsOnCooldown = function() {};
    
    /**
     * Returns the shot grids of the current player
     */
    this.getShotGrids = function()
    {
        if (this.isFirstPlayer) { return clone(this.player1ShotGrid); }
        return clone(this.player2ShotGrid);
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
        //TODO: clear data from the local storage
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
    
    //trigger a player switch
    this.changePlayers = function()
    {
        //change to the second player
        if (this.isFirstPlayer)
        {
            decShipShotTimers(this.player1Ships);
            this.isFirstPlayer = false;
        }
        //checnge to first player and increment the turn counter
        else
        { 
            decShipShotTimers(this.player2Ships);
            this.turnCounter++;
            this.isFirstPlayer = true;
        }
    };
}

//define init as a prototype of Engine so it isn't recreated each time an Engine object is created.
//This is good because the initialization code is entirely static.
//The ideal way to initialize an engine is by calling new Engine().init() so as to initialize the engine with previous data. This acts a pseudo constructor for that purpose.
Engine.prototype.init = function()
{
    //I am used to initialize the engine
    var newEngine = new Engine();
    
    // This is test code. Remove me when this is properly implemented //
    
    //initialize the starting arrays with nothing of size 10x10
    newEngine.player1ShipGrid = createEmptyGridArray(10);
    newEngine.player1ShotGrid = createEmptyGridArray(10);
    newEngine.player2ShipGrid = createEmptyGridArray(10);
    newEngine.player2ShotGrid = createEmptyGridArray(10);
    
    //load the mode 1 ships
    newEngine.loadShips(mode1Ships());
    var ships = newEngine.getAvailableShips();
    
    //place ships for player 1
    newEngine.placeShip(0, 0, false, ships[0]);
    newEngine.placeShip(0, 1, true, ships[1]);
    newEngine.placeShip(5, 4, true, ships[2]);
    newEngine.placeShip(2, 7, false, ships[3]);
    newEngine.placeShip(8, 7, true, ships[4]);
    
    //change to the second player
    newEngine.changePlayers();
    //place ships for player 2
    newEngine.placeShip(1, 0, false, ships[0]);
    newEngine.placeShip(0, 2, true, ships[1]);
    newEngine.placeShip(6, 4, true, ships[2]);
    newEngine.placeShip(2, 8, false, ships[3]);
    newEngine.placeShip(9, 8, true, ships[4]);
    
    //change back to player 1
    newEngine.changePlayers();
    
    //Here I will check the local storage for previous game data and load it if found
    //TODO: Check local storage and initialize the engine appropriately
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
Engine.prototype.selectGameMode = function(numberOfPlayers, isModified)
{
    //TODO:
};

//This defines all the ships available in mode 1 of the game
function mode1Ships()
{
    //define a regular shot
    var regularShot = new Shot("Regular Shot", 1);
    //because of the way cloning objects works in javascript, each shot object can only have the fire function, all logic for firing should be in this function.
    regularShot.fire = function(x, y, targetShipGrid, shotGrid)
    {
        //implement a regular shot and how it interacts with the grid
        if (shotGrid[x][y] === 1 || shotGrid[x][y] === 2)
        {
            alert("Cell already targeted");
        }
        else if (targetShipGrid[x][y].name === 0)
        {
            shotGrid[x][y] = 1;
            return ShotMessages[1];
        }
        else if (targetShipGrid[x][y].name !== 0)
        {
            targetShipGrid[x][y].damage++;
            shotGrid[x][y] = 2;
            return ShotMessages[2];
        }
    };
    
    //define the ships in mode 1. This array of ships will be copied onto the grid of each players
    return new Array(
        new Ship("Carrier", 5, new Array(
            regularShot
            )
        ),
        new Ship("Battleship", 4, new Array(
            regularShot
            )
        ),
        new Ship("Cruiser", 3, new Array(
            regularShot
            )
        ),
        new Ship("Submarine", 3, new Array(
            regularShot
            )
        ),
        new Ship("Destroyer", 2, new Array(
            regularShot
            )
        )
    );
}

/////////////////////////
// Section for AI Code //
/////////////////////////

//TODO: Yeah, you know...

///////////////////////////
// Now Start The Engines //
///////////////////////////

//create the engine that will be used and initialize it.
//init is called to initialize the engine if it already setup or create new data for the engine
var engine = new Engine().init();