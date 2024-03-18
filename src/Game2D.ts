import { Vector2 } from "three";
import Bird from "./Bird";
import Pipe2D from "./Pipe2D";

export default class Game2D {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    bird: Bird;
    pipes: Pipe2D[];
    isGameOver: boolean;

    private lastTime?: Date;
    private frameCount = 0;

    constructor() {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.bird = new Bird(0, 0, 0);
        this.bird.acceleration.y = 0.3;
        this.pipes = [];
        this.isGameOver = false;

        this.setupEventListeners();
    }

    private setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.key === ' ') {
                this.jump();
            }
        });
    }

    start() {
        this.gameLoop();
    }

    private gameLoop() {
        if (this.isGameOver) {
            return;
        }

        const delta = this.delta();

        this.update(delta);
        this.render();

        this.frameCount++
        requestAnimationFrame(() => this.gameLoop());
    }

    private update(delta: number) {
        // Check for collision with pipes or ground
        const isInTopPipe = this.pipes.some((pipe) => pipe.position.x < this.bird.position.x + 50 && pipe.position.x + pipe.width > this.bird.position.x && pipe.position.y < this.bird.position.y + 50 && pipe.position.y + pipe.height > this.bird.position.y);
        const isInBottomPipe = this.pipes.some((pipe) => pipe.position.x < this.bird.position.x + 50 && pipe.position.x + pipe.width > this.bird.position.x && pipe.position.y + pipe.height + pipe.spacing < this.bird.position.y + 50 && pipe.position.y + pipe.height + pipe.spacing + window.innerHeight - pipe.height - pipe.spacing > this.bird.position.y);
        const isInPipe = isInTopPipe || isInBottomPipe;
        const isAboveGround = this.bird.position.y + 50 < window.innerHeight;
        if (isInPipe || !isAboveGround) {
            this.isGameOver = true;
        }

        this.updateBird(delta);
        this.updatePipes(delta);

        // Remove offscreen pipes
        this.pipes = this.pipes.filter((pipe) => !pipe.hasFinishedPassing());

        // Add new pipe every x frames
        if (this.frameCount % 100 === 0) {
            const randomHeight = Math.random() * (window.innerHeight - 400);
            const randomSpacing = Math.random() * 200 + 200;

            this.pipes.push(new Pipe2D(50, randomHeight, randomSpacing, new Vector2(window.innerWidth, 0)));
        }
    }

    private updateBird(delta: number) {
        this.bird.move(delta);
    }

    private updatePipes(delta: number) {
        this.pipes.forEach((pipe) => {
            pipe.move(delta);
        });
    }

    private render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.renderBird()
        this.renderPipes();

        if (this.isGameOver) {
            this.ctx.fillStyle = 'red';
            this.ctx.font = '48px Arial';
            this.ctx.fillText('Game Over', this.canvas.width / 2 - 100, this.canvas.height / 2);
        }
    }

    private renderBird() {
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillRect(this.bird.position.x, this.bird.position.y, 50, 50);
    }

    private renderPipes() {
        this.pipes.forEach((pipe) => {
            this.ctx.fillStyle = 'green';
            this.ctx.fillRect(pipe.position.x, pipe.position.y, pipe.width, pipe.height);

            this.ctx.fillStyle = 'green';
            this.ctx.fillRect(pipe.position.x, pipe.position.y + pipe.height + pipe.spacing, pipe.width, window.innerHeight - pipe.height - pipe.spacing);
        });
    }

    private jump() {
        this.bird.velocity.y = -8;
    }

    private delta() {
        if (!this.lastTime) {
            this.lastTime = new Date();
            return 0;
        }

        const currentTime = new Date();
        const delta = currentTime.getTime() - this.lastTime.getTime();
        this.lastTime = currentTime;

        return delta / 1000;
    }
}
