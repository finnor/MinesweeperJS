# MinesweeperJS
A Javascript implementation of the classic minesweeper game with a helper to guide a player on how the game is played and show the patterns that can be used to solve the game.

## Example
A demo of the package can be found [here](http://finnor.github.io/MinesweeperJS/)

## Getting started
First include the css and javascript files from the dist folder on your page.

Then starting a game is easy!
```javascript
  minesweeperjs.start(element[, options]);
```
The element can be an HTMLElement or an element's id or class, e.g. ("#element-id", ".element-class")

## Options

#### difficulty - default ("easy")
  The difficulty the game is initialized with. Values can be "easy", "medium", or "hard"

  ```javascript
  minesweeperjs.start("#example-element", {
    difficulty: "hard"
  });
  ```
  
  * Easy - 8x8 grid with 10 mines
  * Medium - 16x16 grid with 40 mines
  * Hard - 30x16 grid with 99 mines

#### showSolver - default (true)
  The game can be initalized without displaying the solver help if you simply want to have a minesweeper game without the fuss. 

  ```javascript
  minesweeperjs.start("#example-element", {
    showSolver: false
  });
  ```