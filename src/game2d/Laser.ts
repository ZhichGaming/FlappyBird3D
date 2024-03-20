/// Original from https://stackoverflow.com/questions/40705631/drawing-a-nice-looking-laser-star-wars-on-the-canvas
/// Modified by Zhich

export default class Laser {
    flashSize = 16;
    flashBrightNorm = 4 * (this.flashSize/2) * (this.flashSize/2) * Math.PI; // area of the flash
    background?: HTMLCanvasElement;
    backgroundContext?: CanvasRenderingContext2D;
    tile?: HTMLCanvasElement;
    tileContext?: CanvasRenderingContext2D;
    glowRed?: HTMLCanvasElement;
    glowRedContext?: CanvasRenderingContext2D;
    glowGreen?: HTMLCanvasElement;
    glowGreenContext?: CanvasRenderingContext2D;
    grad?: CanvasGradient;

    laserGreen?: HTMLCanvasElement;
    laserGreenContext?: CanvasRenderingContext2D;
    laserRed?: HTMLCanvasElement;
    laserRedContext?: CanvasRenderingContext2D;
    laserGGreen?: HTMLCanvasElement;
    laserGGreenContext?: CanvasRenderingContext2D;
    laserGRed?: HTMLCanvasElement;
    laserGRedContext?: CanvasRenderingContext2D;

    readyToRock = false;
    burn?: HTMLCanvasElement;
    burnContext?: CanvasRenderingContext2D;

    // semi static array with object pool.
    bullets: Bullet[] = []; // array of bullets
    bulletPool: Bullet[] = []; // array of used bullets. Use to create new bullets this stops GC messing with frame rate
    BULLET_TYPES = {
        red : 0,
        green : 1,
    }
    resizeCount: number = 0;
    globalTime: number = 0;

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    RESIZE_DEBOUNCE_TIME = 100;
    
    cw?: number;
    w?: number;
    ch?: number;
    h?: number;
    mouse: any;
    
