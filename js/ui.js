/**
 * 
 * @author Drew Short <warrick@sothr.com>
 */
function Ui(engine)
{
    ////////////////////
    // Initialization //
    ////////////////////
    
    //Always load after engine.js first to ensure the latest engine is linked
    this.engine = engine;
    
    //flag for debugging
    this.debug = false;
    
    ////////////////////
    // GLOBAL HELPERS //
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
    
    //////////////////////////////////////////////////////////////////////////////////
    // Methods for reading the version file and displaying it in a specific element //
    //////////////////////////////////////////////////////////////////////////////////
    
    //ajax request to load the version info from the version file
    this.displayVersion = function(versionElementId)
    {
        var ui = this;
        var req = new XMLHttpRequest();
        req.open('GET', './version');
        req.onreadystatechange = function()
        {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    if(typeof(versionElementId) === 'undefined') { versionElementId = 'version'; }
                    var rootElement = ui.helperGetElementById(versionElementId);
                    ui.helperEmptyElement(rootElement);
                    var versionElement = ui.helperCreateElement("span", {}, "Version: "+req.responseText);
                    ui.helperAddAttributesToElement(rootElement,{onclick:"window.open('./versionHistory.txt','_blank')"});
                    rootElement.style.cursor = "pointer";
                    ui.helperAppendChildElement(rootElement, versionElement);
                }
            }
        };
        req.send(null);
    };
    
    //////////////////////////////////////////////
    // Methods for changing the stylesheet used //
    //////////////////////////////////////////////
    
    // change the current style sheet to the one in session storage
    this.changeStyleSheet = function(styleSheetElementId, styleSheet)
    {
        
    };
    
    ///////////////////////////////////////////
    // METHODS BELOW THIS ARE FOR INDEX.HTML //
    ///////////////////////////////////////////
    
    
    
    //////////////////////////////////////////
    // METHODS BELOW THIS ARE FOR GAME.HTML //
    //////////////////////////////////////////
    
    //only expose these methods if an engine has been loaded
    if (typeof(this.engine) !== 'undefined')
    {
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
                availableShotID:"availableshots",
                headerID:"header"
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
            this.createAvailableShots(params.availableShotID);
            //create a header for the page
            this.createHeader(params.headerID);
        };
        
        ////////////////////////////////////
        // Show/Hide Grids Functions //
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
        
        //hide both grids
        this.hideGrids = function(shotGridElementId, shipGridElementId)
        {
            if(typeof(shotGridElementId) === 'undefined') { shotGridElementId = "shot"; }
            if(typeof(shipGridElementId) === 'undefined') { shipGridElementId = "ship"; }
            this.helperGetElementById(shotGridElementId).style.display = "none";
            this.helperGetElementById(shipGridElementId).style.display = "none";
        };
        
        //return to the default state of showing the shot grid and hiding the ship grid
        this.resetGrids = function(shotGridElementId, shipGridElementId)
        {
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
            //limit of history messages to show a default of 99 unless overridden
            if (typeof(historyLimit) === 'undefined') { historyLimit = 99; }
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
                //need to implement a limit (aka. recent history otherwise we will over flow, we could also make it a scrollable box)(aka. recent history otherwise we will over flow, we could also make it a scrollable box)
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
        
        //
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
            //refresh shots
            this.createAvailableShots();
            if(this.debug){
                alert("selected shot: " + engine.getAvailableShots()[index].name);
            }
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
                //determine if shot is the selected one
                var wrapperClass = "shotwrapper";
                if (engine.isFirstPlayer)
                {
                    if (shot.name === engine.player1SelectedShot.name)
                    {
                        wrapperClass = "shotwrapperselected";
                    }
                }
                else
                {
                    if (shot.name === engine.player2SelectedShot.name)
                    {
                        wrapperClass = "shotwrapperselected";
                    }
                }
                shotWrapper = this.helperCreateElement("div", {"class":wrapperClass}, "");
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
        
        //////////////////////
        // Header Functions //
        //////////////////////
        
        //create a header element span with a custom message
        this.helperGetHeaderWithCustomTextElement = function(message)
        {
            var element = this.helperCreateElement("span", {}, message);
            return element;
        };
        
        //create a header element to notify players
        this.helperGetHeaderElement = function(isFirstPlayer)
        {
            var element;
            if (isFirstPlayer)
            {
                element = this.helperGetHeaderWithCustomTextElement("Take your shot, Player 1.");
            }
            else
            {
                element = this.helperGetHeaderWithCustomTextElement("Take your shot, Player 2.");
            }
            return element;
        };
        
        //create the header element
        this.createHeader = function(headerElementId)
        {
            if(typeof(headerElementId) === 'undefined') { headerElementId = "header"; }
            var rootElement = this.helperGetElementById(headerElementId);
            //empty the element
            this.helperEmptyElement(rootElement);
            var headerElement = this.helperGetHeaderElement(engine.isFirstPlayer);
            this.helperAppendChildElement(rootElement, headerElement);
        };
        
        //create the header element with custom text
        this.createHeaderWithCustomText = function(message, headerElementId)
        {
            if(typeof(headerElementId) === 'undefined') { headerElementId = "header"; }
            var rootElement = this.helperGetElementById(headerElementId);
            //empty the element
            this.helperEmptyElement(rootElement);
            var headerElement = this.helperGetHeaderWithCustomTextElement(message);
            this.helperAppendChildElement(rootElement, headerElement);
        };
        
        //////////////////////////////
        // Ship Placement Functions //
        //////////////////////////////
        
        //hide the grids for ship placement
        this.helperPlaceShipsHideGrids= function(shotGridElementId, shipGridElementId, shipViewElementId, shipGridsElementId)
        {
            this.showShipGrid(shotGridElementId, shipGridElementId);
            if (typeof(shipViewElementId) === 'undefined') { shipViewElementId = 'shipview' }
            this.helperGetElementById(shipViewElementId).style.display = "block";
            if (typeof(shipGridsElementId) === 'undefined') { shipGridsElementId = 'shipgrids' }
            this.helperGetElementById(shipGridsElementId).style.display = "none";
            
        };
        
        //show the grids after ship placement
        this.helperPlaceShipsRestoreGrids = function(shotGridElementId, shipGridElementId, shipViewElementId, shipGridsElementId)
        {
            this.resetGrids(shotGridElementId, shipGridElementId);
            if (typeof(shipViewElementId) === 'undefined') { shipViewElementId = 'shipview' }
            this.helperGetElementById(shipViewElementId).style.display = "block";
            if (typeof(shipGridsElementId) === 'undefined') { shipGridsElementId = 'shipgrids' }
            this.helperGetElementById(shipGridsElementId).style.display = "block";
        };
        
        this.helperPlaceShipCreateShipViewRadioChecked = function(shipIndex, isVertical)
        {
            this.helperPlaceShipsCreateShipGrid(shipIndex, !isVertical);
            this.helperPlaceShipsCreateShipView(shipIndex, !isVertical);
        };
        
        //create the shipView for placement (upper right corner with place vertically box)
        this.helperPlaceShipsCreateShipView = function(shipIndex, isVertical, shipViewElementId)
        {
            if (typeof(shipViewElementId) === 'undefined') { shipViewElementId = "shipview"; }
            //get access to the root element in the DOM
            var rootElement = this.helperGetElementById(shipViewElementId);
            //empty the element
            this.helperEmptyElement(rootElement);
            //get the ship
            var ship = this.engine.getAvailableShips()[shipIndex];
            //create an element for this ship
            var shipElement = this.helperCreateElement("div", {id:ship.name, "class":"ship", title:ship.name}, "");
            //loop through each cell in the length of the ship
            for (var x = 0; x < ship.shipLength; x++)
            {
                //create the cell for the ship
                var shipCellElement = this.helperCreateElement("div", {id:"p"+(x+1), "class":"segment"}, "");
                //append it to the ship
                this.helperAppendChildElement(shipElement, shipCellElement);
            }
            var shipPlacementOptionsElement = this.helperCreateElement("div", {id:"shipplacement"}, "");
            var shipNameElement = this.helperCreateElement("span", {id:"shipplacementname"}, ship.name);
            this.helperAppendChildElement(shipPlacementOptionsElement, shipNameElement);
            this.helperAppendHTMLToElement(shipPlacementOptionsElement, "<br>");
            var shipIsVerticalLabelElement = this.helperCreateElement("label", {"for":"vertCheckBox"}, "Place Vertically");
            this.helperAppendChildElement(shipPlacementOptionsElement, shipIsVerticalLabelElement);
            var shipIsVerticalElement = this.helperCreateElement("input", {type:"checkbox", id:"vertCheckBox", onclick:"UI.helperPlaceShipCreateShipViewRadioChecked("+shipIndex+","+isVertical+")"}, "");
            //add the checked attribute only if section is vertical
            if (isVertical) { this.helperAddAttributesToElement(shipIsVerticalElement,{checked:isVertical}); }
            this.helperAppendChildElement(shipPlacementOptionsElement, shipIsVerticalElement);
            //append the ship to the root
            this.helperAppendChildElement(rootElement, shipElement);
            this.helperAppendChildElement(rootElement, shipPlacementOptionsElement);
        };
        
        //helper method to create the correct grid type from the cell
        this.helperGetPlaceShipGridCellClass = function(type)
        {
            var obj = {};
            obj.classType = "";
            obj.name = "";
            //switch on the type in the cell
            switch(type)
            {
                //fog of war
                case 0: 
                    obj.classType = "cloud";
                    break;
                //must be a ship
                default: 
                    obj.classType = "shipmiss";
                    obj.name = type.abbreviation;
                    break;
            }
            return obj;
        };
        
        //get a cell for the grid
        this.helperGetPlaceShipsGridCell = function(shipIndex, shipCellContents, x, y, isVertical, isValidPlacement)
        {
            if (typeof(isValidPlacement) === 'undefined') { isValidPlacement = false; }
            var gridElement;
            var cellData = this.helperGetPlaceShipGridCellClass(shipCellContents);
            //check if this cell is a valid placement cell
            if (isValidPlacement)
            {
                //onmouseover to show what the ship placement looks like
                //onclick to actually place the ship there
                gridElement = this.helperCreateElement("td"
                    , {"class":cellData.classType
                        , onclick:"UI.placeNextPlayerShip("+shipIndex+","+isVertical+","+x+","+y+")"
                        , onmouseover:"UI.helperPlaceShipsUpdateGrid("+shipIndex+","+isVertical+","+x+","+y+",true)"
                        , onmouseout:"UI.helperPlaceShipsUpdateGrid("+shipIndex+","+isVertical+","+x+","+y+")"
                    }, cellData.name);
            }
            //otherwise it is not a valid placement cells
            else
            {
                //create an empty cell with no functions to indicate that it is not a valid placement cell
                gridElement = this.helperCreateElement("td", {"class":cellData.classType}, cellData.name);
            }
            return gridElement;
        };
        
        //find the cells that a ship would occupy if placed starting at x,y
        this.helperPlaceShipsGetShipsCells = function(ship, isVertical, x, y)
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
        };
        
        //determine if a specified cell would be a ship cell
        this.helperPlaceShipsIsCellOnShip = function(x, y, cells)
        {
            for (var i = 0; i < cells.length; i++)
            {
                //return true if the cell is part of a ship
                if (x === cells[i].x && y === cells[i].y)
                {
                    return true;
                }
            }
            //otherwise return false
            return false;
        };
        
        //update the style on the grid to show the ship placement
        this.helperPlaceShipsUpdateGrid = function(shipIndex, isVertical, x, y, show, shipGridElementId)
        {
            if (typeof(shipGridElementId) === 'undefined') { shipGridElementId = "ship"; }
            if (typeof(show) === 'undefined') { show = false; }
            //get the ship being referenced
            var ship = this.engine.getAvailableShips()[shipIndex];
            //root element container
            var rootElement = this.helperGetElementById(shipGridElementId);
            //grab the required cells
            var shipCells = this.helperPlaceShipsGetShipsCells(ship, isVertical, x, y);
            //loop through ship cells to update
            for (var i = 0; i < shipCells.length; i++)
            {
                var cell = shipCells[i];
                //get the element representing the cell
                var table = rootElement.childNodes[0];
                var row = table.childNodes[cell.y];
                var gridCell = row.childNodes[cell.x];
                //now update the style on the cell
                //show a ship in the cell
                if (show)
                {
                    gridCell.className = "shipmiss";
                    gridCell.textContent = ship.abbreviation;
                }
                //hide the cell
                else
                {
                    //check to see if we filled that cell
                    //only update if that cell hasn't been filled
                    if (gridCell.textContent !== "")
                    {
                        gridCell.className = "cloud";
                        gridCell.textContent = "";
                    }
                }
            }
        };
        
        //create the ship grid for placement
        this.helperPlaceShipsCreateShipGrid = function(shipIndex, isVertical, shipGridElementId)
        {
            if (typeof(shipGridElementId) === 'undefined') { shipGridElementId = "ship"; }
            //default is not an update
            //get the ship grid
            var grid = this.engine.getShipGrid();
            //calculate the percent width of each cell
            var cellWidth = Math.floor(100 / grid.length);
            //get the ship being referenced
            var ship = this.engine.getAvailableShips()[shipIndex];
            //root element container
            var rootElement = this.helperGetElementById(shipGridElementId);
            //empty the grid
            this.helperEmptyElement(rootElement);
            //create the table
            var table = this.helperCreateElement("table", {}, "");
            //i = y
            for (var i = 0; i < 10; i++) {
                //write the row to the table body
                var row = this.helperCreateElement("tr", {id:"r"+i},"");
                //j = x
                for (var j = 0; j < 10; j++) {
                    //write a column to the table
                    //get the appropriate cell contents and write the column
                    var validPlacement = this.engine.validateShipPlacement(j, i, isVertical, ship);
                    var gridCell = this.helperGetPlaceShipsGridCell(shipIndex, grid[j][i], j, i, isVertical, validPlacement);
                    gridCell.style.width = cellWidth + "%";
                    gridCell.style.height = cellWidth + "%";
                    this.helperAppendChildElement(row, gridCell);
                }
                //add the row to the table
                this.helperAppendChildElement(table, row);
            }
            //finally write the table to the root element
            this.helperAppendChildElement(rootElement, table);
        };
        
        //create the ui to place the provided ship
        this.placeNextPlayerShip = function(shipIndex, isVertical, x, y)
        {
            if (typeof(x) !== 'undefined' && typeof(y) !== 'undefined')
            {
                //get the ship to place and increment the index
                var ship = this.engine.getAvailableShips()[shipIndex++];
                //place the ship
                this.engine.placeShip(x, y, isVertical, ship);
                //get the cell
                var cell = this.helperGetElementById("ship").childNodes[0].childNodes[y].childNodes[x];
                //remove the onmouseout event because it causes bugs in chrome
                cell.onmouseout = "";
                //check the index
                if (shipIndex >= this.engine.getAvailableShips().length)
                {
                    //change to the next player because there are no more ships to place
                    this.engine.changePlayers();
                    //check how many times we've placed ships, if the counter is still on 0 and if there are two players switch to the second player ship placement
                    if (this.shipPlacementCount < 1 && this.engine.numberOfPlayers === 2)
                    {
                        //increment ship placement counter
                        this.shipPlacementCount++;
                        alert("player 2, place your ships");
                        //start again for player 2
                        this.placeNextPlayerShip(0, false);
                        return;
                    }
                    //otherwise show the grids and return
                    else{
                        this.helperPlaceShipsRestoreGrids();
                        //now build the rest of the game UI
                        //call update interface method and pass it the ids of
                        this.updateInterface({historyID:"history", shipID:"ship", shotID:"shot", shipViewID:"shipview", availableShotID:"availableshots", headerID:"header"});
                        //leave the function because there is nothing left to do
                        return;
                    }
                }
            }
            //this is where the UI is updated between ship placements
            //set the header message for the player
            if (this.engine.isFirstPlayer) { this.createHeaderWithCustomText("Player 1, place your: " + this.engine.getAvailableShips()[shipIndex].name); }
            else { this.createHeaderWithCustomText("Player 2, place your: " + this.engine.getAvailableShips()[shipIndex].name); }
            // redraw the interfaces for the next ship
            this.helperPlaceShipsCreateShipView(shipIndex,false);
            this.helperPlaceShipsCreateShipGrid(shipIndex,false);
        };
        
        //this is the start for ship placement and only gets called once
        this.placePlayerShips = function()
        {
            //the number of times we've placed ships
            if (typeof(this.shipPlacementCount) === 'undefined') { this.shipPlacementCount = 0 }
            
            //hide the grids
            this.helperPlaceShipsHideGrids();
            
            //alert the player about ship placement
            alert("player 1, place your ships");
            
            //start the ship placement loop
            this.placeNextPlayerShip(0, false); //TODO: fixme
        };
        
        //////////////////////
        // Forfit Functions //
        //////////////////////
        
        this.forfit = function()
        {
            this.engine.forfit();
            window.location = "./index.html";
        };
        
        ////////////////////////////////
        // Shot Grid Firing Functions //
        ////////////////////////////////
        
        this.helperResetDefaultShots = function()
        {
            //set shots back to the default
            engine.player1SelectedShot = regularShot;
            engine.player2SelectedShot = regularShot;
        };
        
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
            //only show the second alert in 2 player mode
            if (engine.numberOfPlayers > 1){
                this.hideGrids();
                //hide the grids between turns
                alert("I'm really changing turn now. Don't Cheat.");
            }
            //change turn
            var gameOver = engine.changePlayers();
            //reset each player's selected shot to the default shot
            this.helperResetDefaultShots();
            //check if the game is over
            if (typeof(gameOver) !== 'undefined' && gameOver === true)
            {
                //redirect to the index because the game is over
                window.location = "./index.html";
                return;
            }
            //otherwise continue playing
            else
            {
                //reset the grids back to normal
                this.resetGrids();
                //update ui
                this.updateInterface();
            }
        };
    }
    
}

//create a new UI instance and import ENGINE into it
var UI;
//instantiate the correct instance of the UI object
if (typeof(ENGINE) !== 'undefined')
{
    UI = new Ui(ENGINE);
}
else
{
    UI = new Ui();
}