function UI() {
    this.showShipMap = function() {
        if(false) {
            document.getElementById('one').style.display = "none";
            document.getElementById('shipone').style.display = "block";
            return true;
        }
        else {
            document.getElementById('two').style.display = "none";
            document.getElementById('shiptwo').style.display = "block";
            return true;
        }
        
    };
    
    this.hideShipMap = function() {
        if(false) {
            document.getElementById('one').style.display = "none";
            document.getElementById('shipone').style.display = "block";
            return true;
        }
        else {
            document.getElementById('two').style.display = "none";
            document.getElementById('shiptwo').style.display = "block";
            return true;
        }
        
    };
    
    this.createShipGrid = function() {
        var ship = engine.getShipGrids();
        for (var i = 0; i < 10; i++) {
                document.writeln("<tr id='r"+i+"'>");
                for (var j = 0; j < 10; j++) {
                document.writeln("<td class='cloud' id='c" + j + "'>"+ship[j][i]+"</td>");
            }
            document.writeln("</tr>");
        }
    };
    
    this.createShotGrid = function() {
        var shot = engine.getShotGrids();
        for (var i = 0; i < 10; i++) {
            document.writeln("<tr id='r"+i+"'>");
            for (var j = 0; j < 10; j++) {
                document.writeln("<td class='cloud' id='c" + j + "'>"+shot[j][i]+"</td>");
            }
            document.writeln("</tr>");
        }
    };
}