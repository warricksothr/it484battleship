function UI(engine)
{
    ////////////////////
    // Initialization //
    ////////////////////
    
    //Always load after engine.js to ensure the latest engine is linked
    this.engine = engine;
    
    ////////////////////
    // Global Helpers //
    ////////////////////
    
    // element to empty a dom element identified by id
    this.helperEmptyElementById = function(elementId){
        var element = this.helperGetElementById(elementId);
        this.helperEmptyElement(element);
    };
    
    // element to empty a dom element
    this.helperEmptyElement = function(element){
        while(element.hasChildNodes())
        {
            element.removeChild(element.firstChild);
        }
    };
    
    //write the html to the requested element
    this.helperAppendHTMLToElementById = function(elementId, htmlToWrite)
    {
        var parentElement = this.helperGetElementById(elementId);
        //insert our html into the parent element
        this.helperAppendHTMLToElement(parentElement, htmlToWrite);
    };
    
    //write HTML to the body of an element
    this.helperAppendHTMLToElement = function(element, htmlToWrite)
    {
        element.innerHTML = element.innerHTML + htmlToWrite;
    };
    
    //append an element as a child to a parent element
    this.helperAppendChildElement = function(parentElement, childElement)
    {
        parentElement.appendChild(childElement);
    };
    
    //helper method to construct an dom element
    this.helperCreateElement = function(elementName, elementAttributes, elementTextContent)
    {
        var newElement = document.createElement(elementName);
        //loop through all the properties of elementAttributes and add them as attributes
        for(var propt in elementAttributes){
            //add an attribute based on the name with a value from the property
            newElement.setAttribute(propt, elementAttributes[propt]);
        }
        newElement.textContent = elementTextContent;
        return newElement;
    };
    
    //simply retreve a dom element from the current document identified by id
    this.helperGetElementById = function(elementId)
    {
        return document.getElementById(elementId);
    };
    
    //set attributes on an existing element
    this.helperAddAttributesToElement = function(element, elementAttributes)
    {
        for(var propt in elementAttributes){
                //add an attribute based on the name with a value from the property
                element.setAttribute(propt, elementAttributes[propt]);
            }
    };
    
    ////////////////////
    // Update Methods //
    ////////////////////
    
    //updates the user interface
    this.updateInterface = function(params)
    {
        //autopopulate the params with defaults if we weren't passed some
        if (typeof(params) === 'undefined')
        {
            params = {
            historyID:"history",
            shotID:"shot",
            ship:"ship",
            shipViewID:"shipview",
            availableShotID:"availableshots"
            };
        }
        //create the history
        this.createHistory(params.historyID);
        //create the shot grid
        this.createShotGrid(params.shotID);
        //create the ship grid
        this.createShipGrid(params.shipID);
        //hide the ship grid by default
        this.hideShipGrid();
        //create the ship view
        this.createShipView(params.shipViewID);
        //create a listing of the shots
        this.createAvailableShots(params.availableShotID)
    };
    
    ////////////////////////////////////
    // Show/Hide Ship Grids Functions //
    ////////////////////////////////////
    
    //show the ship grid
    this.showShipGrid = function(shotGridElementId, shipGridElementId)
    {   
        //set defaults in case the values are not provided
        if(typeof(shotGridElementId) === 'undefined') { shotGridElementId = "shot"; }
        if(typeof(shipGridElementId) === 'undefined') { shipGridElementId = "ship"; }
        this.helperGetElementById(shotGridElementId).style.display = "none";
        this.helperGetElementById(shipGridElementId).style.display = "block";
    };
    
    //hide the ship grid
    this.hideShipGrid = function(shotGridElementId, shipGridElementId)
    {
        //set defaults in case the values are not provided
        if(typeof(shotGridElementId) === 'undefined') { shotGridElementId = "shot"; }
        if(typeof(shipGridElementId) === 'undefined') { shipGridElementId = "ship"; }
        this.helperGetElementById(shotGridElementId).style.display = "block";
        this.helperGetElementById(shipGridElementId).style.display = "none";
    };
    
    ////////////////////////////
    // Grid drawing functions //
    ////////////////////////////
    
    // for shot grids //
    
    //helper method to create the correct grid type from the cell
    this.helperGetShotGridCell = function(type, j)
    {
        var classType = "";
        var typeToDisplay = "U";
        var typeTitle = "";
        //switch on the type in the cell 
        switch(type)
        {
            //fog of war
            case 0: 
                classType = "cloud";
                typeToDisplay = "F";
                typeTitle = "Fog Of War";
                break;
            //miss
            case 1: 
                classType = "miss";
                typeToDisplay = "M";
                typeTitle = "Miss";
                break;
            //hit
            case 2: 
                classType = "hit";
                typeToDisplay = "H";
                typeTitle = "Hit";
                break;
            //reveal miss
            case 3: 
                classType = "revealmiss";
                typeToDisplay = "RM";
                typeTitle = "Revealed Miss";
                break;
            //reveal hit
            case 4: 
                classType = "revealhit";
                typeToDisplay = "RH";
                typeTitle = "Revealed Hit";
                break;
        }
        var gridCell = this.helperCreateElement("td", {"class":classType, "id":"c" + j, title:typeTitle}, typeToDisplay);
        //by now gridCell should represent like this if it is a type 0 and j is 0 (<td class='cloud' id='c0'>0</td>)
        return gridCell;
    };
    
    //helper method to draw the supplied grid
    this.helperCreateShotGrid = function(grid, gridElementId)
    {
        //calculate the grid size to make sure it stays a grid
        var gridSize = grid.length;
        var cellPercent = Math.floor(100 / gridSize);
        //empty the grid
        this.helperEmptyElementById(gridElementId);
        //get the container
        var rootElement = this.helperGetElementById(gridElementId);
        //create the table
        var table = this.helperCreateElement("table", {}, "");
        for (var i = 0; i < 10; i++) {
            //write the row to the table body
            var row = this.helperCreateElement("tr", {id:"r"+i},"");
            for (var j = 0; j < 10; j++) {
                //write a column to the table
                //get the appropriate cell contents and write the column
                var gridCell = this.helperGetShotGridCell(grid[j][i], j);
                //assign the cell width dynamically based on the grid size
                gridCell.style.width = cellPercent + "%";
                //assign an on click event to the cell
                this.helperAddAttributesToElement(gridCell, {"onclick":"UI.helperFireShot("+j+","+i+")"});
                //append the cell to the row
                this.helperAppendChildElement(row, gridCell);
            }
            //add the row to the table
            this.helperAppendChildElement(table, row);
        }
        //finally write the table to the root element
        this.helperAppendChildElement(rootElement, table);
    };
    
    //draw the current players shot grid
    this.createShotGrid = function(gridElementId)
    {
        if(typeof(gridElementId) === 'undefined') { gridElementId = "shot"; }
        var grid = this.engine.getShotGrid();
        this.helperCreateShotGrid(grid, gridElementId);
    };
    
    // for ship grids //
    
    //helper method to create the correct grid type from the cell
    this.helperGetShipGridCell = function(type, enemyType, j)
    {
        var classType = "";
        var typeToDisplay = "U";
        var typeTitle = "";
        //switch on the type in the cell
        switch(enemyType)
        {
            //fog of war
            case 0: 
                classType = "cloud";
                typeToDisplay = "F";
                typeTitle = "Fog Of War";
                break;
            //miss
            case 1: 
                classType = "miss";
                typeToDisplay = "M";
                typeTitle = "Miss";
                break;
            //hit on one of our ships
            case 2: 
                classType = "shiphit";
                typeToDisplay = type.abbreviation;
                typeTitle = type.name;
                break;
            //reveal miss
            case 3: 
                classType = "revealmiss";
                typeToDisplay = "RM";
                typeTitle = "Revealed Miss";
                break;
            //reveal hit
            case 4: 
                classType = "revealhit";
                typeToDisplay = "RH-" + type.abbreviation;
                typeTitle = "Revealed Hit";
                break;
        }
        //miss on one of our ships
        if (enemyType === 0 && type !== 0)
        {
            classType = "shipmiss";
            typeToDisplay = type.abbreviation;
            typeTitle = type.name;
        }
        var gridCell = this.helperCreateElement("td", {"class":classType, "id":"c" + j, title:typeTitle}, typeToDisplay);
        //by now gridCell should represent like this if it is a type 0 and j is 0 (<td class='cloud' id='c0'>0</td>)
        return gridCell;
    };
    
    //helper method to draw the supplied grid
    this.helperCreateShipGrid = function(grid, enemyShotGrid, gridElementId)
    {
        //calculate the grid size to make sure it stays a grid
        var gridSize = grid.length;
        var cellPercent = Math.floor(100 / gridSize);
        //empty the grid
        this.helperEmptyElementById(gridElementId);
        //get the container
        var rootElement = this.helperGetElementById(gridElementId);
        //create the table
        var table = this.helperCreateElement("table", {}, "");
        for (var i = 0; i < 10; i++) {
            //write the row to the table body
            var row = this.helperCreateElement("tr", {id:"r"+i},"");
            for (var j = 0; j < 10; j++) {
                //write a column to the table
                //get the appropriate cell contents and write the column
                var gridCell = this.helperGetShipGridCell(grid[j][i], enemyShotGrid[j][i], j);
                gridCell.style.width = cellPercent + "%";
                this.helperAppendChildElement(row, gridCell);
            }
            //add the row to the table
            this.helperAppendChildElement(table, row);
        }
        //finally write the table to the root element
        this.helperAppendChildElement(rootElement, table);
    };
    
    //draw the current player's ship grid
    this.createShipGrid = function(gridElementId)
    {
        //default the value to ship if not provided
        if(typeof(gridElementId) === 'undefined') { gridElementId = "ship"; }
        var grid = this.engine.getShipGrid();
        var enemyShotGrid = this.engine.getEnemyShotGrid();
        this.helperCreateShipGrid(grid, enemyShotGrid,  gridElementId);
    };
    
    ///////////////////////
    // History Functions //
    ///////////////////////
    
    //show the history for the current player
    this.createHistory = function(gridElementId, historyLimit)
    {
        //limit of history messages to show a default of 15 unless overridden
        if (typeof(historyLimit) === 'undefined') { historyLimit = 15; }
        //default the tag to "history"
        if (typeof(gridElementId) === 'undefined') { gridElementId = "history"; }
        //get the element defined
        var rootElement = this.helperGetElementById(gridElementId);
        //empty the current history
        this.helperEmptyElement(rootElement);
        //create the heading
        var heading = this.helperCreateElement("h2", {"class":"headings"}, "History");
        this.helperAppendChildElement(rootElement, heading);
        
        //populate the history
        var history = this.engine.getShotHistory();
        //print out "no history" if there is no history yet
        if (!history || history.length < 1)
        {
            var noHist = this.helperCreateElement("span", {}, "No History");
            this.helperAppendChildElement(rootElement, noHist);
        }
        //otherwise print the history
        else
        {
            //need to implement a limit (aka. recent history otherwise we will over flow, we could also make it a scrollable box)
            for (var i = history.length-1; i >= 0; i--)
            {
                //leave loop if we've printed historyLimit messages
                if (i < (history.length-historyLimit))
                {
                    break;
                }
                //write out the history
                var hist = this.helperCreateElement("span", {id:"historyRow"}, history[i]);
                this.helperAppendChildElement(rootElement, hist);
                //append a line break
                this.helperAppendHTMLToElement(rootElement, "<br>");
            }
        }
    };
    
    /////////////////////////
    // Ship View Functions //
    /////////////////////////
    
    //a helper method to determine if a cell should be red or not
    this.helperShipViewGetClass = function(ship, currentCount)
    {
        if (currentCount < ship.damage)
        {
            return "segmenthit";
        }
        else
        {
            return "segment";
        }
    };
    
    this.createShipView = function(shipViewElementId)
    {
        if(typeof(shipViewElementId) === 'undefined') { shipViewElementId = "shipview"; }
        //get a list of the current player ships
        var ships = engine.getPlayerShips();
        //get access to the root element in the DOM
        var rootElement = this.helperGetElementById(shipViewElementId);
        //empty the element
        this.helperEmptyElement(rootElement);
        //loop through the ships and create the elements
        for (var i = 0; i < ships.length; i++)
        {
            //get the ship
            var ship = ships[i];
            //create an element for this ship
            var shipElement = this.helperCreateElement("div", {id:ship.name, "class":"ship", title:ship.name}, "");
            //loop through each cell in the length of the ship
            for (var x = 0; x < ship.shipLength; x++)
            {
                //determine if the section should be hit or not
                var cellClass = this.helperShipViewGetClass(ship, x);
                //create the cell for the ship
                var shipCellElement = this.helperCreateElement("div", {id:"s"+(i+1)+"p"+(x+1), "class":cellClass}, "");
                //append it to the ship
                this.helperAppendChildElement(shipElement, shipCellElement);
            }
            //append the ship to the root
            this.helperAppendChildElement(rootElement, shipElement);
        }
    };
    
    ///////////////////////////////
    // Available Shots Functions //
    ///////////////////////////////
    
    this.helperSelectShot = function(index)
    {
        engine.selectShot(engine.getAvailableShots()[index]);
        alert("selected shot: " + engine.getAvailableShots()[index].name);
    };
    
    this.helperGetShotElement = function(shot,index)
    {
        var shotWrapper;
        //if the shot isn't available it is on cooldown
        if (!shot.isAvailable())
        {
            shotWrapper = this.helperCreateElement("div", {}, "");
            //text on the outside
            var shotWrapperCountdown = this.helperCreateElement("span", {"class":"shotcooldowntimer"}, shot.cooldownTimer);
            var shotInnerWrapper = this.helperCreateElement("div", {"class":"shotcooldownwrapper"}, "");
            //now create the shot and add it as a child
            var shotElement = this.helperCreateElement("span", {"class":"shot"}, shot.name);
            this.helperAppendChildElement(shotInnerWrapper,shotElement);
            this.helperAppendChildElement(shotWrapper,shotInnerWrapper);
            this.helperAppendChildElement(shotWrapper,shotWrapperCountdown);
        }
        //non cooldown shots
        else
        {
            shotWrapper = this.helperCreateElement("div", {"class":"shotwrapper"}, "");
            var shotElement = this.helperCreateElement("span", {"class":"shot"}, shot.name);
            //add the onclick method to the wrapper to select a specific shot
            this.helperAddAttributesToElement(shotWrapper, {"onclick":"UI.helperSelectShot("+index+")"});
            this.helperAppendChildElement(shotWrapper, shotElement);
        }
        return shotWrapper;
    };
    
    //method to create the shot listing
    this.createAvailableShots = function(availableShotsElementId)
    {
        if(typeof(availableShotsElementId) === 'undefined') { availableShotsElementId = "availableshots"; }
        var rootElement = this.helperGetElementById(availableShotsElementId);
        //empty the element
        this.helperEmptyElement(rootElement);
        //get array of shots for the player
        var shots = engine.getAvailableShots();
        //loop through all the shots
        for (var i = 0; i < shots.length; i++)
        {
            var shot = this.helperGetShotElement(shots[i], i);
            this.helperAppendChildElement(rootElement, shot);
        }
    };
    
    ////////////////////////////////
    // Shot Grid Firing Functions //
    ////////////////////////////////
    
    //all the logic behind firing a shot then handing the turn over to the next player
    this.helperFireShot = function(x,y)
    {
        //fire the shot
        var result = engine.fireShot(x,y);
        //if the result of the shot is undefined, then the shot failed because the user didn't select a shot. let them try again
        if (typeof(result) === 'undefined') { return; }
        //show the alerts
        var hist = engine.getShotHistory();
        alert("ending turn for " + hist[hist.length-1]);
        alert("I'm really changing turn now. Don't Cheat.");
        //change turn
        engine.changePlayers();
        //update ui
        this.updateInterface();
    };
    
}

//create a new UI instance and import ENGINE into it
var UI = new UI(ENGINE);