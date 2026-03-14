const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const audioFinal = document.getElementById('audioFinal');
const videoFinal = document.getElementById('videoFinal');
const videoContainer = document.getElementById('videoContainer');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const Y_PISO = canvas.height - 80;

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

class Sprite {
    constructor(img, cantFramesHorizontal, cantFilas) {
        this.img = img;
        this.cantFrames = cantFramesHorizontal;
        this.cantFilas = cantFilas;
        this.frameActual = 0;
        this.filaActual = 0;
        this.timer = Date.now();
    }

    dibujar(x, y, anchoDestino, altoDestino, esLit = false) {
        // Calculamos cuánto mide CADA frame dividiendo el total de la imagen
        const anchoFrame = this.img.width / this.cantFrames;
        const altoFrame = this.img.height / this.cantFilas;

        // Si Lit se mueve, usamos la fila 2 (índice 1). Si está quieto, la fila 1 (índice 0).
        if (esLit) {
            this.filaActual = (teclas.derecha.presionada || teclas.izquierda.presionada) ? 1 : 0;
            // Ajuste de frames: caminando suele tener 4, quieto 2.
            let maxF = (this.filaActual === 1) ? 4 : 2;
            if (Date.now() - this.timer > 120) {
                this.frameActual = (this.frameActual + 1) % maxF;
                this.timer = Date.now();
            }
        } else {
            // Animación para enemigos
            if (Date.now() - this.timer > 150) {
                this.frameActual = (this.frameActual + 1) % this.cantFrames;
                this.timer = Date.now();
            }
        }

        ctx.drawImage(
            this.img,
            this.frameActual * anchoFrame, this.filaActual * altoFrame, // Dónde empieza el recorte
            anchoFrame, altoFrame,                                     // Tamaño del recorte
            x, y,                                                      // Dónde se dibuja
            anchoDestino, altoDestino                                  // Tamaño en pantalla
        );
    }
}

// Creamos los objetos de animación pasándole (Imagen, Cuántos dibujos a lo ancho, Cuántos a lo largo)
const animLit = new Sprite(assets.lit, 4, 2); 
const animCanto = new Sprite(assets.canto, 4, 1);
const animBafle = new Sprite(assets.bafle, 4, 1);
const animGorra = new Sprite(assets.gorra, 3, 1);
const animMicro = new Sprite(assets.micro, 3, 1);

let litX = 100;
let litY = Y_PISO - 120;
let litDy = 0;

function main() {
    if (window.innerHeight > window.innerWidth) { requestAnimationFrame(main); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar Fondo
    let xF = -(scrollOffset * 0.5 % canvas.width);
    ctx.drawImage(assets.fondo, xF, 0, canvas.width, canvas.height);
    ctx.drawImage(assets.fondo, xF + canvas.width, 0, canvas.width, canvas.height);

    // Lógica de Lit
    if (!showIsRunning || cinematicPlayed) {
        litY += litDy;
        if (litY + 120 < Y_PISO) litDy += 0.8;
        else { litDy = 0; litY = Y_PISO - 120; }

        if (teclas.derecha.presionada && litX < 400) litX += 6;
        else if (teclas.izquierda.presionada && litX > 50) litX -= 6;
        else if (teclas.derecha.presionada) scrollOffset += 6;
    }

    // Dibujar Lit (AQUÍ ES DONDE SALE SÍ O SÍ)
    let imgActual = (showIsRunning && cinematicPlayed) ? animCanto : animLit;
    imgActual.dibujar(litX, litY, 120, 120, true);

    // Dibujar Enemigos
    const posicionesEnemigos = [
        { x: 1200, y: Y_PISO - 80, anim: animBafle },
        { x: 2200, y: Y_PISO - 100, anim: animGorra },
        { x: 3000, y: Y_PISO - 80, anim: animMicro }
    ];

    posicionesEnemigos.forEach(en => {
        let posX = en.x - scrollOffset;
        en.anim.dibujar(posX, en.y, 80, 80);

        // Colisión
        if (litX < posX + 50 && litX + 60 > posX && litY < en.y + 50 && litY + 60 > en.y) {
            if (!showIsRunning) gameIsOver = true;
        }
    });

    if (scrollOffset > 5000 && !showIsRunning) activarCinematica();

    if (!gameIsOver) requestAnimationFrame(main);
    else {
        ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white"; ctx.textAlign="center";
        ctx.fillText("¡CHOCASTE! RECARGA", canvas.width/2, canvas.height/2);
    }
}

// --- EVENTOS ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') teclas.derecha.presionada = true;
    if (e.code === 'ArrowLeft') teclas.izquierda.presionada = true;
    if (e.code === 'Space' && litY >= Y_PISO - 121) litDy = -16;
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') teclas.derecha.presionada = false;
    if (e.code === 'ArrowLeft') teclas.izquierda.presionada = false;
});

function activarCinematica() {
    showIsRunning = true;
    videoContainer.style.display = 'block';
    videoFinal.play();
    videoFinal.onended = () => { videoContainer.style.display = 'none'; cinematicPlayed = true; audioFinal.play(); };
}