    /*************************************************************************************
     * Called from boilerplate code and is debounced by 100ms 
     * Creates all the images used in the demo.
     ************************************************************************************/ 
    onResize() {
        // create a background as drawable image
        this.background = this.imageTools.createImage(this.canvas.width, this.canvas.height);
        this.backgroundContext = this.background.getContext("2d")!;

        // create tile image
        this.tile = this.imageTools.createImage(64, 64);
        this.tileContext = this.tile.getContext("2d")!;

        this.tileContext.fillStyle = this.imageTools.createGradient(this.ctx, "linear", 0, 0, 64, 64, ["#555","#666"]);
        this.tileContext.fillRect(0,0,64,64); 
        this.tileContext.fillStyle = "#333"; // add colour
        this.tileContext.globalCompositeOperation = "lighter"; 
        this.tileContext.fillRect(0,0,62,2);
        this.tileContext.fillRect(0,0,2,62);
        this.tileContext.fillStyle = "#AAA"; // multiply colour to darken
        this.tileContext.globalCompositeOperation = "multiply"; 
        this.tileContext.fillRect(62,1,2,62);
        this.tileContext.fillRect(1,62,62,2);

        for (let y = -32; y < this.canvas.height; y += 64 ) {
            for (let x = -32; x < this.canvas.width; x += 64 ) {
                this.backgroundContext.drawImage(this.tile, x, y);
            }
        }
        this.backgroundContext.globalCompositeOperation = "multiply"; // setup for rendering burn marks

        this.burn = this.imageTools.createImage(this.flashSize/2,this.flashSize/2);
        this.burnContext = this.burn.getContext("2d")!;
        this.burnContext.fillStyle = this.imageTools.createGradient(this.ctx,"radial",this.flashSize/4,this.flashSize/4,0,this.flashSize/4,["#444","#444","#333","#000","#0000"]);
        this.burnContext.fillRect(0,0,this.flashSize/2,this.flashSize/2); 
        
        this.glowRed = this.imageTools.createImage(this.flashSize,this.flashSize);
        this.glowRedContext = this.glowRed.getContext("2d")!;
        this.glowRedContext.fillStyle = this.imageTools.createGradient(this.ctx,"radial",this.flashSize/2,this.flashSize/2,0,this.flashSize/2,["#855F","#8000"]);
                                                        // #855F is non standard colour last digit is alpha
                                                        // 8,8 is ceneter 0 first radius 8 second
        this.glowRedContext.fillRect(0,0,this.flashSize,this.flashSize); 
        
        const glowGreen = this.imageTools.createImage(this.flashSize,this.flashSize);
        const glowGreenContext = glowGreen.getContext("2d")!;
        glowGreenContext.fillStyle = this.imageTools.createGradient(this.ctx,"radial",this.flashSize/2,this.flashSize/2,0,this.flashSize/2,["#585F","#0600"]);
                                                        // #855F is non standard colour last digit is alpha
                                                        // 8,8 is ceneter 0 first radius 8 second
        glowGreenContext.fillRect(0,0,this.flashSize,this.flashSize); 
        
        // draw the laser 
        const laserLen = 32;
        const laserWidth = 4;

        this.laserRed = this.imageTools.createImage(laserLen,laserWidth);
        this.laserGreen = this.imageTools.createImage(laserLen,laserWidth);
        
        this.laserRedContext = this.laserRed.getContext("2d")!;
        this.laserGreenContext = this.laserGreen.getContext("2d")!;

        this.laserRedContext.lineCap = this.laserGreenContext.lineCap = "round";
        this.laserRedContext.lineWidth = this.laserGreenContext.lineWidth = laserWidth;
        this.laserRedContext.strokeStyle = "#F33";
        this.laserGreenContext.strokeStyle = "#3F3";
        this.laserRedContext.beginPath();
        this.laserGreenContext.beginPath();
        this.laserRedContext.moveTo(laserWidth/2 + 1,laserWidth/2);
        this.laserGreenContext.moveTo(laserWidth/2 + 1,laserWidth/2);
        this.laserRedContext.lineTo(laserLen - (laserWidth/2 + 1),laserWidth/2);
        this.laserGreenContext.lineTo(laserLen - (laserWidth/2 + 1),laserWidth/2);
        this.laserRedContext.stroke();
        this.laserGreenContext.stroke();
        
        // draw the laser glow FX
        var glowSize = 8;
        this.laserGRed = this.imageTools.createImage(laserLen + glowSize * 2,laserWidth + glowSize * 2);
        this.laserGGreen = this.imageTools.createImage(laserLen + glowSize * 2,laserWidth + glowSize * 2);
        this.laserGRedContext = this.laserGRed.getContext("2d")!;
        this.laserGGreenContext = this.laserGGreen.getContext("2d")!;
        
        this.laserGRedContext.lineCap = this.laserGGreenContext.lineCap = "round";
        this.laserGRedContext.shadowBlur = this.laserGGreenContext.shadowBlur = glowSize;
        this.laserGRedContext.shadowColor = "#F33"
        this.laserGGreenContext.shadowColor = "#3F3";
        this.laserGRedContext.lineWidth = this.laserGGreenContext.lineWidth = laserWidth;
        this.laserGRedContext.strokeStyle = "#F33";
        this.laserGGreenContext.strokeStyle = "#3F3";
        this.laserGRedContext.beginPath();
        this.laserGGreenContext.beginPath();
        this.laserGRedContext.moveTo(laserWidth/2 + 1 + glowSize,laserWidth/2 + glowSize);
        this.laserGGreenContext.moveTo(laserWidth/2 + 1 + glowSize,laserWidth/2 + glowSize);
        this.laserGRedContext.lineTo(laserLen + glowSize * 2 - (laserWidth/2 + 1 + glowSize),laserWidth/2 + glowSize);
        this.laserGGreenContext.lineTo(laserLen + glowSize * 2 - (laserWidth/2 + 1 + glowSize),laserWidth/2 + glowSize);
        this.laserGRedContext.stroke();
        this.laserGGreenContext.stroke();
        
        this.readyToRock = true;    
    }

    /*************************************************************************************
     * create or reset a bullet
     ************************************************************************************/    
    createShot(x: number, y: number, xx: number, yy: number, speed: number, type: number, bullet?: Bullet) { // create a bullet object
        if (bullet === undefined) {
            bullet = {};
        }

        var nx = xx-x; // normalise
        var ny = yy-y;
        var dist = Math.sqrt(nx*nx+ny*ny);
        nx /= dist;
        ny /= dist;
        bullet.x = x;
        bullet.y = y;
        bullet.speed = speed;
        bullet.type = type;
        bullet.xx = xx;
        bullet.yy = yy;
        bullet.nx = nx; // normalised vector
        bullet.ny = ny;
        bullet.rot =  Math.atan2(ny,nx); // will draw rotated so get the rotation 
        bullet.life = Math.ceil(dist/speed); // how long to keep alive

        return bullet;
    }

