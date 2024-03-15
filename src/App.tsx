import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
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
      <canvas id="canvas"></canvas>
    </div>
  )
}

export default App;
