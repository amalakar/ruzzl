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
    for(var row=0; row < this.maxRows; row++) {
        for(var col=0; col < this.maxCols; col++) {
            var nextPos = new Position(row, col);
            var path = new Array();
            this.explore(visited, nextPos, this.grid[row][col], path, found);
        }
    }
    return found;
}

Ruzzle.prototype.explore = function(visitedSoFar, pos, word, pathSoFar, found) {
    this.numCalls++;
    if(this.numCalls % 5000 == 0) {
        this.progressListener(this.numCalls, found);
    }
    //Optimization, haven't seen words this big
    if(pathSoFar.length > 7) {
        return;
    }
    var visited = clone2DArr(visitedSoFar);
    visited[pos.row][pos.col] = true;
    var path = pathSoFar.slice();
    path.push(pos);

    var neighbours = this.getNeighbours(pos)
    // Look for neighbours instead of recursive, little optimization
    for(var i=0; i<neighbours.length; i++) {
        var p = neighbours[i];
        if (!visited[p.row][p.col]) {
            var newWord = word + this.grid[p.row][p.col]
            if(this.dict.exists(newWord.toUpperCase()) && !(newWord in found)){
                newPath = path.slice();
                newPath.push(p);
                found[newWord] = newPath;
            }
        }
    }

    for(var i=0; i<neighbours.length; i++) {
        var p = neighbours[i];
        if(!visited[p.row][p.col]) {
            var newWord = word + this.grid[p.row][p.col];
            this.explore(visited, p, newWord, path, found)
        }
    }
}

Ruzzle.prototype.getNeighbours = function(pos) {
    var neighbours = []
    for(var r = pos.row - 1; r <= pos.row + 1; r++) {
        for(var c = pos.col - 1; c <= pos.col + 1; c++){
            if ((r >= 0 && r < this.maxRows) && (c >= 0 && c < this.maxCols) && !(r == pos.row && c == pos.col)) {
                neighbours.push(new Position(r, c))
            }
        }
    }
    return neighbours
}

Ruzzle.prototype.getDirection = function(from, to) {
    if(to.row < from.row) {
        if(to.col < from.col) {
            // North west
            return 135;
        } else if(to.col == from.col) {
            // North
            return 180;
        } else {
            // North east
            return 225;
        }
    } else if(to.row > from.row) {
        if(to.col < from.col) {
            // South West
            return 45;
        } else if(to.col == from.col) {
            // South
            return 0;
        } else {
            // South East
            return -45;
        }
    } else {
        if(to.col < from.col) {
            // West
            return 90;
        } else {
            // East
            return -90;
        }
    }
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
    var tableHtml = "<table class='table table-bordered' id='ruzzle-table'>";
    for(var row=0; row < this.maxRows; row++) {
        tableHtml += "<tr>";
        for(var col=0; col < this.maxCols; col++) {
           tableHtml += "<td id='" + this.getCellId(row, col) + "'><div class='letter'>" + this.grid[row][col].toUpperCase() + "</div></td>"; 
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
    var sortedWords = sortByKeyLength(foundWords);
     
    var displayWord = function(word, path, ruzzle) {
        return function() { 
            wordDiv.html(word).fadeIn(200);
            for(var row=0; row < ruzzle.maxRows; row++) {
                for(var col=0; col < ruzzle.maxCols; col++) {
                    var cellId = "#" + ruzzle.getCellId(row, col);
                    var cell = $(cellId);
                    cell.removeClass();
                    cell.css({"class": "cell"});
                }
            }
            // console.log(path);
            $(".step").remove();
            $(".line").remove();
            for (var i=0; i < path.length; i++) {
                var pos = path[i];
                var cellId = "#" + ruzzle.getCellId(pos.row, pos.col);
                var cell = $(cellId);
                cell.removeClass();
                cell.addClass('letter' + i);
                cell.addClass('cell');
                var cellOffset = cell.offset();
                $("<div class='step'>" + i + "</div>")
                    .appendTo(cell);
                // Not the last letter
                if(i+1 < path.length) {
                    var x = cellOffset.left + cell.width() / 2;
                    var y = cellOffset.top + cell.height() / 2;
                    
                    var targetCell = $("#" + ruzzle.getCellId(path[i+1].row, path[i+1].col));
                    var targetX = targetCell.offset().left + targetCell.width() / 2;
                    var targetY = targetCell.offset().top + targetCell.height() / 2;
                    var angle = ruzzle.getDirection(pos, path[i+1]); 
                    var length = Math.sqrt( Math.pow(targetX - x, 2) + Math.pow(targetY - y, 2));
                    $("<div class='line'></div>")
                        .css({"position": "fixed", "top": y, "left": x})
                        .css('-webkit-transform', 'rotate(' + angle + 'deg)')
                        .css('-moz-transform', 'rotate(' + angle + 'deg)')
                        .css('-o-transform', 'rotate(' + angle + 'deg)')
                        .css('-ms-transform', 'rotate(' + angle + 'deg)')
                        .css('transform', 'rotate(' + angle + 'deg)')
                        .css('height', length)
                        .appendTo(cell);
                }
            }
        };
    }
    var interval = 4500;
    var nextEventTime = 0;
    for(var word in sortedWords){
        if(sortedWords.hasOwnProperty(word)){
            var path = sortedWords[word];
            setTimeout(displayWord(word.toUpperCase(), path, this), nextEventTime);
            nextEventTime += interval;
        }
        //break;
    }
}

function ruzzleIt(inputGrid){
    var maxRows = 4;
    var maxCols = 4;
    console.log("Starting");
    var totalCalls = 118516; // Total number of calls for 4x4 grid
    var dict = new Dict(words);
    var ruzzle = new Ruzzle(inputGrid, maxRows, maxCols, dict, function(calls, wordsFound) {
        var percentage = Math.round(calls/totalCalls * 100);
        $(".progress-bar").width(percentage + "%");
        $(".status").html("<h6>Words Found:" + Object.keys(wordsFound).length +"</h5>");
    });
    ruzzle.displayGrid($('.table-container'));
    var foundWords = ruzzle.findWords();
    console.log("Calls: " + ruzzle.numCalls);
    ruzzle.display(foundWords, $(".word"));
}
