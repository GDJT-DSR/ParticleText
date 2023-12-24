var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ParticleCvs_canvas, _ParticleCvs_text, _ParticleCvs_ctx, _ParticleCvs_particles;
/**
 * 获取min到max中的随机数
 * @param min 最小取值
 * @param max 最大取值
 */
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}
/**
 * 获取imgdata中某点的颜色
 * @param imgData 图像信息
 * @param x 横坐标
 * @param y 纵坐标
 * @returns 颜色
 */
function getPointColor(imgData, x, y) {
    const idx = (x + y * imgData.width) * 4;
    return [imgData.data[idx], imgData.data[idx + 1], imgData.data[idx + 2], imgData.data[idx + 3]];
}
let defaultConfig = {
    dpr: true,
    willReadFrequently: true,
    font: '16px Arial',
    sizeInterval: [3, 5],
    color: '#5445444d',
    InitialCircleRadius: '75%',
    gap: 4,
};
export class ParticleCvs {
    constructor(width, height, config) {
        var _a;
        _ParticleCvs_canvas.set(this, void 0);
        _ParticleCvs_text.set(this, '');
        _ParticleCvs_ctx.set(this, void 0);
        _ParticleCvs_particles.set(this, []);
        this.config = Object.assign(Object.assign({}, defaultConfig), config);
        __classPrivateFieldSet(this, _ParticleCvs_canvas, document.createElement('canvas'), "f");
        __classPrivateFieldGet(this, _ParticleCvs_canvas, "f").width = width;
        __classPrivateFieldGet(this, _ParticleCvs_canvas, "f").height = height;
        __classPrivateFieldSet(this, _ParticleCvs_ctx, __classPrivateFieldGet(this, _ParticleCvs_canvas, "f").getContext('2d', {
            willReadFrequently: (_a = this.config.willReadFrequently) !== null && _a !== void 0 ? _a : true,
        }), "f");
        this.render();
    }
    toDpr(val) {
        return this.config.dpr ? val * window.devicePixelRatio : val;
    }
    getPartcleConfig() {
        let rad = getRandom(0, Math.PI * 2);
        let r = 0;
        r = Number(this.config.InitialCircleRadius);
        if (isNaN(r)) {
            if (this.config.InitialCircleRadius.match(/\d*\.?\d*%/)) {
                r = Math.min(__classPrivateFieldGet(this, _ParticleCvs_canvas, "f").width, __classPrivateFieldGet(this, _ParticleCvs_canvas, "f").height) * parseFloat(this.config.InitialCircleRadius) / 200;
            }
            else if (this.config.InitialCircleRadius.endsWith('px')) {
                r = this.toDpr(parseFloat(this.config.InitialCircleRadius));
            }
            else {
                r = Math.min(__classPrivateFieldGet(this, _ParticleCvs_canvas, "f").width, __classPrivateFieldGet(this, _ParticleCvs_canvas, "f").height);
            }
        }
        return [
            r * Math.cos(rad) + __classPrivateFieldGet(this, _ParticleCvs_canvas, "f").width / 2,
            r * Math.sin(rad) + __classPrivateFieldGet(this, _ParticleCvs_canvas, "f").height / 2,
            this.toDpr(getRandom(...this.config.sizeInterval)) // r
        ];
    }
    update() {
        // 清除画布
        this.clearCvs();
        // 绘制文字
        const { height, width } = __classPrivateFieldGet(this, _ParticleCvs_canvas, "f");
        __classPrivateFieldGet(this, _ParticleCvs_ctx, "f").fillStyle = '#000';
        __classPrivateFieldGet(this, _ParticleCvs_ctx, "f").font = this.config.font;
        __classPrivateFieldGet(this, _ParticleCvs_ctx, "f").textAlign = 'center';
        __classPrivateFieldGet(this, _ParticleCvs_ctx, "f").textBaseline = 'middle';
        __classPrivateFieldGet(this, _ParticleCvs_ctx, "f").fillText(__classPrivateFieldGet(this, _ParticleCvs_text, "f"), width / 2, height / 2);
        // 获取粒子坐标
        let points = this.getPoints();
        // 创建粒子
        this.clearCvs();
        for (let i = 0; i < points.length; i++) {
            const [x, y] = points[i];
            let p = __classPrivateFieldGet(this, _ParticleCvs_particles, "f")[i];
            if (!p) {
                p = __classPrivateFieldGet(this, _ParticleCvs_particles, "f")[i] = new Particle(__classPrivateFieldGet(this, _ParticleCvs_ctx, "f"), ...this.getPartcleConfig(), this.config.color);
            }
            p.moveTo(x, y);
        }
        // 删除多余粒子
        if (__classPrivateFieldGet(this, _ParticleCvs_particles, "f").length > points.length) {
            __classPrivateFieldGet(this, _ParticleCvs_particles, "f").splice(points.length, __classPrivateFieldGet(this, _ParticleCvs_particles, "f").length - points.length);
        }
    }
    getPoints() {
        let res = [];
        // 获取像素信息
        const imgData = __classPrivateFieldGet(this, _ParticleCvs_ctx, "f").getImageData(0, 0, __classPrivateFieldGet(this, _ParticleCvs_canvas, "f").width, __classPrivateFieldGet(this, _ParticleCvs_canvas, "f").height);
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
    clearCvs() {
        __classPrivateFieldGet(this, _ParticleCvs_ctx, "f").clearRect(0, 0, __classPrivateFieldGet(this, _ParticleCvs_canvas, "f").width, __classPrivateFieldGet(this, _ParticleCvs_canvas, "f").height);
    }
    render() {
        this.clearCvs();
        for (const p of __classPrivateFieldGet(this, _ParticleCvs_particles, "f")) {
            p.draw();
        }
        // requestAnimationFrame(this.draw.bind(this));
    }
    // getter & setter
    get text() {
        return __classPrivateFieldGet(this, _ParticleCvs_text, "f");
    }
    set text(val) {
        if (val !== __classPrivateFieldGet(this, _ParticleCvs_text, "f")) {
            __classPrivateFieldSet(this, _ParticleCvs_text, val, "f");
            this.update();
        }
        this.render();
    }
    get canvas() {
        return __classPrivateFieldGet(this, _ParticleCvs_canvas, "f");
    }
}
_ParticleCvs_canvas = new WeakMap(), _ParticleCvs_text = new WeakMap(), _ParticleCvs_ctx = new WeakMap(), _ParticleCvs_particles = new WeakMap();
class Particle {
    constructor(ctx, x, y, r, color = '#5445444d') {
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
    moveTo(tx, ty) {
        const duration = 500; // 动画时间
        const sx = this.x;
        const sy = this.y;
        const vx = (tx - sx) / duration;
        const vy = (ty - sy) / duration;
        const start = Date.now();
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
        };
        requestAnimationFrame(step);
    }
}
