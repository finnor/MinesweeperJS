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
					flagCount = game.getNeighboringFlagCount(i, j);
					if (flagCount==game.board[i][j] && this.edges[i][j]> flagCount) {
						move = new Move(i, j, "X-Neighbors: Can click all neighbors");
						return move;
					}
					if (game.board[i][j]==this.edges[i][j] && this.edges[i][j]>flagCount) {
						move = new Move(i, j, "X-Neighbors: Can flag all neighbors");
						return move;
					}
					move = patternMatching(i, j);
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
	
	
}

function Move(x, y, message) {
	this.x = x;
	this.y = y;
	this.message = message;
}


/*
 * 
 * 
 * ? - visible
 * - - Not a mine
 */
function Patterns() {
	this.patterns = [
	    [ 
	    	[["?", "?", "?"],
	    	 ["1", "2", "1"],
	    	 ["-", "-", "-"]],
	    	[["X", "+", "X"],
	    	 [" ", " ", " "],
	    	 [" ", " ", " "]],
	  	],
    ];
	
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
	
	this.isMatch = function(x, y, inputPattern) {
		for (var i=0; i<this.patterns.length; i++) {
			for (var j=0; j<4; j++) {
				
			}
		}
	}
}