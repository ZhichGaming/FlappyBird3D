import { useEffect } from "react";
import "./styles/App.css";
import Game from "./game/Game";
import Game2D from "./game2d/Game2D";
import Laser from "./game2d/Laser";

export let game: Game;
export let game2d: Game2D;

function App() {
  useEffect(() => {
    // game = new Game();
    // game.start();
    game2d = new Game2D();
    game2d.start();
    // const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    // const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    // let laser = new Laser(canvas, ctx);
  }, []);

  return (
    <div>
      <canvas id="canvas" tabIndex={0}></canvas>
    </div>
  )
}

export default App;
