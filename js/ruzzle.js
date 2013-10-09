function Dict(words) {
    this.words = words;
}

Dict.prototype.exists = function(word) {
    return word in words;
}

function Ruzzle(chars, maxRows, maxCols, dict, progressListener) {
    this.dict = dict;
    this.grid = init2DArray(maxRows, maxCols, 0);
    this.maxRows = maxRows;
    this.maxCols = maxCols;
    this.progressListener = progressListener;
    this.numCalls = 0;

    var letters = chars.split('');

    var i=0;
    for (var row = 0; row < maxRows; row++) {
        for(var col =0; col < maxCols; col++) {
            this.grid[row][col] = letters[i++];
        }
    }
}

Ruzzle.prototype.findWords = function() {
    var found = new Array();
    var visited = init2DArray(this.maxRows, this.maxCols, false);
    for(row=0; row < this.maxRows; row++) {
        for(col=0; col < this.maxCols; col++) {
            var nextPos = new Position(row, col);

            var path = new Array();
            this.explore(visited, nextPos, this.grid[row][col], path, found);
        }
    }
    return found;
}

Ruzzle.prototype.explore = function(visitedSoFar, pos, word, path, found) {
    this.numCalls++;
    if(this.numCalls % 5000 == 0) {
        this.progressListener(this.numCalls, found);
    }
    //Optimization, haven't seen words this big
    if(path.length > 10) {
        return;
    }
    var visited = clone2DArr(visitedSoFar);
    visited[pos.row][pos.col] = true;
    path.push(pos);

    var neighbours = this.getNeighbours(pos)
    /*for(var i=0; i<neighbours.length; i++) {
        var p = neighbours[i];
        if (!visited[p.row][p.col]) {
            var word = word + this.grid[p.row][p.col]
            if(this.dict.exists(word.toUpperCase()) && !(word in found)){
                newPath = path.slice();
                newPath.push(p);
                found[word] = newPath;
            }
        }
    }*/
    if(this.dict.exists(word.toUpperCase()) && !(word in found)){
        newPath = path.slice();
        found[word] = newPath;
    }

    for(var i=0; i<neighbours.length; i++) {
        var p = neighbours[i];
        if(!visited[p.row][p.col]) {
            var newWord = word + this.grid[p.row][p.col];
            newPath = path.slice();
            var nextPos = new Position(p.row, p.col);
            this.explore(visited, nextPos, newWord, newPath, found)
        }
    }
}

Ruzzle.prototype.getNeighbours = function(pos) {
    neighbours = []
    for(r = pos.row - 1; r <= pos.row + 1; r++) {
        for( c = pos.col - 1; c <= pos.col + 1; c++){
            if ((r >= 0 && r < this.maxRows) && (c >= 0 && c < this.maxCols) && !(r == row && c == col)) {
                neighbours.push(new Position(r, c))
            }
        }
    }
    return neighbours
}

function Position(row, col) {
    this.row = row;
    this.col = col;
}

function init2DArray(rows, cols, initVal) {
    var grid = new Array(rows);
    for (var row = 0; row < rows; row++) {
        grid[row] = new Array(cols);
        for(var col =0; col < cols; col++) {
            grid[row][col] = initVal;
        }
    }
    return grid;
}


function clone2DArr(arr) {
    var newArray = [];
    for (var i = 0; i < arr.length; i++) {
        newArray[i] = arr[i].slice();
    }
    return newArray;
}

function sortByKeyLength(arr){
    var keys = [];
    var sortedObj = {};

    for(var key in arr){
        if(arr.hasOwnProperty(key)){
            keys.push(key);
        }
    }
    // sort keys
    keys.sort(function(a, b){
        return b.length - a.length; 
    });

    // create new array based on Sorted Keys
    jQuery.each(keys, function(i, key){
        sortedObj[key] = arr[key];
    });

    return sortedObj;
}

Ruzzle.prototype.displayGrid = function(tableDiv) {
    var tableHtml = "<table class='table table-bordered'>";
    for(var row=0; row < this.maxRows; row++) {
        tableHtml += "<tr>";
        for(var col=0; col < this.maxCols; col++) {
           tableHtml += "<td id='" + this.getCellId(row, col) + "'><h2>" + this.grid[row][col].toUpperCase() + "</h2></td>"; 
        }
        tableHtml += "</tr>";
    }
    tableHtml += "</table>";
    tableDiv.html(tableHtml);
}

Ruzzle.prototype.getCellId = function(row, col) {
    return "cell_" + row + "_" + col;
}

Ruzzle.prototype.display = function(foundWords, wordDiv) {
    sortedWords = sortByKeyLength(foundWords);
     
    var displayWord = function(word, path, ruzzle) {
        console.log("displayWord");
        function renderWord() { 
            console.log("Will display: " + word);
            wordDiv.html("<h1>" + word + "</h1>").fadeIn(100);
            for(var row=0; row < ruzzle.maxRows; row++) {
                for(var col=0; col < ruzzle.maxCols; col++) {
                    var cellId = "#" + ruzzle.getCellId(row, col);
                    $(cellId).removeClass();
                }
            }
            console.log(path);
            for (var i=0; i < path.length; i++) {
                var pos = path[i];
                var cellId = "#" + ruzzle.getCellId(pos.row, pos.col);
                $(cellId).addClass('letter' + i);
            }
        }
        return renderWord;
    }
    var interval = 1000;
    for(var word in sortedWords){
        if(sortedWords.hasOwnProperty(word)){
            var path = sortedWords[word];
            setTimeout(displayWord(word.toUpperCase(), path, this), interval);
            interval += interval;
        }
    }
}

function ruzzleIt(inputGrid){
    console.log("Starting");
    var totalCalls = 118516; // Total number of calls for 4x4 grid
    var dict = new Dict(words);
    var ruzzle = new Ruzzle(inputGrid, 4, 4, dict, function(calls, wordsFound) {
        var percentage = Math.round(calls/totalCalls * 100);
        $(".progress-bar").width(percentage + "%");
        $(".status").html("<h6>Words Found:" + Object.keys(wordsFound).length +"</h5>");
    });
    ruzzle.displayGrid($('#table'));
    foundWords = ruzzle.findWords();
    console.log("Calls: " + ruzzle.numCalls);
    ruzzle.display(foundWords, $("#word"));
}
