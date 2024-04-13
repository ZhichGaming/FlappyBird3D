import GameObject from "./GameObject";

export const BIRD_GRAVITY = -0.002;

export default class Bird extends GameObject {
    hidden: boolean = false;

    constructor(x: number, y: number, z: number) {
        super(x, y, z);

        this.acceleration.y = BIRD_GRAVITY;
    }
}
