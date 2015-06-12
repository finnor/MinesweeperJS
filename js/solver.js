function Solver(game) {
	this.game = game;
	this.lastXScouted = 0;
	this.lastYScouted = 0;
	this.flagVerified = [];
	this.moves;
	for(var i=0; i<this.game.flag.length; i++) {
		this.flagVerified[i] = [];
		for(var j=0; j<this.game.flag[i].length; j++) {
			this.flagVerified[i][j] = false;
		}
	}
	this.patterns = new Patterns();
	
	this.getAllPlays = function () {
		this.moves = [];
		var tempMove;
		var newMove = false;
		do {
			newMove = false;
			for(var i=1; i<=game.x; i++) {
				for(var j=1; j<=game.y; j++) {
					var doAdd = true;
					tempMove = this.getMove(i, j);
					if (tempMove!=null) {
						//Test for uniqueness
						for(var k=0; k<this.moves.length; k++) {
							iteratedMove = this.moves[k];
							if(iteratedMove.x==tempMove.x && iteratedMove.y==tempMove.y && iteratedMove.type==tempMove.type) {
								doAdd = false;
							}
						}
						if (doAdd) {
							this.moves.push(tempMove);
							newMove = true;
						}
					}
				}
			}
		} while (newMove)
	};
	
	this.getMove = function (i, j) {
		var move = null;
		if (game.isEdge(i, j)) {
			var flagCountVerified = game.getNeighboringFlagCount(i, j, this.flagVerified);
			var flagCount =  game.getNeighboringFlagCount(i, j, game.flag);
			if (flagCountVerified==game.board[i][j] && game.edges[i][j]> flagCountVerified) {
				this.checkCorrectFlags(i, j);
				move = new Move(i, j, "X-Neighbors: Can click all neighbors", 0); //Relies on flags being correct
				move.allClick(this.flagVerified, game.visible);
			} else if (game.board[i][j]==game.edges[i][j] && game.edges[i][j]>flagCount) {
				move = new Move(i, j, "X-Neighbors: Can flag all neighbors", 1);
				move.allMine(game.flag, game.visible);
			} else {
				move = this.patternMatching(i, j);
			}
			if (move!=null) {
				this.addVerifiedFlags(move.canMine);
				return move;
			}
		}
		return null;
	};
	
	this.checkCorrectFlags = function(x, y) {
		for(var i=x-1; i<=x+1; i++) {
			for(var j=y-1; j<=y+1; j++) {
				if (game.flag[i][j] && !this.flagVerified[i][j])
					console.debug("Uncertain flag at: " + i + "|" + j);
			}
		}
	};
	
	this.addVerifiedFlags = function(canMine) {
		for(var i=0; i<canMine.length; i++) {
			this.flagVerified[canMine[i][0]][canMine[i][1]] = true;
		}
	};
	
	
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
				else if (this.flagVerified[i][j]==true)
					area[r][s] = "F";
				else
					area[r][s] = game.board[i][j];
			}
		}	
		return area;
	};
	
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
					move = new Move(x, y, this.patterns.patterns[key][i][3], this.patterns.patterns[key][i][3]);
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
	};
	
	
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
	};
	
}

