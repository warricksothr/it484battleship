// IT484 Battleship implementation

//Clone functionality for custom objects
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

///////////////////////////////
// Custom Object Defenitions //
///////////////////////////////

//the class that defines a ship on the grid.
function Ship(name, shipLength, shots)
{
    this.name = name;// name: the name of the ship type.
    this.shots = shots;// shots: an array of shot types available for this ship.
    this.shipLength = shipLength;// shipLength: the pre-defined length of the ship. This is used when populating the grid.
    
    //set the location of this ship. the startx and starty define where the ship starts, then based on length and the boolean horizontal it is possible to populate the grid with the ship.
    var setLocation = function(startx, starty, horizontal)
    {
        //The grid location of the ship (important for placing the ship on the grid)
        this.startx = startx;
        this.starty = starty;
        this.horizontal = horizontal;
    }
}

//the class that defines a shot and how it will interact with the grids.
function Shot(name, cooldownLength)
{
    //define what a shot does
    var shoot = function(grid) {};
}

//the class the represents the data to be returned when a turn is complete.
function TurnData()
{
    
}

///////////////////////
// BattleShip Engine //
///////////////////////

//the engine that will interface with the GUI and manage the logic of the game
function Engine()
{
    //The available ships (this is an array of available ship objects)
    //availableShips
    
    //The grids to be used
    //TODO: Add the grids
    
    //TODO: include a history of shots for each player
    
    //Watch value to represent who's turn it is
    //TODO: implement a watch value
    
    //fire a shot at the opponent's ship grid
    this.fireShot = function(x, y, shot) {};
    
    //place a ship on the current player;s grid
    this.placeShip = function(startx,starty,endx,endy,ship) {};
    
    //return the shot history of the current player
    this.getShotHistory = function() {};
    
    //return the shot types that are available
    this.getAvailableShots = function() {};
    
    //return the shot types that are on cooldown
    this.getShotsOnCooldown = function() {};
    
    //return the shot grids
    this.getShotGrids = function() {};
    
    //return the ship grid for the active player
    this.getShipGrid = function() {};
    
    //clear the local storage and prepare the engine for a new game
    this.forfit = function() {};
    
    //return a list of available ships
    this.getAvailableShips = function()
    {
        return this.availableShips;
    };
}

//define init as a prototype of Engine so it isn't recreated each time an Engine object is created.
//This is good because the initialization code is entirely static.
//The ideal way to initialize an engine is by calling new Engine().init() so as to initialize the engine with previous data. This acts a pseudo constructor for that purpose.
Engine.prototype.init = function()
{
    //I am used to initialize the engine
    var newEngine = new Engine();
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
Engine.prototype.selectGameMode = function(numberOfPlayers, modified)
{
    //TODO
};

//This defines all the ships available in mode 1 of the game
function mode1Ships()
{
    //define a regular shot
    var regularShot = new Shot("Regular Shot", 1);
    regularShot.shoot = function(grid)
    {
        //TODO:implement a regular shot and how it interacts with the grid
    }
    
    //define the ships in mode 1. This array of ships will be coppied onto the grid of each players
    var ships = new Array(
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
    return ships;
}

//create the engine that will be used and initialize it.
var engine = new Engine().init();

//////////////////
// testing code //
//////////////////

//load the mode 1 ships
engine.loadShips(mode1Ships());

//get the available ships
var availableShips = engine.getAvailableShips();

//iterate over the available ships and print their names to the console
console.log("Going through the available ships. ");
for (var i = 0; i < availableShips.length; i++)
{
    console.log(i + " > " + availableShips[i].name);
}