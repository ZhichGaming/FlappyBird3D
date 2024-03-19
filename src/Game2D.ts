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

        this.canvas.style.backgroundImage = 'url("src/assets/flappy-bird/sprites/background-day.png")';

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

            this.pipes.push(new Pipe2D(75, randomHeight, randomSpacing, new Vector2(window.innerWidth, 0)));
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
        this.renderGround();

        if (this.isGameOver) {
            this.ctx.fillStyle = 'red';
            this.ctx.font = '48px Arial';
            this.ctx.fillText('Game Over', this.canvas.width / 2 - 100, this.canvas.height / 2);
        }
    }

    private renderBird() {
        const birdState = Math.floor(this.frameCount / 10) % 3;
        const birdImage = new Image();
        const birdImageNames = [
            'downflap',
            'midflap',
            'upflap',
        ];
        
        birdImage.src = `src/assets/flappy-bird/sprites/yellowbird-${birdImageNames[birdState]}.png`;
        this.ctx.drawImage(birdImage, this.bird.position.x, this.bird.position.y, 34 * 2, 24 * 2);
    }

    private renderPipes() {
        this.pipes.forEach((pipe) => {
            const pipeImage = new Image();
            pipeImage.src = 'src/assets/flappy-bird/sprites/pipe-green.png';

            this.ctx.save();
            this.ctx.scale(1, -1);
            this.ctx.drawImage(pipeImage, pipe.position.x, -pipe.position.y - pipe.height, pipe.width, window.innerHeight / 1.5);
            this.ctx.restore();

            this.ctx.drawImage(pipeImage, pipe.position.x, pipe.position.y + pipe.height + pipe.spacing, pipe.width, window.innerHeight / 1.5);
        });
    }

    private renderGround() {
        const groundImage = new Image();
        const floorWidth = 500;
        const floorHeight = 100;
        groundImage.src = 'src/assets/flappy-bird/sprites/base.png';

        for (let i = 0; i < 6; i++) {
            const deviation = this.frameCount * Math.abs(new Pipe2D(0, 0, 0).velocity.x);
            const normalizedDeviation = deviation % floorWidth;

            this.ctx.drawImage(groundImage, i * floorWidth - normalizedDeviation, window.innerHeight - floorHeight, floorWidth, floorHeight);
        }
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