    /*************************************************************************************
     * Add a bullet to the bullet array
     ************************************************************************************/    
    addBullet(xx: number, yy: number, type: any) {
        let bullet, x, y;

        if (this.bulletPool.length > 0) {
            bullet = this.bulletPool.pop(); // get bullet from pool
        }

        if (type === this.BULLET_TYPES.red) {
            x = this.canvas.width + 16 + 32 * Math.random();
            y = Math.random() * this.canvas.height;
        } else if(type === this.BULLET_TYPES.green){
            x = - 16 - 32 * Math.random();
            y = Math.random() * this.canvas.height;
        }

        // randomise shoot to position
        var r = Math.random() * Math.PI * 2;
        var d = Math.random() * 128 + 16;
        xx += Math.cos(r)* d;
        yy += Math.sin(r)* d;

        this.bullets[this.bullets.length] = this.createShot(x!, y!, xx, yy, 16, type, bullet);
    }
    
    /*************************************************************************************
     * update and draw bullets
     ************************************************************************************/    
    updateDrawAllBullets() {
        let i, img, imgGlow;

        for (i = 0; i < this.bullets.length; i++) {
            let b = this.bullets[i];
            b.life! -= 1;

            if (b.life! <= 0) { // bullet end remove it and put it in the pool
                this.bulletPool[this.bulletPool.length] = this.bullets.splice(i,1)[0];
                i--; // to stop from skipping a bullet
            } else {
                if (b.life! < 5) {
                    if (b.life === 4) {
                        b.x! += b.nx! * b.speed! * 0.5;  // set to front of laser 
                        b.y! += b.ny! * b.speed! * 0.5;
                        var scale = 0.9 + Math.random() *1;
                        this.backgroundContext!.setTransform(scale, 0, 0, scale, b.x!, b.y!);
                        this.backgroundContext!.globalAlpha = 0.1 + Math.random() *0.2;
                        this.backgroundContext!.drawImage(this.burn!, -this.burn!.width /2, -this.burn!.height/2);
                    }

                    if (b.type === this.BULLET_TYPES.red) {
                        img = this.glowRed;
                    } else {
                        img = this.glowGreen;
                    }

                    if (img) {
                        this.ctx.globalCompositeOperation = "lighter"; 
                        this.imageTools.drawImage(img!, b.x!, b.y!, (4 - b.life!) * (4 - b.life!), b.rot!, 1, this.ctx);//b.life/4);                
                        this.imageTools.drawImage(img!, b.x!, b.y!, 4, b.rot!, b.life!/4, this.ctx);
                        this.ctx.globalCompositeOperation = "source-over"; 
                    }
                } else {
                    b.x! += b.nx! * b.speed!;
                    b.y! += b.ny! * b.speed!;
        
                    if (b.type === this.BULLET_TYPES.red) {
                        img = this.laserRed;
                        imgGlow = this.laserGRed;
                    } else {
                        img = this.laserGreen;
                        imgGlow = this.laserGGreen;
                    }

                    this.ctx.globalCompositeOperation = "lighter"; 
                    this.imageTools.drawImage(imgGlow!,b.x!,b.y!,1,b.rot!,1,this.ctx);
                    this.imageTools.drawImage(imgGlow!,b.x!,b.y!,2,b.rot!,Math.random()/2,this.ctx);
                    this.ctx.globalCompositeOperation = "source-over"; 
                    this.imageTools.drawImage(img!,b.x!,b.y!,1,b.rot!,1,this.ctx);
                }
            }
        }
    }

    /*************************************************************************************
     * Main display loop
     ************************************************************************************/
    display() { 
        if(this.readyToRock){
            this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
            this.ctx.globalAlpha = 1; // reset alpha
            this.ctx.drawImage(this.background!, 0, 0);
            this.ctx.globalCompositeOperation = "source-over"; 

            if (this.mouse.buttonRaw & 1) {
                this.addBullet(this.mouse.x, this.mouse.y, this.BULLET_TYPES.red);
                this.addBullet(this.mouse.x, this.mouse.y, this.BULLET_TYPES.green);
            }

            this.updateDrawAllBullets();
        }
    }

