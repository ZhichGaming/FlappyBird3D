import { SFX } from "./App";
import "./styles/startMenu.css";
import { useEffect } from "react";

function StartMenu({ handleStart }: { handleStart: () => void }): JSX.Element {
    useEffect(() => {
        SFX["start-music"]?.play();
        SFX["start-music"] ? SFX["start-music"].loop = true : null;
    }, []);

    return(
        <div className="startmenu">
            <div className="start-menu-container">
                <img src="/dimensional-bird/background.jpg" alt="background" className="background"/>
                <div className="prompt">
                    <h1 className="jersey-15-regular">DIMENSIONAL BIRD</h1>
                    <div className="button-container">
                        <button className="play-button" onClick={handleStart}>
                            P L A Y
                            <div id="clip">
                                <div id="leftTop" className="corner"></div>
                                <div id="rightBottom" className="corner"></div>
                                <div id="rightTop" className="corner"></div>
                                <div id="leftBottom" className="corner"></div>
                            </div>
                            <span id="rightArrow" className="arrow"></span>
                            <span id="leftArrow" className="arrow"></span>
                        </button>
                    </div>
                </div>
                <h1 style={{ fontSize: 12, color: "white" }}>Press <kbd>Space</kbd> to jump, <kbd>A</kbd> and <kbd>D</kbd> to strafe.</h1>
            </div>
        </div>
    )
}

export default StartMenu;