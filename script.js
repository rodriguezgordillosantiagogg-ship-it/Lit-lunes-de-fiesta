const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const videoFinal = document.getElementById('videoFinal');
const audioFinal = document.getElementById('audioFinal');
const videoContainer = document.getElementById('videoContainer');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.imageSmoothingEnabled = false;

const Y_PISO = canvas.height - 100;

// 1. CARGA DE ARCHIVOS
const assets = {
    lit: new Image(), canto: new Image(), fondo: new Image(), bafle: new Image()
};
assets.lit.src = 'lit_killah_master.png';
assets.canto.src = 'lit_cantando_flow.png';
assets.fondo.src = 'fondo_ciudad_fiesta.jpg';
assets.bafle.src = 'bafle_anim.png';

// 2. ESTADO DEL JUEGO
let scrollOffset = 0;
let litX = 100;
let litY = Y_PISO - 120;
let litDy = 0;
let showInCourse = false;
let gameIsOver = false;
const teclas = { derecha: false };

// 3. DEFINICIÓN DE ENEMIGOS (Aquí los hacemos fijos para que no desaparezcan)
const enemigos = [
    { x: 800, y: Y_PISO - 80 },
    { x: 1600, y: Y_PISO - 80 },
    { x: 2500, y: Y_PISO - 80 },
    { x: 3500, y: Y_PISO - 80 }
];

function draw() {
    if (gameIsOver) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("¡CHOQUE! RECARGA PARA INTENTARLO", canvas.width/2 - 250, canvas.height/2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // DIBUJAR FONDO
    if (assets.fondo.complete) {
        let xF = -(scrollOffset * 0.3 % canvas.width);
        ctx.drawImage(assets.fondo, xF, 0, canvas.width, canvas.height);
        ctx.drawImage(assets.fondo, xF + canvas.width, 0, canvas.width, canvas.height);
    }

    // DIBUJAR PISO (Color sólido para que nunca desaparezca)
    ctx.fillStyle = "#8b4513"; 
    ctx.fillRect(0, Y_PISO, canvas.width, 100);
    ctx.fillStyle = "#ffaa00";
    ctx.fillRect(0, Y_PISO, canvas.width, 6);

    // LÓGICA DE MOVIMIENTO Y GRAVEDAD
    if (!showInCourse) {
        litY += litDy;
        if (litY + 120 < Y_PISO) litDy += 0.8;
        else { litDy = 0; litY = Y_PISO - 120; }

        if (teclas.derecha) {
            if (litX < 400) litX += 6;
            else scrollOffset += 6;
        }
    }

    // DIBUJAR ENEMIGOS Y DETECTAR COLISIÓN
    enemigos.forEach(en => {
        let screenX = en.x - scrollOffset;
        if (screenX > -100 && screenX < canvas.width) {
            if (assets.bafle.complete) {
                let frameB = Math.floor(Date.now() / 150) % 4;
                ctx.drawImage(assets.bafle, frameB * (assets.bafle.width/4), 0, assets.bafle.width/4, assets.bafle.height, screenX, en.y, 80, 80);
            }
            
            // COLISIÓN MATEMÁTICA (Sin errores)
            if (!showInCourse && litX < screenX + 50 && litX + 60 > screenX && litY + 100 > en.y) {
                gameIsOver = true;
            }
        }
    });

    // DIBUJAR A LIT (Sincronizado para evitar parpadeo)
    let spriteActual = showInCourse ? assets.canto : assets.lit;
    if (spriteActual.complete) {
        let fila = (teclas.derecha && !showInCourse) ? 1 : 0;
        let numFrames = 4;
        let sw = spriteActual.width / numFrames;
        let sh = showInCourse ? spriteActual.height : spriteActual.height / 2;
        let frame = Math.floor(Date.now() / (showInCourse ? 250 : 130)) % numFrames;
        
        ctx.drawImage(spriteActual, frame * sw, fila * sh, sw, sh, litX, litY, 120, 120);
    }

    // META Y ACTIVACIÓN DE VIDEO/AUDIO
    let metaX = 5000 - scrollOffset;
    ctx.fillStyle = "white"; ctx.fillRect(metaX, Y_PISO - 300, 5, 300); // Mástil
    ctx.fillStyle = "red"; ctx.fillRect(metaX + 5, Y_PISO - 300, 50, 40); // Bandera

    if (scrollOffset > 4900 && !showInCourse) {
        showInCourse = true;
        teclas.derecha = false;
        videoContainer.style.display = "block";
        videoFinal.play().catch(e => console.log("Esperando interacción..."));
        
        videoFinal.onended = () => {
            videoContainer.style.display = "none";
            audioFinal.play();
        };
    }

    requestAnimationFrame(draw);
}

// EVENTOS
window.onkeydown = (e) => {
    if (e.code === 'ArrowRight') teclas.derecha = true;
    if (e.code === 'Space' && litY >= Y_PISO - 121 && !showInCourse) litDy = -16;
};
window.onkeyup = (e) => { if (e.code === 'ArrowRight') teclas.derecha = false; };

// INICIO
draw();