    /*************************************************************************************
     * Tools for creating canvas images and what not
     ************************************************************************************/
    imageTools = (function() {
        // This interface is as is. No warenties no garenties, and NOT to be used comercialy
        // var workImg,workImg1,keep; // for internal use
        let xdx,xdy,spr; // static vars for drawImage and drawSprite
        let keep = false; 

        var tools = {
            canvas : function (width: number, height: number) {  // create a blank image (canvas)
                let c = document.createElement("canvas");
                c.width = width;
                c.height = height;
                return c;
            },
            createImage : function (width: number, height: number) {
                let i = this.canvas(width, height);
                return i;
            },
            drawImage : function(image: HTMLCanvasElement, x: number, y: number, scale: number, ang: number, alpha: number, ctx: CanvasRenderingContext2D) {
                ctx.globalAlpha = alpha;
                xdx = Math.cos(ang) * scale;
                xdy = Math.sin(ang) * scale;
                ctx.setTransform(xdx, xdy, -xdy, xdx, x, y);
                ctx.drawImage(image, -image.width/2,-image.height/2);
            },
            hex2RGBA : function(hex: any){ // Not CSS colour as can have extra 2 or 1 chars for alpha
                                      // #FFFF & #FFFFFFFF last F and FF are the alpha range 0-F & 00-FF
                if(typeof hex === "string"){
                    var str = "rgba(";
                    if(hex.length === 4 || hex.length === 5){
                        str += (parseInt(hex.substr(1,1),16) * 16) + ",";
                        str += (parseInt(hex.substr(2,1),16) * 16) + ",";
                        str += (parseInt(hex.substr(3,1),16) * 16) + ",";
                        if (hex.length === 5) {
                            str += (parseInt(hex.substr(4,1),16) / 16);
                        } else {
                            str += "1";
                        }
                        return str + ")";
                    }
                    if(hex.length === 7 || hex.length === 8){
                        str += parseInt(hex.substr(1,2),16) + ",";
                        str += parseInt(hex.substr(3,2),16) + ",";
                        str += parseInt(hex.substr(5,2),16) + ",";

                        // huh?
                        // if (hex.length === 5) {
                        //     str += (parseInt(hex.substr(7,2),16) / 255).toFixed(3);
                        // } else {
                        //     str += "1";
                        // }
                        str += "1";

                        return str + ")";                
                    }
                    return "rgba(0,0,0,0)";
                }
            },            
            createGradient: function(ctx: CanvasRenderingContext2D, type: string, x: number, y: number, xx: number, yy: number, colours: string[]) { // Colours MUST be array of hex colours NOT CSS colours
                                                                         // See this.hex2RGBA for details of format
                let i,g,c;
                let len = colours.length;

                if (type.toLowerCase() === "linear") {
                    g = ctx.createLinearGradient(x,y,xx,yy);
                } else {
                    g = ctx.createRadialGradient(x,y,xx,x,y,yy);
                }

                for(i = 0; i < len; i++){
                    c = colours[i];
                    if(typeof c === "string"){
                        if (c[0] === "#") {
                            c = this.hex2RGBA(c);
                        }

                        g.addColorStop(Math.min(1,i / (len -1)), c!); // need to clamp top to 1 due to floating point errors causes addColorStop to throw rangeError when number over 1
                    }
                }
                return g;
                
            },
        };

        return tools;
    })();

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        // CODE FROM HERE DOWN IS SUPPORT CODE AN HAS LITTLE TO DO WITH THE ANSWER

        //==================================================================================================
        // The following code is support code that provides me with a standard interface to various forums.
        // It provides a mouse interface, a full screen canvas, and some global often used variable
        // like canvas, ctx, mouse, w, h (width and height), globalTime
        // This code is not intended to be part of the answer unless specified and has been formated to reduce
        // display size. It should not be used as an example of how to write a canvas interface.
        // By Blindman67
        // Zhich: I don't know what this is going, so I'm going to comment it out.
        // if(typeof this.onResize === "undefined"){
        //     window["onResize"] = undefined;  // create without the JS parser knowing it exists.
        //                                      // this allows for it to be declared in an outside 
        //                                      // modal.
        // }

        // var w, h, cw, ch, canvas, ctx, mouse, createCanvas, resizeCanvas, setGlobals, globalTime = 0, resizeCount = 0;

        this.canvas = canvas;
        this.ctx = ctx;

