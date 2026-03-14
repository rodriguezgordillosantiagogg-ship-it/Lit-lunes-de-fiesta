const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Forzamos el tamaño del canvas al iniciar
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- CONFIGURACIÓN ESTÁTICA ---
const config = {
    gravedad: 0.8,
    sueloY: canvas.height - 100,
    velocidad: 6,
    salto: -16
};

// --- ESTADO DEL JUEGO ---
let game = {
    x: 100,
    y: config.sueloY - 120,
    dy: 0,
    scroll: 0,
    frames: 0,
    lastUpdate: 0,
    running: true
};

const teclas = { derecha: false };

// --- CARGA SEGURA DE IMÁGENES ---
const img = {
    lit: new Image(),
    fondo: new Image(),
    bafle: new Image()
};

// Asignamos rutas (Asegúrate que los nombres coincidan en tu carpeta)
img.lit.src = 'lit_killah_master.png';
img.fondo.src = 'fondo_ciudad_fiesta.jpg';
img.bafle.src = 'bafle_anim.png';

// --- MOTOR DE DIBUJO (Sin parpadeo) ---
function render(now) {
    if (!game.running) return;

    // Control de tiempo para que no parpadee
    const dt = now - game.lastUpdate;
    game.lastUpdate = now;

    // 1. Limpiar pantalla
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Dibujar Fondo (Parallax)
    if (img.fondo.complete) {
        let fx = -(game.scroll * 0.3 % canvas.width);
        ctx.drawImage(img.fondo, fx, 0, canvas.width, canvas.height);
        ctx.drawImage(img.fondo, fx + canvas.width, 0, canvas.width, canvas.height);
    }

    // 3. Dibujar Suelo Sólido
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(0, config.sueloY, canvas.width, 100);
    ctx.fillStyle = "#ffaa00";
    ctx.fillRect(0, config.sueloY, canvas.width, 5);

    // 4. Lógica de Física
    game.y += game.dy;
    if (game.y + 120 < config.sueloY) {
        game.dy += config.gravedad;
    } else {
        game.dy = 0;
        game.y = config.sueloY - 120;
    }

    if (teclas.derecha) {
        if (game.x < 400) game.x += config.velocidad;
        else game.scroll += config.velocidad;
    }

    // 5. Dibujar a Lit con Recorte Preciso
    if (img.lit.complete) {
        let fila = teclas.derecha ? 1 : 0;
        let sw = img.lit.width / 4;
        let sh = img.lit.height / 2;
        let anim = Math.floor(now / 100) % 4; // Animación basada en tiempo real
        
        ctx.drawImage(img.lit, anim * sw, fila * sh, sw, sh, game.x, game.y, 120, 120);
    } else {
        // Marcador de posición por si la imagen falla
        ctx.fillStyle = "red";
        ctx.fillRect(game.x, game.y, 60, 120);
    }

    // 6. Dibujar Meta (Bandera)
    let metaX = 4000 - game.scroll;
    ctx.fillStyle = "white";
    ctx.fillRect(metaX, config.sueloY - 250, 5, 250);
    ctx.fillStyle = "red";
    ctx.fillRect(metaX + 5, config.sueloY - 250, 40, 30);

    requestAnimationFrame(render);
}

// --- CONTROLES ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') teclas.derecha = true;
    if (e.code === 'Space' && game.dy === 0) game.dy = config.salto;
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') teclas.derecha = false;
});

// Arrancamos el motor
requestAnimationFrame(render);
