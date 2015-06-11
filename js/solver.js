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
					flagCount = game.getNeighboringFlagCount(i, j);
					
					if (flagCount==game.board[i][j] && game.edges[i][j]> flagCount) {
						move = new Move(i, j, "X-Neighbors: Can click all neighbors"); //Relies on flags being correct
						move.allClick(game.flag, game.visible);
						return move;
					}
					if (game.board[i][j]==game.edges[i][j] && game.edges[i][j]>flagCount) {
						move = new Move(i, j, "X-Neighbors: Can flag all neighbors");
						move.allMine(game.flag, game.visible);
						return move;
					}
					move = this.patternMatching(i, j);
					if (move!=null)
						return move;
				}
			}
		}
		return (new Move(0, 0, "No moves known"));
	}
	
	
	this.getArea = function(x, y, length) {
		var area = [];
		var radius = Math.floor(length/2); 
		for (var i=x-radius, r=0; i<=x+radius; i++, r++) {
			area[r] = [];
			for (var j=y-radius, s=0; j<=y+radius; j++, s++) {
				if (i<=0 || i>=game.board.length-1 || j<=0 || j>=game.board[i].length-1) 
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
		var inputPattern = [];
		var inputPattern3 = this.getArea(x, y, 3);
		var inputPattern5 = this.getArea(x, y, 5);
		var key = game.board[x][y];
		for (var i=0; i<this.patterns.patterns[key].length; i++) {
			testPattern = this.patterns.patterns[key][i][0];
			moveIfCorrect = this.patterns.patterns[key][i][1];
			size = this.patterns.patterns[key][i][2];
			
			if (size==3)
				inputPattern = inputPattern3;
			else if (size==5)
				inputPattern = inputPattern5;
			for (var j=0; j<4; j++) {
				if (this.patterns.match(inputPattern, testPattern)) {
					move = new Move(x, y, "");
					move.determineAction(moveIfCorrect);
					if (this.testIfAlreadyPerformed(move)) {
						testPattern = this.patterns.rotate(testPattern);
						moveIfCorrect = this.patterns.rotate(moveIfCorrect);
					} else {
						return move;
					}
				} else {
					testPattern = this.patterns.rotate(testPattern);
					moveIfCorrect = this.patterns.rotate(moveIfCorrect);
				}
			}
		}
	}
	
	
	this.testIfAlreadyPerformed = function(move) {
		for(var i=0; i<move.canClick.length; i++) {
			if(!(this.game.visible[move.canClick[i][0]][move.canClick[i][1]]))
				return false;
		}
		
		for(var i=0; i<move.canMine.length; i++) {
			if(!(this.game.flag[move.canMine[i][0]][move.canMine[i][1]]))
				return false;
		}
		
		return true;
	}
	
}

function Move(x, y, message) {
	this.x = x;
	this.y = y;
	this.message = message;
	this.canClick = [];
	this.canMine = [];
	
	this.determineAction = function(pattern) {
		for (var i=0; i<pattern.length; i++) {
			for (var j=0; j<pattern[i].length; j++) {
				switch (pattern[i][j]) {
					case "X":
						this.canMine.push([x+i-1, y+j-1]);
						break;
					case "+":
						this.canClick.push([x+i-1, y+j-1]);
						break;
				}
			}
		}
	}
	
	this.allMine = function(flag, visible) {
		for (var i=this.x-1; i<=this.x+1; i++) {
			for (var j=this.y-1; j<=this.y+1; j++) {
				if (i>0 && i<game.board.length && j>0 && j<game.board[i].length) { 
					if (!flag[i][j] && !visible[i][j])
						this.canMine.push([i, j]);
				}
			}
		}
	}
	
	this.allClick = function(flag, visible) {
		for (var i=this.x-1; i<=this.x+1; i++) {
			for (var j=this.y-1; j<=this.y+1; j++) {
				if (i>0 && i<game.board.length && j>0 && j<game.board[i].length) { 
					if (!flag[i][j] && !visible[i][j]) {
						this.canClick.push([i, j]);
					}
				}
			}
		}
	}
		
}


/*
 * 
 * 
 * ? - not visible
 * - - Not a mine, but visible or out of bounds
 *   - Anything
 */
function Patterns() {
	this.patterns = [];
	this.patterns[1] = [
        [
	    	[[" ", " ", " ", " ", " "],
	    	 ["-", "?", "?", "?", " "],
	    	 ["-", "1", "1", " ", " "],
	    	 ["-", "-", "-", " ", " "],
	    	 ["-", "-", "-", "-", " "]],
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", "+", " "],
	    	 [" ", " ", " ", "+", " "],
	    	 [" ", " ", " ", "+", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
        ]
    ];
	this.patterns[2] = [
	    [ 
	    	[["?", "?", "?"],
	    	 ["1", "2", "1"],
	    	 ["-", "-", "-"]],
	    	[["X", "+", "X"],
	    	 [" ", " ", " "],
	    	 [" ", " ", " "]],
	    	3,
	  	],
    ];
	this.patterns[3] = [
        [
	    	[["?", "?", "?"],
	    	 ["1", "3", "?"],
	    	 ["-", "-", "-"]],
	    	[[" ", " ", "X"],
	    	 [" ", " ", "X"],
	    	 [" ", " ", " "]],
	    	3,
        ]
    ];
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
			case " ":
				result = true;
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
			case "E":
				return true;
			default:
				return false;
		}
	}
}