        this.mouse = (() => {
            function preventDefault(e: Event) {
                e.preventDefault();
            }

            let mouse: any = {
                x : 0,
                y : 0,
                w : 0,
                alt : false,
                shift : false,
                ctrl : false,
                buttonRaw : 0,
                over : false,
                bm : [1, 2, 4, 6, 5, 3],
                active : false,
                bounds : null,
                crashRecover : null,
                mouseEvents : "mousemove,mousedown,mouseup,mouseout,mouseover,mousewheel,DOMMouseScroll".split(","),
                updateBounds: () => {
                    if (mouse.active) {
                        mouse.bounds = mouse.element.getBoundingClientRect();
                    }
                },
                addCallback: (callback: any) => {
                    if (typeof callback === "function") {
                        if (mouse.callbacks === undefined) {
                            mouse.callbacks = [callback];
                        } else {
                            mouse.callbacks.push(callback);
                        }
                    } else {
                        throw new TypeError("mouse.addCallback argument must be a function");
                    }
                },
                start: (element: any, blockContextMenu: any) => {
                    if (mouse.element !== undefined) {
                        mouse.removeMouse();
                    }

                    mouse.element = element === undefined ? document : element;
                    mouse.blockContextMenu = blockContextMenu === undefined ? false : blockContextMenu;
                    mouse.mouseEvents.forEach((n: any) => {
                        mouse.element.addEventListener(n, this.mouseMove.bind(this));
                    });
                    if (mouse.blockContextMenu === true) {
                        mouse.element.addEventListener("contextmenu", preventDefault, false);
                    }
                    mouse.active = true;
                    mouse.updateBounds();
                },
                remove: () => {
                    if (mouse.element !== undefined) {
                        mouse.mouseEvents.forEach((n: any) => {
                            mouse.element.removeEventListener(n, this.mouseMove);
                        });
                        if (mouse.contextMenuBlocked === true) {
                            mouse.element.removeEventListener("contextmenu", preventDefault);
                        }
                        mouse.element = mouse.callbacks = mouse.contextMenuBlocked = undefined;
                        mouse.active = false;
                    }
                },
            };
            
            return mouse;
        })();

        // Clean up. Used where the IDE is on the same page.
        let done = () => {
            window.removeEventListener("resize", this.resizeCanvas)
            this.mouse.remove();
            document.body.removeChild(canvas);
            // canvas = ctx = mouse = undefined;
        }

        this.resizeCanvas();
        this.mouse.start(canvas, true);
        this.mouse.crashRecover = done;
        window.addEventListener("resize", this.resizeCanvas);

        // requestAnimationFrame(this.update);
        this.update(0);
        /** SimpleFullCanvasMouse.js end **/
    }

    private createCanvas() {
        var c, cs;
        cs = (c = document.createElement("canvas")).style;
        cs.position = "absolute";
        cs.top = cs.left = "0px";
        cs.zIndex = "1000";
        document.body.appendChild(c);
        return c;
    }

    private resizeCanvas() {
        if (this.canvas === undefined) {
            this.canvas = this.createCanvas();
        }

        this.canvas.width = window.innerWidth-2;
        this.canvas.height = window.innerHeight-2;

        if (typeof this.setGlobals === "function") {
            this.setGlobals();
        }

        if (typeof this.onResize === "function") {
            this.resizeCount++;
            setTimeout(this.debounceResize.bind(this), this.RESIZE_DEBOUNCE_TIME);
        }
    }

    private debounceResize() {
        this.resizeCount--;

        if (this.resizeCount <= 0) {
            this.onResize();
        }
    }

    private setGlobals() {
        this.cw = (this.w = this.canvas.width) / 2;
        this.ch = (this.h = this.canvas.height) / 2;
        this.mouse.updateBounds();
    }

    private mouseMove(e: WheelEvent) {
        let t = e.type;

        this.mouse.x = e.clientX - this.mouse.bounds.left;
        this.mouse.y = e.clientY - this.mouse.bounds.top;
        this.mouse.alt = e.altKey;
        this.mouse.shift = e.shiftKey;
        this.mouse.ctrl = e.ctrlKey;

        if (t === "mousedown") {
            this.mouse.buttonRaw |= this.mouse.bm[e.which - 1];
        } else if (t === "mouseup") {
            this.mouse.buttonRaw &= this.mouse.bm[e.which + 2];
        } else if (t === "mouseout") {
            this.mouse.buttonRaw = 0;
            this.mouse.over = false;
        } else if (t === "mouseover") {
            this.mouse.over = true;
        } else if (t === "mousewheel") {
            this.mouse.w = e.deltaY;
        } else if (t === "DOMMouseScroll") {
            this.mouse.w = -e.detail;
        }

        if (this.mouse.callbacks) {
            this.mouse.callbacks.forEach((c: any) => c(e));
        }

        if ((this.mouse.buttonRaw & 2) && this.mouse.crashRecover !== null) {
            if (typeof this.mouse.crashRecover === "function") {
                setTimeout(this.mouse.crashRecover, 0);
            }
        }

        e.preventDefault();
    }

    private update(timer: number) {
        this.globalTime = timer;
        this.display(); // call demo code with the missing arguments
        requestAnimationFrame(this.update.bind(this));
    }
}

type Bullet = {
    x?: number;
    y?: number;
    speed?: number;
    type?: number;
    xx?: number;
    yy?: number;
    nx?: number;
    ny?: number;
    rot?: number;
    life?: number;
}