function Move(x, y, message, type) {
	this.x = x;
	this.y = y;
	this.message = message;
	this.canClick = [];
	this.canMine = [];
	this.type = type;
	
	this.determineAction = function(pattern) {
		var radius = Math.floor(pattern.length/2);
		for (var i=0; i<pattern.length; i++) {
			for (var j=0; j<pattern[i].length; j++) {
				switch (pattern[i][j]) {
					case "X":
						this.canMine.push([x+i-radius, y+j-radius]);
						a = x+i-1;
						b = y+j-1;
						console.debug(a + "|" + b);
						break;
					case "+":
						this.canClick.push([x+i-radius, y+j-radius]);
						break;
				}
			}
		}
	};
	
	this.allMine = function(flag, visible) {
		for (var i=this.x-1; i<=this.x+1; i++) {
			for (var j=this.y-1; j<=this.y+1; j++) {
				if (i>0 && i<game.board.length-1 && j>0 && j<game.board[i].length-1) { 
					if (!flag[i][j] && !visible[i][j])
						this.canMine.push([i, j]);
				}
			}
		}
	};
	
	this.allClick = function(flag, visible) {
		for (var i=this.x-1; i<=this.x+1; i++) {
			for (var j=this.y-1; j<=this.y+1; j++) {
				if (i>0 && i<game.board.length-1 && j>0 && j<game.board[i].length-1) { 
					if (!flag[i][j] && !visible[i][j]) {
						this.canClick.push([i, j]);
					}
				}
			}
		}
	};
		
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
	    	10,
        ],
	    [ 
	    	[[" ", "?", "?", "?", " "],
	    	 [" ", "?", "1", "?", " "],
	    	 [" ", "-", "1", "-", " "],
	    	 [" ", "-", "-", "-", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	[[" ", "+", "+", "+", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	11,
	  	],
	    [ 
	    	[["?", "?", "?", " ", " "],
	    	 ["?", "1", "?", " ", " "],
	    	 [" ", "?", " ", " ", " "],
	    	 ["-", "1", "-", " ", " "],
	    	 ["-", "-", "-", " ", " "]],
	    	[["+", "+", "+", " ", " "],
	    	 ["+", " ", "+", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	12,
	  	],
	    [ 
	    	[[" ", "-", "-", "-", " "],
	    	 [" ", "?", "1", "-", " "],
	    	 [" ", "?", "1", "-", " "],
	    	 [" ", "?", "1", " ", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", "+", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	13,
	  	],
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
	    	20,
	  	],
	    [ 
	    	[["?", "?", "-"],
	    	 ["1", "2", "?"],
	    	 ["-", "-", "-"]],
	    	[[" ", " ", " "],
	    	 [" ", " ", "X"],
	    	 [" ", " ", " "]],
	    	3,
	    	21,
	  	],
	    [ 
	    	[["?", "?", "?"],
	    	 ["1", "2", "2"],
	    	 ["-", "-", "-"]],
	    	[[" ", " ", "X"],
	    	 [" ", " ", " "],
	    	 [" ", " ", " "]],
	    	3,
	    	22,
	  	],
	    [ 
	    	[[" ", " ", " ", "-", " "],
	    	 [" ", "F", "?", "?", "?"],
	    	 [" ", "-", "2", "1", "?"],
	    	 [" ", "-", "-", "?", "?"],
	    	 [" ", " ", " ", " ", " "]],
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", "+"],
	    	 [" ", " ", " ", " ", "+"],
	    	 [" ", " ", " ", " ", "+"],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	23,
	  	],
	    [ 
	    	[[" ", " ", " ", "-", " "],
	    	 [" ", "-", "-", "-", "?"],
	    	 [" ", "F", "2", "1", "?"],
	    	 [" ", "-", "?", "?", "?"],
	    	 [" ", " ", " ", " ", " "]],
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", "+"],
	    	 [" ", " ", " ", " ", "+"],
	    	 [" ", " ", " ", " ", "+"],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	24,
	  	],
	    [ 
	    	[[" ", "-", "-", "-", " "],
	    	 [" ", "F", "2", "?", " "],
	    	 [" ", "-", "2", "?", " "],
	    	 [" ", "-", "-", "?", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", "+", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	25,
	  	],
	    [ 
	    	[[" ", "F", "-", "-", " "],
	    	 [" ", "-", "2", "?", " "],
	    	 [" ", "-", "2", "?", " "],
	    	 [" ", "-", "-", "?", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", "X", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	26,
	  	],
	    [ 
	    	[[" ", "-", "F", "-", " "],
	    	 [" ", "-", "2", "?", " "],
	    	 [" ", "-", "2", "?", " "],
	    	 [" ", "-", "-", "?", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", "X", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	27,
	  	],
	    [ 
	    	[[" ", "-", "-", "F", " "],
	    	 [" ", "-", "2", "?", " "],
	    	 [" ", "-", "2", "?", " "],
	    	 [" ", "-", "-", "?", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", "X", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	28,
	  	],
	    [ 
	    	[[" ", "-", "-", "-", " "],
	    	 [" ", "?", "1", "-", " "],
	    	 [" ", "?", "2", "-", " "],
	    	 [" ", "?", "4", "-", " "],
	    	 [" ", "?", "F", "F", " "]],
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", "X", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	29,
	  	],
	    [ 
	    	[[" ", " ", " ", " ", " "],
	    	 ["?", "?", "?", "?", " "],
	    	 ["F", "2", "2", "-", " "],
	    	 [" ", "-", "-", "-", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", "X", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	201,
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
	    	30,
        ],
        [
	    	[["?", "?", "?"],
	    	 ["3", "3", "2"],
	    	 ["-", "F", "-"]],
	    	[["X", " ", " "],
	    	 [" ", " ", " "],
	    	 [" ", " ", " "]],
	    	3,
	    	31,
	    ],
	    [ 
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", "-", "-", "-", " "],
	    	 [" ", "F", "3", "2", "F"],
	    	 [" ", "F", "?", "?", "?"],
	    	 [" ", " ", " ", " ", " "]],
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", "+"],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	32,
	  	],
	    [ 
	    	[[" ", "F", "F", "-", " "],
	    	 [" ", "-", "3", "?", " "],
	    	 [" ", "-", "3", "?", " "],
	    	 [" ", "F", "F", "?", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", "+", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	33,
	  	],
	    [ 
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", "-", "-", "F", " "],
	    	 [" ", "F", "3", "3", "F"],
	    	 [" ", "?", "?", "?", "?"],
	    	 [" ", " ", " ", " ", " "]],
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", "+"],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	34,
	  	],
	    [ 
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", "F", "-", "-", "F"],
	    	 [" ", "-", "3", "3", "F"],
	    	 [" ", "?", "?", "?", "?"],
	    	 [" ", " ", " ", " ", " "]],
	    	[[" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "],
	    	 [" ", "X", " ", " ", " "],
	    	 [" ", " ", " ", " ", " "]],
	    	5,
	    	35,
	  	],
    ];
	this.patterns[4] = [
	    [ 
	    	[["?", "-", "?"],
	    	 ["?", "4", "?"],
	    	 ["?", "2", "-"]],
	    	[["X", " ", "X"],
	    	 [" ", " ", " "],
	    	 [" ", " ", " "]],
	    	3,
	    	40,
	  	], 
	    [ 
	    	[["-", "2", "?"],
	    	 ["F", "4", "?"],
	    	 ["-", "?", "?"]],
	    	[[" ", " ", " "],
	    	 [" ", " ", " "],
	    	 [" ", "X", "X"]],
	    	3,
	    	41,
	  	], 
    ];
	this.patterns[5] = [
	    [ 
 	    	[[" ", " ", " ", " ", " "],
 	    	 [" ", "F", "-", "-", " "],
 	    	 [" ", "F", "5", "2", " "],
 	    	 [" ", "F", "?", "?", "?"],
 	    	 [" ", " ", " ", " ", " "]],
 	    	[[" ", " ", " ", " ", " "],
 	    	 [" ", " ", " ", " ", "+"],
 	    	 [" ", " ", " ", " ", "+"],
 	    	 [" ", " ", " ", " ", "+"],
 	    	 [" ", " ", " ", " ", " "]],
 	    	5,
 	    	50,
 	  	],                
    ];
	this.patterns[6] = [];
	this.patterns[7] = [];
	this.patterns[8] = [];
	
	this.rotate = function(pattern) {	
		var newPattern = [];
		for(var i=0; i<pattern.length; i++) {
			newPattern[i] = [];
			for (var j=0; j<pattern[i].length; j++) {
				newPattern[i][j] = pattern[pattern.length-j-1][i]; 
			}
		}	
		return newPattern;
	};
	
	this.match = function (inputPattern, testPattern) {
		for (var i=0; i<inputPattern.length; i++) {
			for (var j=0; j<inputPattern[i].length; j++) {
				if (!(this.compare(inputPattern[i][j], testPattern[i][j])))
					return false;
			}
		}
		return true;
	};
	
	this.compare = function (input, patternSymbol) {
		switch (input) {
			case "?":
				result = this.testUnknown(patternSymbol);
				break;
			case "E":
				result = this.testOutOfBounds(patternSymbol);
				break;
			case "F":
				result = this.testFlag(patternSymbol);
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
	};
	
	this.testUnknown = function(patternSymbol) {
		switch (patternSymbol) {
			case "?":
				return true;
			case " ":
				return true;
			default:
				return false;
		}
	};
	
	this.testOutOfBounds = function(patternSymbol) {
		switch (patternSymbol) {
			case "E":
				return true;
			case "-":
				return true;
			case " ":
				return true;
			default:
				return false;
		}
	};
	
	this.testFlag = function(patternSymbol) {	
		if (patternSymbol=="F")
			return true;
	};
	
	this.testNumber = function(patternSymbol) {	
		switch (patternSymbol) {
			case "-":
				return true;
			case "E":
				return true;
			case " ":
				return true;
			default:
				return false;
		}
	};
}