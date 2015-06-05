// Main
var game = new Game();
createFirstGame(30,16,99);

/**
 * Class Representation of the board
 * @constructor
 */
function Game() {
	this.board = [];
	this.visible = []
	this.started = false;
}

/**
 * Creates the HTML and button events for a new board
 *
 * @param {int} x The number of columns to create
 * @param {int} y The number of rows to create   
 */
function createInitialBoardUI(x, y) {
	//Create HTML for cells
	var tableHTML = "";
	for (var j=1; j<y+1; j++) {
		tableHTML += "<tr>";
		for (var i=1; i<x+1; i++) {
			tableHTML += "<td><button id=\"btn" + i + "-" + j + "\" class=\"cell-btn\" data-x=\"" + i + "\" data-y=\"" + j + "\">&nbsp;</button></td>";
		}
		tableHTML += "</tr>";
	}
	var boardUI = $(".board");
	boardUI.html(tableHTML);
  
	//Create event for left click -- reveal a spot
	$(".cell-btn").click(function(){
		if (!$(this).hasClass("flag")) {
			var x = parseInt(this.getAttribute('data-x'));
			var y = parseInt(this.getAttribute('data-y'));
			//Handling for start of game where first click can't be mine
			if (!game.started) {
				if (game.board[x][y]>=10) {
					changeBoard(x, y);
				}
			}
			game.started = true;
			var value = resolveCellOutput(game.board[x][y], $(this));
			gameMechanics(value, x, y);
		}
	});
	
	//Create event for right click -- flag a mine
	$(".cell-btn").on("contextmenu", function(e) {
		e.preventDefault();
		if(!($(this).hasClass("disabled"))) {
			if ($(this).hasClass("flag")) {
				$(this).removeClass("flag");
				$(this).text("\xa0");
			} else {
				$(this).addClass("flag");
				$(this).text("|");
			}     
		}
	});
}

/**
 * Creates the first game when the page loads
 *
 * @param {int} x The number of columns to create
 * @param {int} y The number of rows to create
 * @param {int} mines The number of mines on the board   
 */
function createFirstGame(x, y, mines) {
	game = generateBoard(x, y, mines);
	createInitialBoardUI(x, y)
}

/**
 * Generates a new array that maps visiblity and where mines are
 *
 * @param {int} x The number of columns to create
 * @param {int} y The number of rows to create
 * @param {int} mineNumber The number of mines on the board  
 * 
 *  @return {Game} 
 */
function generateBoard(x, y, mineNumber) {
	
	game.board = [[0]];
	game.visible = [[0]];
	for (var i=0; i<x+2; i++) {
		game.board[i] = [0];
		game.visible[i] = [0];
		for (var j=0; j<y+2; j++) {
			game.board[i][j] = 0;
			game.visible[i][j] = false;
		}
	}
	
	//Adds mines until enough have been added
	while (mineNumber>0) {
		var specX = Math.floor((Math.random() * x) + 1);
		var specY = Math.floor((Math.random() * y) + 1);
		if (game.board[specX][specY] < 10) {
			mineNumber--;
			//A mine is indicated by a value >= 1-
			game.board[specX][specY] = 10;
			
			//Increment neighbors
			//Row above incremented
			game.board[specX-1][specY-1]++;
			game.board[specX][specY-1]++;
			game.board[specX+1][specY-1]++;
			
			//This row incremented
			game.board[specX-1][specY]++;
			game.board[specX+1][specY]++;
      
			//Row below incremented
			game.board[specX-1][specY+1]++;
			game.board[specX][specY+1]++;
			game.board[specX+1][specY+1]++;
		}
	}
  
	game.started = false;
	return game;
}

/**
 * Handles the case where the first button clicked is a mine
 *    in which case the mine should be moved
 *
 * @param {int} x The column clicked
 * @param {int} y The row clicked 
 */
