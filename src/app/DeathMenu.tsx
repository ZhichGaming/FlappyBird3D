import "./styles/deathMenu.css";

function DeathMenu() {
    return(
        <div className="container">
            <div className="prompt">
                <h1 className="jersey-15-regular">Game Over</h1>
            </div>
            <div className="button-container">
                <div className="buttons">
                    <button className="respawn glitch-button jersey-15-light">RESPAWN</button>
                </div>
                <div className="buttons">
                    <button className="quit glitch-button jersey-15-light">QUIT</button>
                </div>
            </div>
        </div>
    )
}

export default DeathMenu;