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
    this.helperEmptyElement = function(elementId){
        var element = document.getElementById(elementId);
        while(element.hasChildNodes())
        {
            element.removeChild(element.firstChild);
        }
    };
    
    this.helperAppendHTMLToElement = function(elementId, htmlToWrite)
    {
        var parentElement = document.getElementById(elementId);
        //insert our html into the parent element
        parentElement.innerHTML = parentElement.innerHTML + htmlToWrite;
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
    
    //helper method to get the correct grid type from the cell
    this.helperGetGridCellContents = function(type, j)
    {
        var returnMe = "<td class='";
        //switch on the type in the cell 
        switch(type)
        {
            //fog of war
            case 0: 
                returnMe += "cloud";
                break;
            //miss
            case 1: 
                returnMe += "miss";
                break;
            //hit
            case 2: 
                returnMe += "hit";
                break;
            //reveal miss
            case 3: 
                returnMe += "revealmiss";
                break;
            //reveal hit
            case 4: 
                returnMe += "revealhit";
                break;
        }
        //close the cell
        returnMe +=  "' id='c" + j + "'>"+type+"</td>";
        //by now returnMe should look like this if it is a type 0 and j is 0 (<td class='cloud' id='c0'>0</td>)
        return returnMe;
    };
    
    //helper method to draw the supplied grid
    this.helperCreateGrid = function(grid, gridElementId)
    {
        //empty the grid
        this.helperEmptyElement(gridElementId);
        //create the table
        var tableElementId = gridElementId+"-table";
        this.helperAppendHTMLToElement(gridElementId, "<table id='"+tableElementId+"'>");
        //create table body
        var tableBodyElementId = tableElementId+"-body";
        this.helperAppendHTMLToElement(tableElementId, "<tbody id='"+tableBodyElementId+"'>");
        for (var i = 0; i < 10; i++) {
            //write the row to the table body
            var rowElementId = tableBodyElementId + "-r"+i;
            this.helperAppendHTMLToElement(tableBodyElementId, "<tr id='"+rowElementId+"'>");
            for (var j = 0; j < 10; j++) {
                //write a column to the table
                //get the appropriate cell contents and write the column
                var contents = this.helperGetGridCellContents(grid[j][i], j);
                this.helperAppendHTMLToElement(rowElementId, contents);
            }
            //end the row
            this.helperAppendHTMLToElement(tableElementId, "</tr>");
        }
        this.helperAppendHTMLToElement(tableElementId, "</tbody>");
        this.helperAppendHTMLToElement(gridElementId, "</table>");
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
        this.helperEmptyElement(gridElementId);
        this.helperAppendHTMLToElement(gridElementId, "<h2 class=\"headings\">History</h2>");
        var history = this.engine.getShotHistory();
        for (var i = 0; i < history.length; i++)
        {
            //write out the history
            this.helperAppendHTMLToElement(gridElementId, history[i] + "<br>");
        }
        //print out no history if there is no history yet
        if (!history || history.length < 1)
        {
            this.helperAppendHTMLToElement(gridElementId, "No History<br>");
        }
    };
}

//create a new UI instance and import ENGINE into it
var UI = new UI(ENGINE);