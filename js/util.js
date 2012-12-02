/**
 * 
 *  
 * @author Drew Short <warrick@sothr.com>
 */
 
//return an object of parameters parsed from the URL
function getParamsFromURL()
{
    //array of params from the URL
    var paramsFromURL = location.search.substr(location.search.indexOf("?")+1).split("&");
    var params = {};
    for (var i = 0; i < paramsFromURL.length; i++)
    {
        var splitParam = paramsFromURL[i].split("=");
        var paramName = splitParam[0];
        var paramValue = splitParam[1];
        if (paramName.length > 0 && paramValue.length > 0)
        {
            params[paramName] = paramValue;
        }
    }
    if (sizeOfObject(params) > 0)
    {
        return params;
    }
}

//determine the size of an object
function sizeOfObject(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

//get a random number between min and max
function getRandomInt(min, max) {
    if (min === max) { return min; }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * view the end of an array
 * arrayPeek(ary [,count]) 
 */
function arrayPeek(ary, count)
{
    var temp;
    //request for a single value
    if (typeof(count) === 'undefined' || count === 1)
    {
        temp = ary.pop();
        ary.push(temp);
    }
    else
    {
        if (count === 0) { return; }
        temp = [];
        //return many
        for (var i = 0; i < count; i++)
        {
            temp[i] = ary.pop();
        }
        //go back through and add them all back to the array
        for (var j = count-1; j >= 0; j--)
        {
            ary.push(temp[j]);
        }
    }
    return temp;
}