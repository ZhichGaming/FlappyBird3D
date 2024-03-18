import { useEffect } from "react";
import "./App.css";
import Game from "./Game";
import Game2D from "./Game2D";

export let game: Game;
export let game2d: Game2D;

function App() {
  useEffect(() => {
    // game = new Game();
    // game.start();
    game2d = new Game2D();
    game2d.start();
  }, []);

  return (
    <div>
      <canvas id="canvas" tabIndex={0}></canvas>
    </div>
  )
}

export default App;
