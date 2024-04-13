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
    hasPortal: boolean = false;
    portalAnimationProgress: number = 0;
    portalScale: number = 0;

    constructor(width: number, height: number, spacing: number, hasPortal?: boolean, position?: Vector2, velocity?: Vector2, acceleration?: Vector2) {
        this.position = position ?? new Vector2(0, 0);
        this.velocity = velocity ?? new Vector2(PIPE_VELOCITY, 0);
        this.acceleration = acceleration ?? new Vector2(0, 0);
        this.width = width;
        this.height = height;
        this.spacing = spacing;
        this.hasPortal = hasPortal ?? false;
    }

    move(delta: number, multiplier: number = 1) {
        const normalizedDelta = delta * 60;

        this.velocity.x += this.acceleration.x * normalizedDelta;
        this.velocity.y += this.acceleration.y * normalizedDelta;

        this.position.x += this.velocity.x * normalizedDelta * multiplier;
        this.position.y += this.velocity.y * normalizedDelta * multiplier;
    }

    hasFinishedPassing() {
        return this.position.x + this.width < 0;
    }
}

export default Pipe2D;
