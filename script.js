const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const audioFinal = document.getElementById('audioFinal');
const videoFinal = document.getElementById('videoFinal');
const videoContainer = document.getElementById('videoContainer');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const Y_PISO = canvas.height - 80; // Subí un poco el piso para que se vea mejor

let imagenesCargadas = 0;
const totalImagenes = 6;

function checkCarga() {
    imagenesCargadas++;
    if (imagenesCargadas === totalImagenes) main();
}

const assets = {
    lit: new Image(), canto: new Image(), fondo: new Image(),
    bafle: new Image(), micro: new Image(), gorra: new Image()
};

// --- CARGA DE ASSETS ---
assets.lit.onload = checkCarga; assets.lit.src = 'lit_killah_master.png';
assets.canto.onload = checkCarga; assets.canto.src = 'lit_cantando_flow.png';
assets.fondo.onload = checkCarga; assets.fondo.src = 'fondo_ciudad_fiesta.jpg';
assets.bafle.onload = checkCarga; assets.bafle.src = 'bafle_anim.png';
assets.micro.onload = checkCarga; assets.micro.src = 'micro_anim.png';
assets.gorra.onload = checkCarga; assets.gorra.src = 'enemigo_gorra.png';

let scrollOffset = 0;
let gameIsOver = false;
let showIsRunning = false;
let cinematicPlayed = false;
const teclas = { derecha: { presionada: false }, izquierda: { presionada: false } };

class Jugador {
    constructor() {
        this.x = 100; this.y = Y_PISO - 120; this.dy = 0;
        this.frame = 0; this.timer = Date.now();
    }
    dibujar() {
        const ahora = Date.now();
        let img = (showIsRunning && cinematicPlayed) ? assets.canto : assets.lit;
        
        // Si no se ve nada, es posible que el frame sea muy grande. 
        // Vamos a intentar dibujar la imagen completa si el recorte falla.
        try {
            let fila = (teclas.derecha.presionada || teclas.izquierda.presionada) ? 64 : 0;
            let maxFrames = (showIsRunning) ? 4 : (fila === 64 ? 4 : 2);
            if (ahora - this.timer > 100) { this.frame = (this.frame + 1) % maxFrames; this.timer = ahora; }
            
            // Dibujo con recorte (Sprite Sheet)
            ctx.drawImage(img, this.frame * 64, fila, 64, 64, this.x, this.y, 120, 120);
        } catch (e) {
            // Dibujo de emergencia (Imagen completa)
            ctx.drawImage(img, this.x, this.y, 120, 120);
        }
    }
    actualizar() {
        if (showIsRunning && !cinematicPlayed) return;
        this.y += this.dy;
        if (this.y + 120 < Y_PISO) { this.dy += 0.8; }
        else { this.dy = 0; this.y = Y_PISO - 120; }
        if (teclas.derecha.presionada && this.x < 400) this.x += 6;
        else if (teclas.izquierda.presionada && this.x > 50) this.x -= 6;
        else if (teclas.derecha.presionada) scrollOffset += 6;
    }
}

class Enemigo {
    constructor(x, y, img) { this.x = x; this.y = y; this.img = img; }
    dibujar() {
        let posX = this.x - scrollOffset;
        if (posX > -100 && posX < canvas.width + 100) {
            ctx.drawImage(this.img, posX, this.y, 80, 80);
        }
    }
}

const lit = new Jugador();
const enemigos = [
    new Enemigo(1200, Y_PISO - 80, assets.bafle),
    new Enemigo(2200, Y_PISO - 80, assets.gorra),
    new Enemigo(3200, Y_PISO - 80, assets.micro)
];

// --- EVENTOS ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') teclas.derecha.presionada = true;
    if (e.code === 'ArrowLeft') teclas.izquierda.presionada = true;
    if (e.code === 'Space' && lit.y >= Y_PISO - 121) lit.dy = -16;
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') teclas.derecha.presionada = false;
    if (e.code === 'ArrowLeft') teclas.izquierda.presionada = false;
});

// Controles táctiles
const setupTouch = (id, tecla) => {
    const btn = document.getElementById(id);
    if(btn) {
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); teclas[tecla].presionada = true; });
        btn.addEventListener('touchend', () => teclas[tecla].presionada = false);
    }
};
setupTouch('btnIzq', 'izquierda');
setupTouch('btnDer', 'derecha');
document.getElementById('btnSalto')?.addEventListener('touchstart', (e) => { 
    e.preventDefault(); if (lit.y >= Y_PISO - 121) lit.dy = -16; 
});

function activarCinematica() {
    showIsRunning = true;
    teclas.derecha.presionada = false;
    videoContainer.style.display = 'block';
    videoFinal.play().catch(e => console.log("Error video:", e));
    videoFinal.onended = () => {
        videoContainer.style.display = 'none';
        cinematicPlayed = true;
        audioFinal.play();
    };
}

function main() {
    if (window.innerHeight > window.innerWidth) {
        ctx.fillStyle = "black"; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white"; ctx.textAlign="center";
        ctx.fillText("Gira el celular 🔄", canvas.width/2, canvas.height/2);
        requestAnimationFrame(main); return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let xF = -(scrollOffset * 0.5 % canvas.width);
    ctx.drawImage(assets.fondo, xF, 0, canvas.width, canvas.height);
    ctx.drawImage(assets.fondo, xF + canvas.width, 0, canvas.width, canvas.height);
    
    lit.actualizar(); 
    lit.dibujar();
    
    enemigos.forEach(en => {
        en.dibujar();
        let posX = en.x - scrollOffset;
        if (lit.x < posX + 50 && lit.x + 60 > posX && lit.y < en.y + 50 && lit.y + 60 > en.y) {
            if (!showIsRunning) gameIsOver = true;
        }
    });

    if (scrollOffset > 4000 && !showIsRunning) activarCinematica();
    if (!gameIsOver) requestAnimationFrame(main);
    else {
        ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white"; ctx.font = "24px Arial"; ctx.textAlign="center";
        ctx.fillText("¡CAÍSTE! RECARGA PARA INTENTARLO", canvas.width/2, canvas.height/2);
    }
}
