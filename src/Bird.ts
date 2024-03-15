export default class Bird {
    private position: Vector3;
    private velocity: Vector3;
    private acceleration: Vector3;

    constructor(x: number, y: number, z: number) {
        this.position = new Vector3(x, y, z);
        this.velocity = new Vector3(0, 0, 0);
        this.acceleration = new Vector3(0, -0.01, 0);
    }

    update(deltaTime: number) {
        // Update velocity based on acceleration
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.velocity.z += this.acceleration.z * deltaTime;

        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
    }

    // Getters and setters for position, velocity, and acceleration

    getPosition(): Vector3 {
        return this.position;
    }

    setPosition(x: number, y: number, z: number) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    getVelocity(): Vector3 {
        return this.velocity;
    }

    setVelocity(x: number, y: number, z: number) {
        this.velocity.x = x;
        this.velocity.y = y;
        this.velocity.z = z;
    }

    getAcceleration(): Vector3 {
        return this.acceleration;
    }

    setAcceleration(x: number, y: number, z: number) {
        this.acceleration.x = x;
        this.acceleration.y = y;
        this.acceleration.z = z;
    }

    // Movement and physics methods

    move() {
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        this.velocity.z += this.acceleration.z;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;
    }
}

class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}