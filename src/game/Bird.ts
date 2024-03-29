import GameObject from "./GameObject";

export default class Bird extends GameObject {
    hidden: boolean = false;
    
    constructor(x: number, y: number, z: number) {
        super(x, y, z);

        this.acceleration.y = -0.002;
    }
}
