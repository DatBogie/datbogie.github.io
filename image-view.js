const urlParams = new URLSearchParams(document.location.search);
let imgSrc = urlParams.get("img");
if (imgSrc === undefined || imgSrc === "")
    imgSrc = "https://placehold.co/3440x1440";
else if (!imgSrc.startsWith("https://"))
    imgSrc = `https://assets.datbogie.org/${imgSrc}`;
const img = document.getElementById("image");
img.src = imgSrc;

function clamp(x,min,max) {
    const minR = Math.min(max ?? x,x);
    return Math.max(min ?? minR,minR);
}

class Vector {
    constructor(x=0,y=x) {
        this.X = x;
        this.Y = y;
    }
    clone() {
        return new Vector(this.X,this.Y);
    }
    set(x=0,y=0) {
        this.X = x;
        this.Y = y;
        return this.clone();
    }
    negate() {
        return this.mul(-1);
    }
    invert() {
        this.X = 1/this.X;
        this.Y = 1/this.Y;
        return this.clone();
    }
    add(vec) {
        if (!(vec instanceof Vector))
            vec = new Vector(vec);
        this.X+=vec.X;
        this.Y+=vec.Y;
        return this.clone();
    }
    sub(vec) {
        return this.add(vec.clone().negate());
    }
    mul(vec) {
        if (!(vec instanceof Vector))
            vec = new Vector(vec);
        this.X*=vec.X;
        this.Y*=vec.Y;
        return this.clone();
    }
    div(vec) {
        return this.mul(vec.clone().invert());
    }
    magnitude() {
        return Math.sqrt(this.X**2 + this.Y**2);
    }

    toString() {
        return `(${this.X}, ${this.Y})`;
    }

    static fromEvent(ev) {
        return new Vector(ev.clientX,ev.clientY);
    }
}

let down = false;
let drag = false;
let startVector = new Vector();
let distVector = new Vector();
let lastVector = new Vector();
let ctrl = false;

let shift = false;
let scale = 1.0;
let lastScale = scale;

window.addEventListener("keydown",ev=>{
    if (ev.key === "Shift") {
        ev.preventDefault();
        shift = true;
        img.classList.add("shift");
    } else if (ev.key === "Control") {
        ev.preventDefault();
        ctrl = true;
        img.classList.add("ctrl");
    }
});
window.addEventListener("keyup",ev=>{
    if (ev.key === "Shift") {
        ev.preventDefault();
        shift = false;
        img.classList.remove("shift");
    } else if (ev.key === "Control") {
        ev.preventDefault();
        ctrl = false;
        img.classList.remove("ctrl");
    }
});

window.addEventListener("mousedown",ev=>{
    ev.preventDefault();
    if (ev.button !== 0) return;
    if (down || drag) return;
    down = true;
    startVector = Vector.fromEvent(ev);
});
window.addEventListener("mousemove",ev=>{
    if (!drag && !down) return;
    let scaleDiff = scale/lastScale;
    distVector = Vector.fromEvent(ev).sub(startVector).add(lastVector.mul(scaleDiff));
    if (distVector.magnitude() <= 20) return;
    if (!drag) {
        drag = true;
        img.classList.add("drag");
        lastScale = scale;
    }
    const scaledDist = distVector.clone().mul(1/scale)
    img.style.transform = `translate(${scaledDist.X}px,${scaledDist.Y}px)`;
});
window.addEventListener("mouseup",ev=>{
    if (ev.button !== 0) return;
    down = false;
    if (drag) {
        lastVector = distVector.clone();
        drag = false;
        img.classList.remove("drag");
        return;
    }
    if (ctrl) {
        scale = 1;
        lastScale = scale;
        startVector.set();
        lastVector.set();
        distVector.set();
        img.classList.add("reset");
        img.style.scale = scale;
        img.style.transform = "none";
        setTimeout(()=>{
            img.classList.remove("reset");
        },1);
        return;
    }
    scale = clamp(scale+(!shift? 1 : -1),1);
    img.style.scale = scale;
});
window.addEventListener("wheel",ev=>{
    if (drag) return;
    scale = clamp(scale+(ev.deltaY >= 0? -1 : 1),1);
    img.style.scale = scale;
});