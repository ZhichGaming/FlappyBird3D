import { Vector2 } from "three";
import ImageTools from "../utils/ImageTools";

export enum LaserColor {
    RED,
    GREEN
}

export const FLASH_SIZE = 16;
export const FLASH_BRIGHT_NORM = 4 * (FLASH_SIZE/2) * (FLASH_SIZE/2) * Math.PI;

export const LASER_LEN = 32;
export const LASER_WIDTH = 4;

export const GLOW_SIZE = 8;

export let glowRed: HTMLCanvasElement | undefined;
export let glowGreen: HTMLCanvasElement | undefined;
export let glowRedCtx: CanvasRenderingContext2D | undefined;
export let glowGreenCtx: CanvasRenderingContext2D | undefined;

export let laserRed: HTMLCanvasElement | undefined;
export let laserGreen: HTMLCanvasElement | undefined;
export let laserRedCtx: CanvasRenderingContext2D | undefined;
export let laserGreenCtx: CanvasRenderingContext2D | undefined;

export let laserRedGlow: HTMLCanvasElement | undefined;
export let laserGreenGlow: HTMLCanvasElement | undefined;
export let laserRedGlowCtx: CanvasRenderingContext2D | undefined;
export let laserGreenGlowCtx: CanvasRenderingContext2D | undefined;

export default class Laser {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    initialPosition: Vector2;
    finalPosition: Vector2;
    rotation: number;

    speed: number;
    color: LaserColor;
    life: number;

