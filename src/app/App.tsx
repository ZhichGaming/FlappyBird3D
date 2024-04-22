"use client";

import { useEffect } from "react";
import "./styles/page.css"
import Game from "./game/Game";
import Game2D from "./game2d/Game2D";
import StartMenu from "./StartMenu";
import DeathMenu from "./DeathMenu";

export let game: Game;
export let game2d: Game2D;

export const basePath = "/dimensional-bird";

export let SFX: { [name: string]: HTMLAudioElement } = {};

export default function App() {
  useEffect(() => {
    game = new Game(handleEnd);
    // game.start();
    game2d = new Game2D(document.getElementById("game2d") as HTMLCanvasElement, handleEnd);
    // game2d.start();
    SFX = {
      "3d-theme": new Audio("/dimensional-bird/sfx/3d_theme.mp3"),
      "big-laser": new Audio("/dimensional-bird/sfx/big_laser.wav"),
      "bird-jump": new Audio("/dimensional-bird/sfx/bird_jump.mp3"),
      "button-click": new Audio("/dimensional-bird/sfx/button_click.mp3"),
      "death-music": new Audio("/dimensional-bird/sfx/death_music.mp3"),
      "hit-pipe": new Audio("/dimensional-bird/sfx/hit_pipe.mp3"),
      "main-theme": new Audio("/dimensional-bird/sfx/main_theme.mp3"),
      "small-laser": new Audio("/dimensional-bird/sfx/small_laser.mp3"),
      "start-music": new Audio("/dimensional-bird/sfx/start_music.mp3"),
    }
  }, []);

  const handleStart = () => {
    game2d.reset(false);
    game2d.start();

    document.querySelector(".start-menu")?.classList.add("hidden");
    document.querySelector(".death-menu")?.classList.add("hidden");
    document.querySelector(".canvas-container")?.classList.remove("hidden");

    SFX["button-click"].play();
    SFX["start-music"].pause();
  }

  const handleEnd = () => {
    document.querySelector(".death-menu")?.classList.remove("hidden");

    SFX["main-theme"].pause();
    SFX["death-music"].play();
  }

  const handleRespawn = () => {
    game2d.reset(false);
    game2d.start();
    document.querySelector(".death-menu")?.classList.add("hidden");

    SFX["button-click"].play();
    SFX["death-music"].pause();
  }

  const handleQuit = () => {
    game2d.reset();
    game = new Game(handleEnd);
    document.querySelector(".death-menu")?.classList.add("hidden");
    document.querySelector(".canvas-container")?.classList.add("hidden");
    document.querySelector(".start-menu")?.classList.remove("hidden");

    SFX["button-click"].play();
    SFX["start-music"].play();
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
