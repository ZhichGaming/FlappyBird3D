import "./styles/menus.css";
import logo from "./assets/menu_imgs/logl.png";

function StartMenu() {
    return(
        <div className="startmenu">
            <div className="logo">
                <img src={logo} alt="img"/>
            </div>
            <div className="buttons">
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