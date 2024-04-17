import "./styles/menus.css";

function StartMenu() {
    return(
        <div className="background">
            <div className="logo">
                <img src="./assets/menu_imgs/logl.png" alt="img" />
            </div>
            <div className="button">
                <button typeof="button">start</button>
            </div>
            <div className="button">
                <button>settings</button>
            </div>
        </div>
    )
}

export default StartMenu;