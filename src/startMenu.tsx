import "./styles/Startmenu.css";

function StartMenu() {
    return(
        <div className="startmenu">
            <div className="logo">
                <h1 className="jersey-15-regular">DIMENTIONAL BIRD</h1>
            </div>
            <div className="button-container">
                <button className="play-button">
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
    )
}

export default StartMenu;