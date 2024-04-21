import { useEffect } from "react";
import "./styles/App.css";
import Game from "./game/Game";
import Game2D from "./game2d/Game2D";
import StartMenu from "./startMenu";
import DeathMenu from "./deathMenu";

export let game: Game;
export let game2d: Game2D;

function App() {
  return (
    <DeathMenu/>
  )
}

export default App;