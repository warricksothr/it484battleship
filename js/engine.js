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

//For storing objects in the local storage
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

//For retriving objects from local storage. Returns a null if there is no object at the key
Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
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
    };
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

    //return the shot types that are available for the current player
    this.getAvailableShots = function()
    {
        var availableShots = [];
        var i = 0;
        //get the first player's available shots
        if (this.isFirstPlayer)
        {
            for (var j = 0; j < this.player1Ships.length; j++)
            {
                var ship = this.player1Ships[j];
                for (var k = 0; k < ship.shots.length; k++)
                {
                    var shot = ship.shots[k];
                    if (shot.isAvailable());
                    {
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
                for (var k = 0; k < ship.shots.length; k++)
                {
                    var shot = ship.shots[k];
                    if (shot.cooldownTimer === 0)
                    {
                        availableShots[i++] = shot;
                    }
                }
            }
        }
        return availableShots;
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

    //return the shot types that are on cooldown
    this.getShotsOnCooldown = function()
    {

    };

    /**
     * Returns the shot grids of the current player
     */
    this.getShotGrid = function()
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
        //clear the data from session storage
        this.clearLocalStorage();
    };
    
    //returns true if the current player has no ships left
    this.isGameOver = function()
    {
        //check if the current player has no ships
        //check first players ship
        if (this.isFirstPlayer)
        {
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
            return true;
        }
        //check second players ship
        else
        {
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
            return true;
        }
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
            //decrement all shot timers for current players ships
            decShipShotTimers(this.player1Ships);
            this.turnCounter++;
            this.isFirstPlayer = false;
        }
        //change to first player and increment the turn counter
        else
        {
            decShipShotTimers(this.player2Ships);
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
            newEngine.placeShip(newShip.startx, newShip.starty, newShip.isVertical, newShip);
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
            newEngine.placeShip(newShip.startx, newShip.starty, newShip.isVertical, newShip);
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
    //TODO: initialize AI if only one player
    //TODO: set the correct booleans for modes 1 and 2 also load the correct ships
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

    //initialize the AI as player 2
    if (numberOfPlayers == 1)
    {
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
            return ShotMessages[shotGrid[x][y]];
        }
        else if (targetShipGrid[x][y] === 0)
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

//This defines all the ships available in mode 1 of the game
function mode2Ships()
{
    //Array of shot messages based on shot impact on the grid
    // ShotMessages[0] = "FogOfWar";
    // ShotMessages[1] = "Miss";
    // ShotMessages[2] = "Hit";
    // ShotMessages[3] = "RevealMiss";
    // ShotMessages[4] = "RevealHit";
    
    //define a regular shot
    var regularShot = new Shot("Regular Shot", 1);
    //because of the way cloning objects works in javascript, each shot object can only have the fire function, all logic for firing should be in this function.
    regularShot.fire = function(x, y, targetShipGrid, shotGrid)
    {
        //if the cell is already miss or hit
        if (shotGrid[x][y] === 1 || shotGrid[x][y] === 2)
        {
            //return the message for the value for the existing cell
            return ShotMessages[shotGrid[x][y]];
        }
        //if the cell hasn't been shot 
        else if (targetShipGrid[x][y] === 0)
        {
            //
            shotGrid[x][y] = 1;
            return ShotMessages[1];
        }
        else if (targetShipGrid[x][y].name !== 0)
        {
            //
            targetShipGrid[x][y].damage++;
            shotGrid[x][y] = 2;
            return ShotMessages[2];
        }
    };
    
    //define special shots
    //Carrier Special Shot
    var goliathShot = new Shot("Photon Bomb Run", 8);
    goliathShot.fire = function(x, y, targetShipGrid, shotGrid)
    {
        //Shot hits 3 consecutive places. Player chooses a starting grid point
        //and a direction? How will this be handled from input via UI?
    };
    
    //Battleship Special Shot
    var ravagerShot = new Shot("Black Hole", 12);
    ravagerShot.fire = function(x, y, targetShipGrid, shotGrid)
    {
        //Shot hits in a central location and then hits one grid point
        //in each direction up, right, down, left from chosen location
        //if the cell is already miss or hit
        if (shotGrid[x][y] === 1 || shotGrid[x][y] === 2)
        {
            //return the message for the value for the existing cell
            return ShotMessages[shotGrid[x][y]];
        }
        //if the cell hasn't been shot 
        else if (targetShipGrid[x][y] === 0)
        {
            //
            shotGrid[x][y] = 1;
            return ShotMessages[1];
        }
        else if (targetShipGrid[x][y].name !== 0)
        {
            //
            targetShipGrid[x][y].damage++;
            shotGrid[x][y] = 2;
            return ShotMessages[2];
        }
    };
    
    //Cruiser Special Shot
    var harvesterShot = new Shot("Scrap Radar", 6);
    harvesterShot.fire = function(x, y, targetShipGrid, shotGrid)
    {
        //Shot is fired at location and if it would be a hit, it reveals grid
        //points to the up, right, down, left locations if they would be a hit
        //or not as well. Hits similar to Black Hole but hits as reveal hit or
        //reveal miss instead of true hit or miss.
    };
    
    //Submarine Special Shot
    var destroyerShot = new Shot("Plasma Salvo", 4);
    destroyerShot.fire = function(x, y, targetShipGrid, shotGrid)
    {
        //Player independently chooses 3 locations for "regular" shots    
    };
    
    //Interceptor Special Shot
    var interceptorShot = new Shot("Homing Missile", 6);
    interceptorShot.fire = function(x, y, targetShipGrid, shotGrid)
    {
        //Player chooses a cell location. Spaces that have already been hit are
        //invalid locations for homing missile to hit. Homing missile hits the
        //"closest" grid space that would be a hit from chosen cell location
    };

    //define the ships in mode 2. This array of ships will be copied onto the grid of each players
    return new Array(
        //carrier
        new Ship("Stardust Goliath", 5, new Array(
                regularShot
                , goliathShot
            )
        ),
        //battleship
        new Ship("Galaxy Ravager", 4, new Array(
                regularShot
                , ravagerShot
            )
        ),
        //cruiser
        new Ship("Scrap Harvester", 3, new Array(
                regularShot
                , harvesterShot
            )
        ),
        //submarine
        new Ship("Star Destroyer", 3, new Array(
                regularShot
                , destroyerShot
            )
        ),
        //destroyer
        new Ship("Interceptor", 2, new Array(
                regularShot
                , interceptorShot
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