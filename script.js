const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const btnIniciar = document.getElementById('btnIniciar');
const overlay = document.getElementById('overlay');
const statusText = document.getElementById('status');
const videoFinal = document.getElementById('videoFinal');
const audioFinal = document.getElementById('audioFinal');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.imageSmoothingEnabled = false;

const Y_PISO = canvas.height - 100;

let assetsCargados = 0;
const assets = {
    lit: new Image(), canto: new Image(), fondo: new Image(), bafle: new Image()
};

assets.lit.src = 'lit_killah_master.png';
assets.canto.src = 'lit_cantando_flow.png';
assets.fondo.src = 'fondo_ciudad_fiesta.jpg';
assets.bafle.src = 'bafle_anim.png';

Object.values(assets).forEach(img => {
    img.onload = () => {
        assetsCargados++;
        if(assetsCargados === 4) {
            statusText.innerText = "¡TODO LISTO!";
            btnIniciar.style.display = "block";
        }
    };
});

// Variables de juego
let scrollOffset = 0;
let litX = 100;
let litY = Y_PISO - 120;
let litDy = 0;
let gameRunning = false;
let showInCourse = false;
const teclas = { derecha: false };

class Animador {
    constructor(img, fx, fy) { this.img = img; this.fx = fx; this.fy = fy; this.f = 0; this.t = Date.now(); }
    dibujar(x, y, w, h, fila = 0, speed = 130) {
        const sw = this.img.width / this.fx;
        const sh = this.img.height / this.fy;
        if (Date.now() - this.t > speed) { this.f = (this.f + 1) % this.fx; this.t = Date.now(); }
        ctx.drawImage(this.img, this.f * sw, fila * sh, sw, sh, x, y, w, h);
    }
}

const animLit = new Animador(assets.lit, 4, 2);
const animCanto = new Animador(assets.canto, 4, 1);
const animBafle = new Animador(assets.bafle, 4, 1);

function loop() {
    if(!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. FONDO
    let xF = -(scrollOffset * 0.3 % canvas.width);
    ctx.drawImage(assets.fondo, xF, 0, canvas.width, canvas.height);
    ctx.drawImage(assets.fondo, xF + canvas.width, 0, canvas.width, canvas.height);

    // 2. PISO TIPO MARIO (Ladrillos)
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(0, Y_PISO, canvas.width, 100);
    ctx.fillStyle = "#5d2e0d"; // Sombra ladrillos
    for(let i=0; i<canvas.width; i+=40) ctx.fillRect(i, Y_PISO+10, 35, 30);

    // 3. MOVIMIENTO
    if(!showInCourse) {
        litY += litDy;
        if(litY + 120 < Y_PISO) litDy += 0.8;
        else { litDy = 0; litY = Y_PISO - 120; }
        if(teclas.derecha) {
            if(litX < 400) litX += 6;
            else scrollOffset += 6;
        }
    }

    // 4. PERSONAJE
    if(showInCourse) {
        animCanto.dibujar(litX, litY, 120, 120, 0, 250);
    } else {
        let fila = teclas.derecha ? 1 : 0;
        animLit.dibujar(litX, litY, 120, 120, fila);
    }

    // 5. META (Bandera)
    let metaX = 4000 - scrollOffset;
    ctx.fillStyle = "white"; ctx.fillRect(metaX, Y_PISO-200, 5, 200);
    ctx.fillStyle = "red"; ctx.fillRect(metaX+5, Y_PISO-200, 40, 30);

    if(scrollOffset > 3950 && !showInCourse) {
        showInCourse = true;
        document.getElementById('videoContainer').style.display = "block";
        videoFinal.play();
        videoFinal.onended = () => {
            document.getElementById('videoContainer').style.display = "none";
            audioFinal.play();
        };
    }

    requestAnimationFrame(loop);
}

btnIniciar.onclick = () => {
    overlay.style.display = "none";
    gameRunning = true;
    loop();
};

window.onkeydown = (e) => { if(e.code === 'ArrowRight') teclas.derecha = true; if(e.code === 'Space' && litY >= Y_PISO - 121) litDy = -16; };
window.onkeyup = (e) => { if(e.code === 'ArrowRight') teclas.derecha = false; };
