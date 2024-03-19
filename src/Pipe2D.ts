import { Vector2 } from "three";
import { PIPE_VELOCITY } from "./Game2D";

class Pipe2D {
    position: Vector2;
    velocity: Vector2;
    acceleration: Vector2;
    width: number;
    height: number;
    spacing: number;

    passed: boolean = false;

    constructor(width: number, height: number, spacing: number, position?: Vector2, velocity?: Vector2, acceleration?: Vector2) {
        this.position = position ?? new Vector2(0, 0);
        this.velocity = velocity ?? new Vector2(PIPE_VELOCITY, 0);
        this.acceleration = acceleration ?? new Vector2(0, 0);
        this.width = width;
        this.height = height;
        this.spacing = spacing;
    }

    move(delta: number) {
        const normalizedDelta = delta * 60;

        this.velocity.x += this.acceleration.x * normalizedDelta;
        this.velocity.y += this.acceleration.y * normalizedDelta;

        this.position.x += this.velocity.x * normalizedDelta;
        this.position.y += this.velocity.y * normalizedDelta;
    }

    hasFinishedPassing() {
        return this.position.x + this.width < 0;
    }
}

export default Pipe2D;
