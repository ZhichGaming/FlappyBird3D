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
  }, []);

  return (
    <div>
      <canvas id="canvas" tabIndex={0}></canvas>
    </div>
  )
}

export default App;
