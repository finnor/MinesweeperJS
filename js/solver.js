function Solver(game) {
	this.game = game;
	this.edges = createEdgesBoard(game.x, game.y);
	this.lastXScouted = 0;
	this.lastYScouted = 0;
	
	function createEdgesBoard(x, y) {
		var edges = [];
		//Iterate across entire game board
		for (var i=1; i<=x; i++) {
			edges[i] = [];
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
	
	function isEdge(x, y) {
		if (game.visible[x][y]==true && this.edges[x][y]>0)
			return true;
		else
			return false;
	}
}