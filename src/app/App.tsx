"use client";

import { useEffect } from "react";
import "./styles/page.css"
import Game from "./game/Game";
import Game2D from "./game2d/Game2D";
import StartMenu from "./StartMenu";
import DeathMenu from "./DeathMenu";
import { SFX } from "./game2d/SFX";

export let game: Game;
export let game2d: Game2D;

export const basePath = "/dimensional-bird";

export default function App() {
  useEffect(() => {
    game = new Game();
    // game.start();
    game2d = new Game2D(document.getElementById("game2d") as HTMLCanvasElement, handleEnd);
    // game2d.start();
  }, []);

  const handleStart = () => {
    game2d.reset();
    game2d.start();

    document.querySelector(".start-menu")?.classList.add("hidden");
    document.querySelector(".death-menu")?.classList.add("hidden");
    document.querySelector(".canvas-container")?.classList.remove("hidden");

    SFX["button-click"].play();
  }

  const handleEnd = () => {
    document.querySelector(".death-menu")?.classList.remove("hidden");
  }

  const handleRespawn = () => {
    game2d.reset();
    game2d.start();
    document.querySelector(".death-menu")?.classList.add("hidden");

    SFX["button-click"].play();
    SFX["death-music"].pause();
  }

  const handleQuit = () => {
    game2d.reset();
    document.querySelector(".death-menu")?.classList.add("hidden");
    document.querySelector(".canvas-container")?.classList.add("hidden");
    document.querySelector(".start-menu")?.classList.remove("hidden");

    SFX["button-click"].play();
    SFX["death-music"].pause();
  }

  return (
    <div className="app">
      <div className="start-menu">
        <StartMenu handleStart={handleStart}/>
      </div>
      <div className="canvas-container hidden">
        <canvas id="game2d" tabIndex={0}></canvas>
        <canvas id="canvas"></canvas>
      </div>
      <div className="death-menu hidden">
        <DeathMenu handleRespawn={handleRespawn} handleQuit={handleQuit}/>
      </div>
    </div>
  )
}
