export default class Bird {
    private position: Vector2;
    private velocity: Vector2;
    private acceleration: Vector2;

    constructor(x: number, y: number) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.acceleration = new Vector2(0, 0);
    }

    update(deltaTime: number) {
        // Update velocity based on acceleration
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;

        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
    }

    // Getters and setters for position, velocity, and acceleration

    getPosition(): Vector2 {
        return this.position;
    }

    setPosition(x: number, y: number) {
        this.position.x = x;
        this.position.y = y;
    }

    getVelocity(): Vector2 {
        return this.velocity;
    }

    setVelocity(x: number, y: number) {
        this.velocity.x = x;
        this.velocity.y = y;
    }

    getAcceleration(): Vector2 {
        return this.acceleration;
    }

    setAcceleration(x: number, y: number) {
        this.acceleration.x = x;
        this.acceleration.y = y;
    }

    // Movement and physics methods

    move() {
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}