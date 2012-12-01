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
    
    this.helperGetElementById = function(elementId)
    {
        return document.getElementById(elementId);
    };
    
    
    ////////////////////////////////////
    // Show/Hide Ship Grids Functions //
    ////////////////////////////////////
    
    this.showShipMap = function()
    {
        if(false) {
            document.getElementById('one').style.display = "none";
            document.getElementById('shipone').style.display = "block";
        }
        else {
            document.getElementById('two').style.display = "none";
            document.getElementById('shiptwo').style.display = "block";
        }
        
    };
    
    this.hideShipMap = function()
    {
        if(false) {
            document.getElementById('one').style.display = "none";
            document.getElementById('shipone').style.display = "block";
        }
        else {
            document.getElementById('two').style.display = "none";
            document.getElementById('shiptwo').style.display = "block";
        }
        
    };
    
    ////////////////////////////
    // Grid drawing functions //
    ////////////////////////////
    
    //helper method to create the correct grid type from the cell
    this.helperGetGridCell = function(type, j)
    {
        var classType = "";
        //switch on the type in the cell 
        switch(type)
        {
            //fog of war
            case 0: 
                classType += "cloud";
                break;
            //miss
            case 1: 
                classType += "miss";
                break;
            //hit
            case 2: 
                classType += "hit";
                break;
            //reveal miss
            case 3: 
                classType += "revealmiss";
                break;
            //reveal hit
            case 4: 
                classType += "revealhit";
                break;
        }
        var gridCell = this.helperCreateElement("td", {"class":classType, "id":"c" + j}, type);
        //by now gridCell should represent like this if it is a type 0 and j is 0 (<td class='cloud' id='c0'>0</td>)
        return gridCell;
    };
    
    //helper method to draw the supplied grid
    this.helperCreateGrid = function(grid, gridElementId)
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
                var gridCell = this.helperGetGridCell(grid[j][i], j);
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
        this.helperCreateGrid(grid, gridElementId);
    };
    
    //draw the current players shot grid
    this.createShotGrid = function(gridElementId)
    {
        if(!gridElementId) { gridElementId = "shot"; }
        var grid = this.engine.getShotGrid();
        this.helperCreateGrid(grid, gridElementId);
    };
    
    ///////////////////////
    // History Functions //
    ///////////////////////
    
    //show the history for the current player
    this.createHistory = function(gridElementId)
    {
        this.helperEmptyElementById(gridElementId);
        this.helperAppendHTMLToElementById(gridElementId, "<h2 class=\"headings\">History</h2>");
        var history = this.engine.getShotHistory();
        for (var i = 0; i < history.length; i++)
        {
            //write out the history
            this.helperAppendHTMLToElementById(gridElementId, history[i] + "<br>");
        }
        //print out no history if there is no history yet
        if (!history || history.length < 1)
        {
            this.helperAppendHTMLToElementById(gridElementId, "No History<br>");
        }
    };
}

//create a new UI instance and import ENGINE into it
var UI = new UI(ENGINE);