function UI(engine)
{
    ////////////////////
    // Initialization //
    ////////////////////
    
    //Always load after engine.js to ensure the latest engine is linked
    this.engine = engine;
    
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
    this.helperCreateGrid = function(grid)
    {
        for (var i = 0; i < 10; i++) {
            //write the row 
            document.writeln("<tr id='r"+i+"'>");
            for (var j = 0; j < 10; j++) {
                //get the appropriate cell contents and write the column
                document.writeln(this.helperGetGridCellContents(grid[j][i], j));
            }
            //end the row
            document.writeln("</tr>");
        }
    };
    
    //draw the current player's ship grid
    this.createShipGrid = function()
    {
        var grid = this.engine.getShipGrid();
        this.helperCreateGrid(grid);
    };
    
    //draw the current players shot grid
    this.createShotGrid = function()
    {
        var grid = this.engine.getShotGrid();
        this.helperCreateGrid(grid);
    };
    
    ///////////////////////
    // History Functions //
    ///////////////////////
    
    //show the history for the current player
    this.createHistory = function()
    {
        var history = this.engine.getShotHistory();
        for (var i = 0; i < history.length; i++)
        {
            //write out the history
            document.writeln(history[i] + "<br>");
        }
        //print out no history if there is no history yet
        if (!history || history.length < 1)
        {
            document.writeln("No History<br>");
        }
    };
}

//create a new UI instance and import ENGINE into it
var UI = new UI(ENGINE);