// Main
var game;
createFirstGame(30,16,99);

/**
 * Class Representation of the board
 * @constructor
 */
function Game() {
	this.board = [];
	this.visible = [];
	this.flag = [];
	this.mineCount = 0;
	this.started = false;
	this.over = false;
	this.squaresLeft = 0;
	this.lastXPlayed = 0;
	this.lastYPlayed = 0;
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
  
	
	var singleClick = true;
	var rightDown = false;
	var leftDown = false;
	
	//Create event for left click -- reveal a spot
	$(".cell-btn").click(function(){		
		//If not part of a right + left click
		if (singleClick) {
			if (!$(this).hasClass("flag")) {
				var x = parseInt(this.getAttribute('data-x'));
				var y = parseInt(this.getAttribute('data-y'));
				//Handling for start of game where first click can't be mine
				if (!game.started) {
					startTimer();
					if (game.board[x][y]>=10) {
						changeBoard(x, y);
					}
				}
				game.started = true;
				click(x, y, $(this));
			}
		}
	});
	
	//Create event for right click -- flag a mine
	$(".cell-btn").on("contextmenu", function(e) {
		e.preventDefault();
		
		//If not part of a right + left click
		if (singleClick) {
			if(!($(this).hasClass("disabled"))) {
				var x = parseInt(this.getAttribute('data-x'));
				var y = parseInt(this.getAttribute('data-y'));
				if ($(this).hasClass("flag")) {
					$(this).removeClass("flag");
					game.flag[x][y] = false;
					game.mineCount++;
				} else {
					$(this).addClass("flag");
					game.flag[x][y] = true;
					game.mineCount--;
				}  
				$(".mine-count").text(game.mineCount);
			}
		}
	});	
	
	//Create event for right+left click -- clear neighbors
	$(".cell-btn").mousedown(function(e) {
		singleClick = true;
		if( e.button == 2 )
			rightDown = true;
		if (e.button == 0)
			leftDown = true;
		
		//Can only right+left click on cells that are visible
		if (rightDown && leftDown) {
			var x = parseInt(this.getAttribute('data-x'));
			var y = parseInt(this.getAttribute('data-y'));
			if (game.visible[x][y]) {
				if (game.board[x][y] == getNeighboringFlagCount(x, y)) {
					//Display what cells would be clicked on right+left click
					showClickableNeighbors(x, y);
				}
			}
		}
	});	
	
	//Create event for right+left click -- clear neighbors
	$(".cell-btn").mouseup(function(e) {
		if (rightDown && leftDown) {
			var x = parseInt(this.getAttribute('data-x'));
			var y = parseInt(this.getAttribute('data-y'));
			singleClick = false;
			
			//Can only right+left click on cells that are visible
			if (game.visible[x][y]) {
				//Remove css from the show clickable neighbors
				$(".cell-btn").removeClass("rl-click");
				var flagCount = getNeighboringFlagCount(x, y);
				if (flagCount==game.board[x][y]) {
					clearNeighbors(x, y);
				}
			}
		}
		if( e.button == 2 )
			rightDown = false;
		if (e.button == 0)
			leftDown = false;
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
	stopTimer();
	clearTimer();
	
	game = new Game();
	
	game.mineCount = mineNumber;
	game.squaresLeft = (x * y) - mineNumber;
	$(".mine-count").text(game.mineCount);
	
	for (var i=0; i<x+2; i++) {
		game.board[i] = [];
		game.visible[i] = [];
		game.flag[i] = [];
		
		for (var j=0; j<y+2; j++) {
			game.board[i][j] = 0;
			game.visible[i][j] = false;
			game.flag[i][j] = false;
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
 * Shows what cells would be clicked by right+left click
 *
 * @param {int} x The column clicked
 * @param {int} y The row clicked 
 */
function showClickableNeighbors(x, y) {
	for (var i=x-1; i<=x+1; i++) {
		for (var j=y-1; j<=y+1; j++) {
			if (!(i==x && j==y)) {
				if (game.flag[i][j]==false && game.visible[i][j]==false) {
					var cell = $("#btn" + i + "-" + j);
					cell.addClass("rl-click");
				}
			}
		}
	}	
}



/**
 * Counts the number of flags in neighboring cells
 *
 * @param {int} x The column clicked
 * @param {int} y The row clicked 
 */
function getNeighboringFlagCount(x, y) {
	flagCount = 0;
	
    flagCount = game.flag[x-1][y-1] + game.flag[x][y-1] + game.flag[x+1][y-1] +
    			game.flag[x-1][y] + game.flag[x+1][y] +
    			game.flag[x-1][y+1] + game.flag[x][y+1] + game.flag[x+1][y+1];
    
    return flagCount;
}

/**
 * Clears all neighbors if the number of flags equals the spot clicked
 *
 * @param {int} x The column clicked
 * @param {int} y The row clicked 
 */
function clearNeighbors(x, y) {
	for (var i=x-1; i<=x+1; i++) {
		for (var j=y-1; j<=y+1; j++) {
			if (!(i==x && j==y)) {
				if (i!=0 && i!=(game.board.length-1) && j!=0 && j!=(game.board[0].length-1)) {
					if (game.flag[i][j]==false && game.visible[i][j]==false) {
						var cell = $("#btn" + i + "-" + j);
						click(i, j, cell);
					}
				}
			}
		}
	}
}

/**
 * Directs response to actions based on value of clicked cell
 *
 * @param {int} x The column clicked
 * @param {int} y The row clicked 
 * @param {<button>} cell The button that was clicked   
 */
function click(x, y, cell) {
	var value = resolveCellOutput(game.board[x][y], cell);
	gameMechanics(value, x, y);
	game.lastXPlayed = x;
	game.lastYPlayed = y;
}



/**
 * Directs response to actions based on value of clicked cell
 *
 * @param {String} value The value of the cell
 * @param {int} x The column clicked
 * @param {int} y The row clicked   
 */
function gameMechanics(value, x, y) {
	game.visible[x][y] = true;
	
	switch (value) {
		//Mine
		case "X":
			if (game.over==false) {
				game.over=true;
				gameOver(x, y);
			}
			break;
		//Empty space
		case "\xa0":
			explode(x, y);
			break;
		default:
			console.debug(x + "|" + y);
			game.squaresLeft--;
			break;
	}
	
	if (game.squaresLeft==0)
		gameWon();
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
	      if (game.over==true)
	    	  cell.addClass("mine");
	      else
	    	  cell.addClass("mine-cause");
	      break;
	}
	
	if (value!="X")
		cell.text(value);
	
	return value;
}

/**
 * Recursively reveals all neighbors of zeros when one is clicked
 *
 * @param {int} x The column clicked
 * @param {int} y The row clicked   
 */
function explode(x, y) {
	var cell = $("#btn" + x + "-" + y);
	if (!(cell.hasClass("flag"))) {
		game.visible[x][y] = true;
		game.squaresLeft--;
		console.debug(x + "|" + y);
	    var value = resolveCellOutput(game.board[x][y], cell);
	    
	    if (game.board[x][y]==0) {
	    	for (var i=x-1; i<=x+1; i++) {
	    		for (var j=y-1; j<=y+1; j++) {
	    			if (i!=0 && i!=(game.board.length-1) && j!=0 && j!=(game.board[0].length-1)) {
	    				if (game.visible[i][j]==false) {
	    					game.visible[i][j] = true;
	    					explode(i, j);
	    				}
	    			}
	    		}
	    	}
	    }
	}
}

/**
 * Reveals and disables board when a mine is clicked
 * @param {int} x The column clicked
 * @param {int} y The row clicked   
 */
function gameOver(x, y) {
	stopTimer();
	$(".board-btn").removeClass("board-btn-normal");
	$(".board-btn").addClass("board-btn-game-over");
	
	for (var i=1; i<game.board.length-1; i++) {
		for (var j=1; j<game.board[i].length-1; j++) {
			if (!(x==i && y==j)) {
				cell = $("#btn" + i + "-" + j);
				cell.addClass("disabled");
				value = resolveCellOutput(game.board[i][j], cell);
				if (cell.hasClass("flag") && value!="X") {
					cell.text("X");
				}
			}
		}
	}
}

/**
 * Disables board when game is won
 */
function gameWon() {
	stopTimer();
	$(".board-btn").removeClass("board-btn-normal");
	$(".board-btn").addClass("board-btn-win");
	$(".cell-btn").addClass("disabled");
	
	for (var i=1; i<game.board.length-1; i++) {
		for (var j=1; j<game.board[i].length-1; j++) {
			cell = $("#btn" + i + "-" + j);
			if (game.board[i][j]>=10)
				cell.addClass("flag");
		}
	}
}

/**
 * Event handler to create a new board
 */
$(".board-btn").click(function () {
  $(".cell-btn").removeClass("disabled");
  $(this).removeClass();
  $(this).addClass("board-btn center board-btn-normal");
  game = generateBoard(30, 16, 99);
  $(".cell-btn").text("\xa0");
  $(".cell-btn").attr('class','cell-btn');
});

$(".board-btn").on("contextmenu", function(e) {
	e.preventDefault();
});

/**
 * Event handler find a move
 */
$(".move-btn").click(function() {
});	


