type Config = {
    dpr: boolean,
    willReadFrequently: boolean,
    font: string,
    sizeInterval: [number, number],
    color: string,
    InitialCircleRadius: string,
    gap: number,
}
type PartialConfig = Partial<Config>;

type Color = [number, number, number, number];
type Position = [number, number];


/**
 * 获取min到max中的随机数
 * @param min 最小取值
 * @param max 最大取值
 */
function getRandom(min: number, max: number) {
    return Math.random() * (max - min) + min;
}


/**
 * 获取imgdata中某点的颜色
 * @param imgData 图像信息
 * @param x 横坐标
 * @param y 纵坐标
 * @returns 颜色
 */
function getPointColor(imgData: ImageData, x: number, y: number): Color {
    const idx = (x + y * imgData.width) * 4;
    return [imgData.data[idx], imgData.data[idx + 1], imgData.data[idx + 2], imgData.data[idx + 3]];
}

let defaultConfig: Config = {
    dpr: true,
    willReadFrequently: true,
    font: '16px Arial',
    sizeInterval: [3, 5],
    color: '#5445444d',
    InitialCircleRadius: '75%',
    gap: 4,
}

export class ParticleCvs {
    #canvas: HTMLCanvasElement;
    #text = '';
    #ctx: CanvasRenderingContext2D;
    config: Config;
    #particles: Particle[] = [];
    constructor(width: number, height: number, config?: PartialConfig) {
        this.config = {
            ...defaultConfig,
            ...config,
        };
        this.#canvas = document.createElement('canvas');
        this.#canvas.width = width;
        this.#canvas.height = height;
        this.#ctx = this.#canvas.getContext('2d', {
            willReadFrequently: this.config.willReadFrequently ?? true,
        }) as CanvasRenderingContext2D;
        this.render();
    }
    private toDpr(val: number): number {
        return this.config.dpr ? val * window.devicePixelRatio : val;
    }
    private getPartcleConfig(): [number, number, number] {
        let rad = getRandom(0, Math.PI * 2);
        let r = 0;
        r = Number(this.config.InitialCircleRadius);
        if (isNaN(r)) {
            if (this.config.InitialCircleRadius.match(/\d*\.?\d*%/)) {
                r = Math.min(this.#canvas.width, this.#canvas.height) * parseFloat(this.config.InitialCircleRadius) / 200;
            } else if (this.config.InitialCircleRadius.endsWith('px')) {
                r = this.toDpr(parseFloat(this.config.InitialCircleRadius));
            } else {
                r = Math.min(this.#canvas.width, this.#canvas.height)
            }
        }
        return [
            r * Math.cos(rad) + this.#canvas.width / 2, // x
            r * Math.sin(rad) + this.#canvas.height / 2, // y 
            this.toDpr(getRandom(...this.config.sizeInterval)) // r
        ]
    }
    private update() {
        // 清除画布
        this.clearCvs();
        // 绘制文字
        const { height, width } = this.#canvas;
        this.#ctx.fillStyle = '#000'
        this.#ctx.font = this.config.font;
        this.#ctx.textAlign = 'center';
        this.#ctx.textBaseline = 'middle';
        this.#ctx.fillText(this.#text, width / 2, height / 2);
        // 获取粒子坐标
        let points = this.getPoints();
        // 创建粒子
        this.clearCvs();
        for (let i = 0; i < points.length; i++) {
            const [x, y] = points[i];
            let p = this.#particles[i];
            if (!p) {
                p = this.#particles[i] = new Particle(this.#ctx, ...this.getPartcleConfig(), this.config.color);
            }
            p.moveTo(x, y);
        }
        // 删除多余粒子
        if (this.#particles.length > points.length) {
            this.#particles.splice(points.length, this.#particles.length - points.length);
        }

    }
    private getPoints(): Position[] {
        let res: Position[] = [];
        // 获取像素信息
        const imgData = this.#ctx.getImageData(0, 0, this.#canvas.width, this.#canvas.height);
        // const gap = this.toDpr(this.congapfig.sizeInterval[0]);
        const gap = Math.floor(this.toDpr(this.config.gap));
        for (let x = 0; x < imgData.width; x += gap) {
            for (let y = 0; y < imgData.height; y += gap) {
                const [r, g, b, a] = getPointColor(imgData, x, y);
                if (r === 0 && g === 0 && b === 0 && a === 255) {
                    res.push([x, y]);
                }
            }
        }
        return res;
    }
    private clearCvs(): void {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    render() {
        this.clearCvs();
        for (const p of this.#particles) {
            p.draw();
        }
        // requestAnimationFrame(this.draw.bind(this));
    }

    // getter & setter

    get text(): string {
        return this.#text;
    }
    set text(val: string) {
        if (val !== this.#text) {
            this.#text = val;
            this.update();
        }
        this.render();
    }

    get canvas(): HTMLCanvasElement {
        return this.#canvas;
    }
}

class Particle {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    r: number;
    color: string;
    constructor(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string = '#5445444d') {
        this.ctx = ctx;

        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    moveTo(tx: number, ty: number) {
        const duration = 500; // 动画时间
        const sx = this.x;
        const sy = this.y;
        const vx = (tx - sx) / duration;
        const vy = (ty - sy) / duration;
        const start = Date.now()
        const step = () => {
            const t = Date.now() - start;
            if (t >= duration) {
                this.x = tx;
                this.y = ty;
            }
            else {
                this.x = sx + vx * t;
                this.y = sy + vy * t;
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }
}