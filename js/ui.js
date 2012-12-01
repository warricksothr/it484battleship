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
            shipViewID:"shipview"
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
    };
    
    ////////////////////////////////////
    // Show/Hide Ship Grids Functions //
    ////////////////////////////////////
    
    this.showShipGrid = function()
    {
        document.getElementById('shot').style.display = "none";
        document.getElementById('ship').style.display = "block";
    };
    
    this.hideShipGrid = function()
    {
        document.getElementById('shot').style.display = "block";
        document.getElementById('ship').style.display = "none";
    };
    
    ////////////////////////////
    // Grid drawing functions //
    ////////////////////////////
    
    // for shot grids //
    
    //helper method to create the correct grid type from the cell
    this.helperGetShotGridCell = function(type, j)
    {
        var classType = "";
        //switch on the type in the cell 
        switch(type)
        {
            //fog of war
            case 0: 
                classType = "cloud";
                break;
            //miss
            case 1: 
                classType = "miss";
                break;
            //hit
            case 2: 
                classType = "hit";
                break;
            //reveal miss
            case 3: 
                classType = "revealmiss";
                break;
            //reveal hit
            case 4: 
                classType = "revealhit";
                break;
        }
        var gridCell = this.helperCreateElement("td", {"class":classType, "id":"c" + j}, type);
        //by now gridCell should represent like this if it is a type 0 and j is 0 (<td class='cloud' id='c0'>0</td>)
        return gridCell;
    };
    
    //helper method to draw the supplied grid
    this.helperCreateShotGrid = function(grid, gridElementId)
    {
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
        if(!gridElementId) { gridElementId = "shot"; }
        var grid = this.engine.getShotGrid();
        this.helperCreateShotGrid(grid, gridElementId);
    };
    
    // for ship grids //
    
    //helper method to create the correct grid type from the cell
    this.helperGetShipGridCell = function(type, enemyType, j)
    {
        var classType = "";
        var typeToDisplay = enemyType;
        //switch on the type in the cell
        switch(enemyType)
        {
            //fog of war
            case 0: 
                classType = "cloud";
                break;
            //miss
            case 1: 
                classType = "miss";
                break;
            //hit on one of our ships
            case 2: 
                classType = "shiphit";
                typeToDisplay = type.name[0];
                break;
            //reveal miss
            case 3: 
                classType = "revealmiss";
                break;
            //reveal hit
            case 4: 
                classType = "revealhit";
                break;
        }
        //miss on one of our ships
        if (enemyType == 0 && type != 0)
        {
            classType = "shipmiss";
            typeToDisplay = type.name[0];
        }
        var gridCell = this.helperCreateElement("td", {"class":classType, "id":"c" + j}, typeToDisplay);
        //by now gridCell should represent like this if it is a type 0 and j is 0 (<td class='cloud' id='c0'>0</td>)
        return gridCell;
    };
    
    //helper method to draw the supplied grid
    this.helperCreateShipGrid = function(grid, enemyShotGrid, gridElementId)
    {
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
        if(!gridElementId) { gridElementId = "ship"; }
        var grid = this.engine.getShipGrid();
        var enemyShotGrid = this.engine.getEnemyShotGrid();
        this.helperCreateShipGrid(grid, enemyShotGrid,  gridElementId);
    };
    
    ///////////////////////
    // History Functions //
    ///////////////////////
    
    //show the history for the current player
    this.createHistory = function(gridElementId)
    {
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
            for (var i = 0; i < history.length; i++)
            {
                //write out the history
                var hist = this.helperCreateElement("span", {id:"historyRow"}, history[i]);
                this.helperAppendChildElement(rootElement, hist);
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
            var shipElement = this.helperCreateElement("div", {id:ship.name, "class":"ship"}, "");
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
}

//create a new UI instance and import ENGINE into it
var UI = new UI(ENGINE);