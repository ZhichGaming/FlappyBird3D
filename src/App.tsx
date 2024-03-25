import { useEffect } from "react";
import "./styles/App.css";
import Game from "./game/Game";
import Game2D from "./game2d/Game2D";

export let game: Game;
export let game2d: Game2D;

function App() {
  useEffect(() => {
    game = new Game();
    // game.start();
    game2d = new Game2D(document.getElementById("game2d") as HTMLCanvasElement);
    game2d.start();
  }, []);

  return (
    <div className="canvas-container">
      <canvas id="game2d" tabIndex={0}></canvas>
      <canvas id="canvas"></canvas>
    </div>
  )
}

export default App;
