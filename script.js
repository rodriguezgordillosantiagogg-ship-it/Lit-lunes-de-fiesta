const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const videoFinal = document.getElementById('videoFinal');
const audioFinal = document.getElementById('audioFinal');

// Ajuste real al tamaño de la ventana
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();

ctx.imageSmoothingEnabled = false;

// Configuración estilo Mario
const GRAVEDAD = 0.8;
const Y_PISO = canvas.height - 100;

const assets = {
    lit: new Image(), canto: new Image(), fondo: new Image()
};
assets.lit.src = 'lit_killah_master.png';
assets.canto.src = 'lit_cantando_flow.png';
assets.fondo.src = 'fondo_ciudad_fiesta.jpg';

let scrollOffset = 0;
let litX = 100;
let litY = Y_PISO - 120;
let litDy = 0;
let showInCourse = false;
const teclas = { derecha: false };

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. DIBUJAR FONDO (Si no carga, se verá negro pero el juego seguirá)
    if (assets.fondo.complete) {
        let xF = -(scrollOffset * 0.3 % canvas.width);
        ctx.drawImage(assets.fondo, xF, 0, canvas.width, canvas.height);
        ctx.drawImage(assets.fondo, xF + canvas.width, 0, canvas.width, canvas.height);
    }

    // 2. DIBUJAR PISO DE BLOQUES (Siempre visible)
    ctx.fillStyle = "#8b4513"; // Marrón Mario
    ctx.fillRect(0, Y_PISO, canvas.width, 100);
    ctx.fillStyle = "#ffaa00"; // Borde brillante
    ctx.fillRect(0, Y_PISO, canvas.width, 6);

    // 3. LÓGICA DE MOVIMIENTO
    if (!showInCourse) {
        litY += litDy;
        if (litY + 120 < Y_PISO) litDy += GRAVEDAD;
        else { litDy = 0; litY = Y_PISO - 120; }

        if (teclas.derecha) {
            if (litX < 400) litX += 6;
            else scrollOffset += 6;
        }
    }

    // 4. DIBUJAR A LIT (Si la imagen no carga, dibuja un cuadro para que sepas dónde está)
    if (assets.lit.complete && !showInCourse) {
        let fila = teclas.derecha ? 1 : 0;
        let sw = assets.lit.width / 4;
        let sh = assets.lit.height / 2;
        let frame = Math.floor(Date.now() / 130) % 4;
        ctx.drawImage(assets.lit, frame * sw, fila * sh, sw, sh, litX, litY, 120, 120);
    } else if (showInCourse && assets.canto.complete) {
        let sw = assets.canto.width / 4;
        let frame = Math.floor(Date.now() / 250) % 4;
        ctx.drawImage(assets.canto, frame * sw, 0, sw, assets.canto.height, litX, litY, 120, 120);
    } else {
        // MODO DE EMERGENCIA: Cuadro rojo si no hay imagen
        ctx.fillStyle = "red";
        ctx.fillRect(litX, litY, 50, 120);
    }

    // META (Bandera)
    let metaX = 4000 - scrollOffset;
    ctx.fillStyle = "white"; ctx.fillRect(metaX, Y_PISO - 200, 5, 200);
    ctx.fillStyle = "red"; ctx.fillRect(metaX + 5, Y_PISO - 200, 40, 30);

    if (scrollOffset > 3950 && !showInCourse) {
        showInCourse = true;
        document.getElementById('videoContainer').style.display = "block";
        videoFinal.play();
        videoFinal.onended = () => {
            document.getElementById('videoContainer').style.display = "none";
            audioFinal.play();
        };
    }

    requestAnimationFrame(draw);
}

// Eventos de teclado
window.onkeydown = (e) => {
    if (e.code === 'ArrowRight') teclas.derecha = true;
    if (e.code === 'Space' && litY >= Y_PISO - 121) litDy = -16;
};
window.onkeyup = (e) => { if (e.code === 'ArrowRight') teclas.derecha = false; };

// Iniciar el bucle
draw();
