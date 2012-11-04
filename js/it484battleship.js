// IT484 Battleship implementation

//the pseudo class that defines a ship on the grid.
function Ship()
{
    
}

//the pseudo class that defines a shot and how it will interact with the grids.
function Shot()
{
    
}

//the pseudo class the represents the data to be returned when a turn is complete.
function TurnData()
{
    
}

//the engine that will interface with the GUI and manage the logic of the game
function Engine()
{
    //The grids to be used
    //TODO: Add the grids
    
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
    this.getAvailableShips = function() {};
}

//define init as a prototype of Engine so it isn't recreated each time an Engine object is created.
//This is good because the initialization code is entirely static.
//The ideal way to initialize an engine is by calling new Engine().init() so as to initialize the engine with previous data. This acts a pseudo constructor for that purpose.
Engine.prototype.init = function()
{
    //I am used to initialize the engine
    var newEngine = new engine();
    //Here I will check the local storage for previous game data and load it if found
    //TODO: Check local storage and initialize the engine appropriately
    //finally I will return the new engine
    return newEngine;
};

//prototype method used to load ships from a specified javascript file?
Engine.prototype.loadShips = function(pathToShipsFile)
{
    
};

//select the game mode and store in the local cache.
//This should only be called from the front page when selecting the version of the game to run.
Engine.prototype.selectGameMode = function(numberOfPlayers, modified)
{
    
};

//create the engine that will be used and initialize it.
var engine = new Engine().init();