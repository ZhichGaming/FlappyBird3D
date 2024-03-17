import { useEffect } from "react";
import "./App.css";
import Game from "./Game";

export let game: Game;

function App() {
  useEffect(() => {
    game = new Game();
    game.start();
  }, []);

  return (
    <div>
      <canvas id="canvas" tabIndex={0}></canvas>
    </div>
  )
}

export default App;