    id: string;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, initialPosition: Vector2, finalPosition: Vector2, color: LaserColor, speed?: number) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.initialPosition = initialPosition;
        this.finalPosition = finalPosition;

        const diffX = finalPosition.x - initialPosition.x;
        const diffY = finalPosition.y - initialPosition.y;
        this.rotation = Math.atan2(diffY, diffX);

        this.color = color;
        this.speed = speed ?? 16;

        const distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
        this.life = Math.ceil(distance / this.speed);

        this.id = Math.random().toString(36).substr(2, 9);

        if (!laserRed || !laserGreen || !laserRedCtx || !laserGreenCtx) {
            laserRed = ImageTools.createImage(LASER_LEN, LASER_WIDTH);
            laserGreen = ImageTools.createImage(LASER_LEN, LASER_WIDTH);
            laserRedCtx = laserRed.getContext("2d")!;
            laserGreenCtx = laserGreen.getContext("2d")!;

            laserRedCtx.lineCap = laserGreenCtx.lineCap = "round";
            laserRedCtx.lineWidth = laserGreenCtx.lineWidth = LASER_WIDTH;
            laserRedCtx.strokeStyle = "#F33";
            laserGreenCtx.strokeStyle = "#3F3";
            laserRedCtx.beginPath();
            laserGreenCtx.beginPath();
            laserRedCtx.moveTo(LASER_WIDTH/2 + 1, LASER_WIDTH/2);
            laserGreenCtx.moveTo(LASER_WIDTH/2 + 1, LASER_WIDTH/2);
            laserRedCtx.lineTo(LASER_LEN - (LASER_WIDTH/2 + 1), LASER_WIDTH/2);
            laserGreenCtx.lineTo(LASER_LEN - (LASER_WIDTH/2 + 1), LASER_WIDTH/2);
            laserRedCtx.stroke();
            laserGreenCtx.stroke();
        }

        if (!laserRedGlow || !laserGreenGlow || !laserRedGlowCtx || !laserGreenGlowCtx) {
            laserRedGlow = ImageTools.createImage(LASER_LEN, LASER_WIDTH);
            laserGreenGlow = ImageTools.createImage(LASER_LEN, LASER_WIDTH);
            laserRedGlowCtx = laserRedGlow.getContext("2d")!;
            laserGreenGlowCtx = laserGreenGlow.getContext("2d")!;

            laserRedGlowCtx.lineCap = laserGreenGlowCtx.lineCap = "round";
            laserRedGlowCtx.shadowBlur = laserGreenGlowCtx.shadowBlur = GLOW_SIZE;
            laserRedGlowCtx.shadowColor = "#F33";
            laserGreenGlowCtx.shadowColor = "#3F3";
            laserRedGlowCtx.lineWidth = laserGreenGlowCtx.lineWidth = LASER_WIDTH;
            laserRedGlowCtx.strokeStyle = "#F33";
            laserGreenGlowCtx.strokeStyle = "#3F3";
            laserRedGlowCtx.beginPath();
            laserGreenGlowCtx.beginPath();
            laserRedGlowCtx.moveTo(LASER_WIDTH/2 + 1 + GLOW_SIZE, LASER_WIDTH/2 + GLOW_SIZE);
            laserGreenGlowCtx.moveTo(LASER_WIDTH/2 + 1 + GLOW_SIZE, LASER_WIDTH/2 + GLOW_SIZE);
            laserRedGlowCtx.lineTo(LASER_LEN + GLOW_SIZE * 2 - (LASER_WIDTH/2 + 1 + GLOW_SIZE), LASER_WIDTH/2 + GLOW_SIZE);
            laserGreenGlowCtx.lineTo(LASER_LEN + GLOW_SIZE * 2 - (LASER_WIDTH/2 + 1 + GLOW_SIZE), LASER_WIDTH/2 + GLOW_SIZE);
            laserRedGlowCtx.stroke();
            laserGreenGlowCtx.stroke();
        }

        if (!glowRed || !glowGreen || !glowRedCtx || !glowGreenCtx) {
            glowRed = ImageTools.createImage(FLASH_SIZE, FLASH_SIZE);
            glowRedCtx = glowRed.getContext("2d")!;
            glowRedCtx.fillStyle = ImageTools.createGradient(glowRedCtx, "radial", FLASH_SIZE/2, FLASH_SIZE/2, 0, FLASH_SIZE/2, ["#855F","#8000"]);
            glowRedCtx.fillRect(0, 0, FLASH_SIZE, FLASH_SIZE);

            glowGreen = ImageTools.createImage(FLASH_SIZE, FLASH_SIZE);
            glowGreenCtx = glowGreen.getContext("2d")!;
            glowGreenCtx.fillStyle = ImageTools.createGradient(glowGreenCtx, "radial", FLASH_SIZE/2, FLASH_SIZE/2, 0, FLASH_SIZE/2, ["#585F","#0600"]);
            glowGreenCtx.fillRect(0, 0, FLASH_SIZE, FLASH_SIZE);
        }
    }

    updateAndDraw() {
        let img: HTMLCanvasElement;
        let imgGlow: HTMLCanvasElement;

        if (!glowRed || !glowGreen || !laserRed || !laserGreen || !laserRedGlow || !laserGreenGlow) { 
            console.error("something is undefined among the following", glowRed, glowGreen, laserRed, laserGreen, laserRedGlow, laserGreenGlow);
            return
        }

        this.life--;

        if (this.life < 5) {
            if (this.color === LaserColor.RED) {
                img = laserRedGlow;
            } else {
                img = laserGreenGlow;
            }

            if (img) {
                this.ctx.globalCompositeOperation = "lighter";
                ImageTools.drawImage(img, this.initialPosition.x, this.initialPosition.y, (4 - this.life) * (4 - this.life), this.rotation, 1, this.ctx);
                ImageTools.drawImage(img, this.initialPosition.x, this.initialPosition.y, 4, this.rotation, this.life / 4, this.ctx);
                this.ctx.globalCompositeOperation = "source-over";
            }
        } else {
            this.initialPosition.x += this.speed * Math.cos(this.rotation);
            this.initialPosition.y += this.speed * Math.sin(this.rotation);

            if (this.color === LaserColor.RED) {
                img = laserRed;
                imgGlow = laserRedGlow;
            } else {
                img = laserGreen;
                imgGlow = laserGreenGlow;
            }

            this.ctx.globalCompositeOperation = "lighter";
            ImageTools.drawImage(imgGlow, this.initialPosition.x, this.initialPosition.y, 1, this.rotation, 1, this.ctx);
            ImageTools.drawImage(imgGlow, this.initialPosition.x, this.initialPosition.y, 2, this.rotation, Math.random() / 2, this.ctx);
            this.ctx.globalCompositeOperation = "source-over";
            ImageTools.drawImage(img, this.initialPosition.x, this.initialPosition.y, 1, this.rotation, 1, this.ctx);
        }
    }
}
