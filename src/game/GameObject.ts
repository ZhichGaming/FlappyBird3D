import { Vector3 } from "three";

export default class GameObject {
    position: Vector3;
    velocity: Vector3;
    acceleration: Vector3;

    id: string;

    constructor(x: number, y: number, z: number) {
        this.position = new Vector3(x, y, z);
        this.velocity = new Vector3(0, 0, 0);
        this.acceleration = new Vector3(0, 0, 0);

        this.id = Math.random().toString(36).substr(2, 9);
    }

    move(delta: number) {
        let normalizedDelta = delta * 60;

        this.velocity.x += this.acceleration.x * normalizedDelta;
        this.velocity.y += this.acceleration.y * normalizedDelta;
        this.velocity.z += this.acceleration.z * normalizedDelta;

        // Update position based on velocity
        this.position.x += this.velocity.x * normalizedDelta;
        this.position.y += this.velocity.y * normalizedDelta;
        this.position.z += this.velocity.z * normalizedDelta;
    }
}
