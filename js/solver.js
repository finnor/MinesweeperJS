function Solver(game) {
	this.game = game;
	this.lastXScouted = 0;
	this.lastYScouted = 0;
	this.patterns = new Patterns();
	this.createEdgesBoard = function (x, y) {
		var edges = [];
		for (var i=0; i<=x+1; i++) {
			edges[i] = [];
			for (var j=0; j<=y+1; j++) {
				edges[i][j] = 0;
			}
		}
		
		//Iterate across entire game board
		for (var i=1; i<=x; i++) {
			for (var j=1; j<=y; j++) {
				var visibleCount = 0;
				//At each cell, count visible neighbors
				//Edge cases - corners
				if (i==1 && j==1) 
					visibleCount = !game.visible[i+1][j] + !game.visible[i][j+1] + !game.visible[i+1][j+1];
				else if (i==x && j==1)
					visibleCount = !game.visible[i-1][j] + !game.visible[i][j+1] + !game.visible[i-1][j+1];
				else if (i==1 && j==y)
					visibleCount = !game.visible[i+1][j] + !game.visible[i][j-1] + !game.visible[i+1][j-1];
				else if (i==x && j==y)
					visibleCount = !game.visible[i-1][j] + !game.visible[i][j-1] + !game.visible[i-1][j-1];
				//Edges but not corners
				else if (i==1)
					visibleCount =  !game.visible[i][j-1] + !game.visible[i+1][j-1] +
						!game.visible[i+1][j] + !game.visible[i][j+1] + !game.visible[i+1][j+1];
				else if (i==x)
					visibleCount =  !game.visible[i][j-1] + !game.visible[i-1][j-1] +
						!game.visible[i-1][j] + !game.visible[i][j+1] + !game.visible[i-1][j+1];
				else if (j==1)
					visibleCount =  !game.visible[i][j+1] + !game.visible[i+1][j+1] +
						!game.visible[i+1][j] + !game.visible[i-1][j+1] + !game.visible[i-1][j];
				else if (j==y)
					visibleCount =  !game.visible[i][j-1] + !game.visible[i+1][j-1] +
						!game.visible[i+1][j] + !game.visible[i-1][j-1] + !game.visible[i-1][j];
				//Else add all neighbors
				else 
					visibleCount = !game.visible[x-1][y-1] + !game.visible[x][y-1] + !game.visible[x+1][y-1] +
    					!game.visible[x-1][y] + !game.visible[x+1][y] +
    					!game.visible[x-1][y+1] + !game.visible[x][y+1] + !game.visible[x+1][y+1];
			    
			    edges[i][j] = visibleCount;
			}
		}
		return (edges);
	}
	this.edges = this.createEdgesBoard(game.x, game.y);
	
	this.isEdge = function (x, y) {
		if (game.visible[x][y]==true && this.edges[x][y]>0)
			return true;
		else
			return false;
	}
	
	this.getMove = function () {
		moveFound = false;
		var move;
		for(var i=1; i<=game.x; i++) {
			for(var j=1; j<=game.y; j++) {
				if (this.isEdge(i, j)) {
					/*flagCount = game.getNeighboringFlagCount(i, j);
					if (flagCount==game.board[i][j] && this.edges[i][j]> flagCount) {
						move = new Move(i, j, "X-Neighbors: Can click all neighbors");
						return move;
					}
					if (game.board[i][j]==this.edges[i][j] && this.edges[i][j]>flagCount) {
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
	
	this.updateEdges = function(x, y, context) {
		for(var i=x-1; i<=x+1; i++) {
			for(var j=y-1; j<=y+1; j++) {
				if (!(i==x && j==y)) {
					if (game.board[i][j]<10)
						context.edges[i][j]--;
				}
			}
		}
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
				newPattern[i][j] = pattern[j][pattern.length-i-1]; 
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