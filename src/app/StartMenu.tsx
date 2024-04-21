import "./styles/startMenu.css";

function StartMenu({ handleStart }: { handleStart: () => void }): JSX.Element {
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
            </div>
        </div>
    )
}

export default StartMenu;