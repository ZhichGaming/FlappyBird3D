import { useEffect } from "react";
import "./App.css";
import Game from "./Game";
import Game2D from "./Game2D";
import Laser from "./Laser";

export let game: Game;
export let game2d: Game2D;

function App() {
  useEffect(() => {
    // game = new Game();
    // game.start();
    // game2d = new Game2D();
    // game2d.start();
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    let laser = new Laser(canvas, ctx);
  }, []);

  return (
    <div>
      <canvas id="canvas" tabIndex={0}></canvas>
    </div>
  )
}

export default App;
