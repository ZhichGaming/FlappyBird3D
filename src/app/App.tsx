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

export default function App() {
  useEffect(() => {
    // game = new Game();
    // game.start();
    // game2d = new Game2D(document.getElementById("game2d") as HTMLCanvasElement);
    // game2d.start();
  }, []);

  return (
    // <StartMenu />
    <DeathMenu />
  )
}
