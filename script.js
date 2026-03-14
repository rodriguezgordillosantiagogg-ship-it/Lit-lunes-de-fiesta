const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const audioFinal = document.getElementById('audioFinal');
const videoFinal = document.getElementById('videoFinal');
const videoContainer = document.getElementById('videoContainer');

// Configuración de pantalla
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.imageSmoothingEnabled = false;

const Y_PISO = canvas.height - 100; // Altura del suelo

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

// Rutas de tus archivos
assets.lit.src = 'lit_killah_master.png';
assets.canto.src = 'lit_cantando_flow.png';
assets.fondo.src = 'fondo_ciudad_fiesta.jpg';
assets.bafle.src = 'bafle_anim.png';
assets.micro.src = 'micro_anim.png';
assets.gorra.src = 'enemigo_gorra.png';

Object.values(assets).forEach(img => img.onload = checkCarga);

// Estado del juego
let scrollOffset = 0;
let gameIsOver = false;
let showIsRunning = false;
let cinematicPlayed = false;
let litX = 100;
let litY = Y_PISO - 120;
let litDy = 0;
const teclas = { derecha: false };

// --- Clase de Animación ---
class Animador {
    constructor(img, fX, fY) {
        this.img = img;
        this.fX = fX;
        this.fY = fY;
        this.frame = 0;
        this.timer = Date.now();
    }
    dibujar(x, y, w, h, fila = 0, speed = 150) {
        const sw = this.img.width / this.fX;
        const sh = this.img.height / this.fY;
        if (Date.now() - this.timer > speed) {
            this.frame = (this.frame + 1) % this.fX;
            this.timer = Date.now();
        }
        ctx.drawImage(this.img, this.frame * sw, fila * sh, sw, sh, x, y, w, h);
    }
}

const animLit = new Animador(assets.lit, 4, 2);
const animCanto = new Animador(assets.canto, 4, 1);
const animBafle = new Animador(assets.bafle, 4, 1);

function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. DIBUJAR FONDO
    let xF = -(scrollOffset * 0.5 % canvas.width);
    ctx.drawImage(assets.fondo, xF, 0, canvas.width, canvas.height);
    ctx.drawImage(assets.fondo, xF + canvas.width, 0, canvas.width, canvas.height);

    // 2. DIBUJAR PISO (Color Gris Asfalto)
    ctx.fillStyle = "#222"; 
    ctx.fillRect(0, Y_PISO, canvas.width, 100);
    // Línea de borde del piso para que se note
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 5;
    ctx.strokeRect(0, Y_PISO, canvas.width, 1);

    // 3. LÓGICA DE MOVIMIENTO
    if (!showIsRunning) {
        litY += litDy;
        if (litY + 120 < Y_PISO) litDy += 0.8;
        else { litDy = 0; litY = Y_PISO - 120; }

        if (teclas.derecha) {
            if (litX < 400) litX += 6;
            else scrollOffset += 6;
        }
    }

    // 4. DIBUJAR PERSONAJE
    if (showIsRunning) {
        animCanto.dibujar(litX, litY, 120, 120, 0, 250);
    } else {
        let filaActual = (teclas.derecha) ? 1 : 0;
        animLit.dibujar(litX, litY, 120, 120, filaActual, 130);
    }

    // 5. ENEMIGOS (BAFLES)
    let bafleX = 1200 - scrollOffset;
    if (bafleX > -100 && bafleX < canvas.width) {
        animBafle.dibujar(bafleX, Y_PISO - 80, 80, 80);
        if (litX < bafleX + 50 && litX + 60 > bafleX && litY > Y_PISO - 150) {
            if (!showIsRunning) gameIsOver = true;
        }
    }

    // Activar final
    if (scrollOffset > 5000 && !showIsRunning) activarCinematica();

    if (!gameIsOver) requestAnimationFrame(main);
    else {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("GAME OVER - RECARGA", canvas.width/2 - 150, canvas.height/2);
    }
}

// --- EVENTOS ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') teclas.derecha = true;
    if (e.code === 'Space' && litY >= Y_PISO - 121 && !showIsRunning) litDy = -16;
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') teclas.derecha = false;
});

function activarCinematica() {
    showIsRunning = true;
    teclas.derecha = false;
    videoContainer.style.display = 'block';
    videoFinal.play();
    videoFinal.onended = () => {
        videoContainer.style.display = 'none';
        cinematicPlayed = true;
        audioFinal.play();
    };
}
