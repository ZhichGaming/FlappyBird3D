import { SFX } from "./game2d/SFX";
import "./styles/deathMenu.css";
import { useEffect } from "react";

const handleClick = () => {
    SFX["button-click"].play();
    SFX["death-music"].pause();
}

useEffect(() => {
    SFX["death-music"].play();
    SFX["death-music"].loop = true;
}, []);

function DeathMenu() {
    return(
        <div className="container">
            <div className="prompt">
                <h1 className="jersey-15-regular">Game Over</h1>
            </div>
            <div className="button-container">
                <div className="buttons" onClick={handleClick}>
                    <button className="respawn glitch-button jersey-15-light">RESPAWN</button>
                </div>
                <div className="buttons" onClick={handleClick}>
                    <button className="quit glitch-button jersey-15-light">QUIT</button>
                </div>
            </div>
        </div>
    )
}

export default DeathMenu;