import Game from "minesweeperjs-engine";
import Solver from "minesweeperjs-solver";
import UI from "minesweeperjs-ui";
import difficulties from "./difficulties";
import "minesweeperjs-ui/dist/minesweeperjs-ui.css";


export function start(element, options) {
  if(typeof element ==="string") {
    if(element.charAt(0)==="#") {
      element = document.getElementById(element.slice(1));
    } else if (element.charAt(0)===".") {
      const elements = document.getElementsByClassName(element.slice(1));
      element = elements[0];
    }
  } else if (element instanceof HTMLElement) {
    // is element continue
  } else if(typeof element==="undefined") {
    throw "MinesweeperJS: An element was not provided.";
  } else {
    throw "MinesweeperJS: Not sure what you are using as an element to build.";
  }

  let difficulty = difficulties[0];
  let showSolver = true;
  if(options) {
    if(options.difficulty) {
      difficulty = difficulties.find(
        difficulty =>
          difficulty.name.toLowerCase()===options.difficulty.toLowerCase()
      );
      if(!difficulty) {
        difficulty = difficulties[0];
        console.error("An invalid game difficulty was provided. The game was initialized with a default instead.");
      }
    }

    // don't assign directly to expression because a null is defaulted to true
    if(options.showSolver===false) {
      showSolver = false;
    } else {
      showSolver = true;
    }
  }

  const game = new Game(difficulty.x, difficulty.y, difficulty.mines);
  const solver = (showSolver) ? new Solver(game) : null;
  const ui = new UI(game, solver, difficulty.name);
  element.appendChild(ui.create());
}

export default start;