import "./styles/deathMenu.css";

function DeathMenu({ handleRespawn, handleQuit }: { handleRespawn: () => void, handleQuit: () => void }): JSX.Element {
    return(
        <div className="death-menu-container">
            <h1 className="jersey-15-regular gameover-text">Game Over</h1>
             <div className="button-container">
                <div className="buttons">
                    <button className="respawn glitch-button jersey-15-regular" onClick={handleRespawn}>RESPAWN</button>
                </div>
                <div className="buttons">
                    <button className="quit glitch-button jersey-15-regular" onClick={handleQuit}>QUIT</button>
                </div>
            </div>
        </div>
    )
}

export default DeathMenu;