function changeBoard(x, y) {
	//Move mine to another location
	var spotFound=false;
	
	//Try moving the mine until we find a spot without a mine
	while(!spotFound) {
	    var specX = Math.floor((Math.random() * (game.board.length - 1)) + 1);
	    var specY = Math.floor((Math.random() * (game.board[0].length - 1)) +1);
	    //If found a non mine spot
	    if (game.board[specX][specY] < 10) {
	    	spotFound = true;
	    	game.board[specX][specY] = 10;
	    	
	    	//Fix neighbors of new mine
	        //Row above incremented
	        game.board[specX-1][specY-1]++;
	        game.board[specX][specY-1]++;
	        game.board[specX+1][specY-1]++;
	        
	        //This row incremented
	        game.board[specX-1][specY]++;
	        game.board[specX+1][specY]++;
	        
	        //Row below incremented
	        game.board[specX-1][specY+1]++;
	        game.board[specX][specY+1]++;
	        game.board[specX+1][specY+1]++;
	    	
	        
	    	//Fix neighbors of old mine and find number for old spot
	        mineCount=0;
	        //Row above decremented
	        if (game.board[x-1][y-1]>=10)
	        	mineCount++;
	        else
	        	game.board[x-1][y-1]--;
	        
	        if (game.board[x][y-1]>=10)
	        	mineCount++;
	        else
	        	game.board[x][y-1]--;

	        if (game.board[x+1][y-1]>=10)
	        	mineCount++;
	        else
	        	game.board[x+1][y-1]--;
	        
	        //This row decremented
	        if (game.board[x-1][y]>=10)
	        	mineCount++;
	        else
	        	game.board[x-1][y]--;
	        
	        if (game.board[x+1][y]>=10)
	        	mineCount++;
	        else
	        	game.board[x+1][y]--;
	        
	        //Row below decremented
	        if (game.board[x-1][y+1]>=10)
	        	mineCount++;
	        else
	        	game.board[x-1][y+1]--;
	        if (game.board[x][y+1]>=10)
	        	mineCount++;
	        else
	        	game.board[x][y+1]--;
	        if (game.board[x+1][y+1]>=10)
	        	mineCount++;
	        else
	        	game.board[x+1][y+1]--;
	        
	        //Fix old spot number
	        game.board[x][y] = mineCount;
	    }
	}
}

/**
 * Directs response to actions based on value of clicked cell
 *
 * @param {String} value The value of the cell
 * @param {int} x The column clicked
 * @param {int} y The row clicked   
 */
function gameMechanics(value, x, y) {
	switch (value) {
		//Mine
		case "X":
			gameOver();
			break;
		//Empty space
		case "\xa0":
			explode(x, y, game.visible.slice());
			break;
	}
	game.visible[x][y] = true;
}

/**
 * Takes the value from board and determines how a cell should appear
 *
 * @param {int} value The value of the board 
 * @param {<button>} cell The button that was clicked   
 * 
 * @return {String} The value that is output
 */
function resolveCellOutput(value, cell) {
	cell.addClass("disabled");
	switch(value) {
		//Empty space
	    case 0:
	      value = "\xa0";
	      break;
	    case 1:
	      cell.addClass("one");
	      break;
	    case 2:
	      cell.addClass("two");
	      break;
	    case 3:
	      cell.addClass("three");
	      break;
	    case 4:
	      cell.addClass("four");
	      break;
	    case 5:
	      cell.addClass("five");
	      break;
	    case 6:
	      cell.addClass("six");
	      break;
	    case 7:
	      cell.addClass("seven");
	      break;
	    case 8:
	      cell.addClass("eight");
	      break;
	    default:
	      value = "X";
	      cell.addClass("mine");
	      break;
	}
	
	cell.text(value);
	
	return value;
}

/**
 * Recursively reveals all neighbors of zeros when one is clicked
 *
 * @param {int} x The column clicked
 * @param {int} y The row clicked   
 * @param {int[][]} visited An array of that which cells have been processed
 */
function explode(x, y, visited) {
	console.debug(x + "|" + y + "|" + visited[x][y]);
	visited[x][y] = true;
	
	var cell = $("#btn" + x + "-" + y);
	if (!(cell.hasClass("flag"))) {
		game.visible[x][y] == true;
	    resolveCellOutput(game.board[x][y], cell);
	    
	    if (game.board[x][y]==0) {
	    	for (var i=x-1; i<=x+1; i++) {
	    		for (var j=y-1; j<=y+1; j++) {
	    			if (!(i==0 || i==(game.board.length-1) || y==0 || y==(game.board[0].length-1))) {
	    				if (visited[i][j]==false) {
	    					explode(i, j, visited);
	    				}
	    			}
	    		}
	    	}
	    }
	}
}

/**
 * Reveals and disables board when a mine is clicked
 */
function gameOver() {
	for (var i=0; i<game.board.length; i++) {
		for (var j=0; j<game.board[i].length; j++) {
			cell = $("#btn" + i + "-" + j);
			value = resolveCellOutput(game.board[i][j], cell);
			cell.text(value);
			cell.addClass("disabled");
			cell.removeClass("flag");
		}
	}
}

/**
 * Event handler to create a new board
 */
$(".board-btn").click(function () {
  $(".cell-btn").removeClass("disabled");
  game = generateBoard(30, 16, 99);
  $(".cell-btn").text("\xa0");
  $(".cell-btn").attr('class','cell-btn');
});

/**
 * Event handler find a move
 */
$(".move-btn").click(function() {
});


