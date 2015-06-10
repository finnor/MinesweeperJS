function Solver(game) {
	this.game = game;
	this.lastXScouted = 0;
	this.lastYScouted = 0;
	this.patterns = new Patterns();
	
	this.getMove = function () {
		moveFound = false;
		var move;
		for(var i=1; i<=game.x; i++) {
			for(var j=1; j<=game.y; j++) {
				if (game.isEdge(i, j)) {
					/*flagCount = game.getNeighboringFlagCount(i, j);
					if (flagCount==game.board[i][j] && game.edges[i][j]> flagCount) {
						move = new Move(i, j, "X-Neighbors: Can click all neighbors"); //Relies on flags being correct
						return move;
					}
					if (game.board[i][j]==game.edges[i][j] && game.edges[i][j]>flagCount) {
						move = new Move(i, j, "X-Neighbors: Can flag all neighbors");
						return move;
					}*/
					move = this.patternMatching(i, j);
					if (move!=null)
						return move;
				}
			}
		}
		return (new Move(0, 0, "No moves known"));
	}
	
	
	this.getArea = function(x, y) {
		var area = [];
		for (var i=x-1, r=0; i<=x+1; i++, r++) {
			area[r] = [];
			for (var j=y-1, s=0; j<=y+1; j++, s++) {
				if (i==0 || i==game.board.length-1 || j==0 || j==game.board[i].length-1) 
					area[r][s] = "E";
				else if (game.visible[i][j]==false)
					area[r][s] = "?";
				else
					area[r][s] = game.board[i][j];
			}
		}
		
		return area;
	}
	
	this.patternMatching = function(x, y) {
		var inputPattern = this.getArea(x, y);
		var key = game.board[x][y];
		for (var i=0; i<this.patterns.patterns[key].length; i++) {
			testPattern = this.patterns.patterns[key][i][0];
			for (var j=0; j<4; j++) {
				if (this.patterns.match(inputPattern, testPattern)) {
					console.debug("Match at:" + x + "|" + y);
					return true;
				} else {
					testPattern = this.patterns.rotate(testPattern);
				}
			}
		}
	}
	
}

function Move(x, y, message) {
	this.x = x;
	this.y = y;
	this.message = message;
}


/*
 * 
 * 
 * ? - not visible
 * - - Not a mine, but visible or out of bounds
 */
function Patterns() {
	this.patterns = [];
	this.patterns[1] = [];
	this.patterns[2] = [
	    [ 
	    	[["?", "?", "?"],
	    	 ["1", "2", "1"],
	    	 ["-", "-", "-"]],
	    	[["X", "+", "X"],
	    	 [" ", " ", " "],
	    	 [" ", " ", " "]],
	  	],
    ];
	this.patterns[3] = [];
	this.patterns[4] = [];
	this.patterns[5] = [];
	
	this.rotate = function(pattern) {	
		var newPattern = [];
		for(var i=0; i<pattern.length; i++) {
			newPattern[i] = [];
			for (var j=0; j<pattern[i].length; j++) {
				newPattern[i][j] = pattern[pattern.length-j-1][i]; 
			}
		}	
		return newPattern;
	}
	
	this.match = function (inputPattern, testPattern) {
		for (var i=0; i<inputPattern.length; i++) {
			for (var j=0; j<inputPattern[i].length; j++) {
				if (!(this.compare(inputPattern[i][j], testPattern[i][j])))
					return false;
			}
		}
		return true;
	}
	
	this.compare = function (input, patternSymbol) {
		switch (input) {
			case "?":
				result = this.testUnknown(patternSymbol);
				break;
			case "E":
				result = this.testOutOfBounds(patternSymbol);
				break;
			default:
				if (input==patternSymbol)
					result = true;
				else
					result = this.testNumber(patternSymbol);
					
		}
		
		return result;
	}
	
	this.testUnknown = function(patternSymbol) {
		switch (patternSymbol) {
			case "?":
				return true;
			default:
				return false;
		}
	}
	
	this.testOutOfBounds = function(patternSymbol) {
		switch (patternSymbol) {
			case "E":
				return true;
			case "-":
				return true;
			default:
				return false;
		}
	}
	
	this.testNumber = function(patternSymbol) {
		
		switch (patternSymbol) {
			case "-":
				return true;
			default:
				return false;
		}
	}
}