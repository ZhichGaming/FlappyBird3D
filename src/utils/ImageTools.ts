export default class ImageTools {
    private static xdx: number;
    private static xdy: number;
    private static keep: boolean = false;

    static canvas(width: number, height: number): HTMLCanvasElement {
        const c = document.createElement("canvas");
        c.width = width;
        c.height = height;
        return c;
    }

    static createImage(width: number, height: number): HTMLCanvasElement {
        return this.canvas(width, height);
    }

    static drawImage(
        image: HTMLCanvasElement,
        x: number,
        y: number,
        scale: number,
        ang: number,
        alpha: number,
        ctx: CanvasRenderingContext2D
    ) {
        ctx.globalAlpha = alpha;
        this.xdx = Math.cos(ang) * scale;
        this.xdy = Math.sin(ang) * scale;
        ctx.setTransform(this.xdx, this.xdy, -this.xdy, this.xdx, x, y);
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
    }

    static hex2RGBA(hex: string): string {
        let str = "rgba(";

        if (hex.length === 4 || hex.length === 5) {
            str += (parseInt(hex.substr(1, 1), 16) * 16) + ",";
            str += (parseInt(hex.substr(2, 1), 16) * 16) + ",";
            str += (parseInt(hex.substr(3, 1), 16) * 16) + ",";

            if (hex.length === 5) {
                str += (parseInt(hex.substr(4, 1), 16) / 16);
            } else {
                str += "1";
            }

            return str + ")";
        }

        if (hex.length === 7 || hex.length === 8) {
            str += parseInt(hex.substr(1, 2), 16) + ",";
            str += parseInt(hex.substr(3, 2), 16) + ",";
            str += parseInt(hex.substr(5, 2), 16) + ",";
            str += "1";

            return str + ")";
        }

        return "rgba(0,0,0,0)";
    }

    static createGradient(
        ctx: CanvasRenderingContext2D,
        type: string,
        x: number,
        y: number,
        xx: number,
        yy: number,
        colours: string[]
    ) {
        let i, g, c;
        const len = colours.length;

        if (type.toLowerCase() === "linear") {
            g = ctx.createLinearGradient(x, y, xx, yy);
        } else {
            g = ctx.createRadialGradient(x, y, xx, x, y, yy);
        }

        for (i = 0; i < len; i++) {
            c = colours[i];
            if (typeof c === "string") {
                if (c[0] === "#") {
                    c = this.hex2RGBA(c);
                }
                g.addColorStop(Math.min(1, i / (len - 1)), c!);
            }
        }
        return g;
    }
}
