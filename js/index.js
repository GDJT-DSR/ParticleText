import { ParticleCvs } from "./particle.js";
const f = new FontFace('digital', 'url("../digital-7 (mono italic).ttf")');
f.load().then(font => document.fonts.add(font)).then(() => {
    let pc = new ParticleCvs(window.innerWidth * devicePixelRatio, window.innerHeight * devicePixelRatio, {
        dpr: true,
        willReadFrequently: true,
        font: `${140 * devicePixelRatio}px 'digital',Arial`,
        sizeInterval: [3, 4],
        // InitialCircleRadius: '80%',
        InitialCircleRadius: '150%',
        gap: 3
    });
    pc.canvas.id = 'cvs';
    document.body.appendChild(pc.canvas);
    draw();
    function draw() {
        requestAnimationFrame(draw);
        pc.text = getText();
    }
});
function getText() {
    return new Date().toTimeString().substring(0, 8); //.replace(/(?=1)/g, ' ');
}
