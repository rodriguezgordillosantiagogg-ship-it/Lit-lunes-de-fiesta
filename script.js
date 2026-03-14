const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const videoFinal = document.getElementById('videoFinal')
const audioFinal = document.getElementById('audioFinal')
const videoContainer = document.getElementById('videoContainer')

canvas.width = window.innerWidth
canvas.height = window.innerHeight
ctx.imageSmoothingEnabled = false

// --- CONSTANTES ESTILO MARIO ---
const GRAVITY = 0.8
const JUMP_FORCE = -16
const WALK_SPEED = 6
const GROUND_Y = canvas.height - 80

// --- ASSETS ---
const assets = {
  lit: new Image(),
  canto: new Image(),
  fondo: new Image(),
  bafle: new Image()
}
assets.lit.src = 'lit_killah_master.png'
assets.canto.src = 'lit_cantando_flow.png'
assets.fondo.src = 'fondo_ciudad_fiesta.jpg'
assets.bafle.src = 'bafle_anim.png'

// --- ESTADO DEL JUGADOR ---
const lit = {
  x: 100,
  y: GROUND_Y - 120,
  dy: 0,
  width: 120,
  height: 120,
  frame: 0,
  timer: 0,
  isJumping: false
}

let scrollOffset = 0
let isShowRunning = false
let gameFinished = false
const keys = { right: false }

// --- LÓGICA DE DIBUJO ---

function drawBackground() {
  // Fondo con efecto Parallax (se mueve más lento que el suelo)
  let bgX = -(scrollOffset * 0.3 % canvas.width)
  ctx.drawImage(assets.fondo, bgX, 0, canvas.width, canvas.height)
  ctx.drawImage(assets.fondo, bgX + canvas.width, 0, canvas.width, canvas.height)
}

function drawFloor() {
  // Dibujamos el suelo de bloques estilo NES
  ctx.fillStyle = '#8b4513' // Marrón tierra
  ctx.fillRect(0, GROUND_Y, canvas.width, 80)
  
  // Línea superior de los bloques
  ctx.fillStyle = '#ffaa00'
  ctx.fillRect(0, GROUND_Y, canvas.width, 6)
}

function drawPlayer() {
  const currentAsset = isShowRunning ? assets.canto : assets.lit
  
  // Midu usa: width / frames. Asumimos 4 frames por fila.
  const spriteW = currentAsset.width / 4
  const spriteH = currentAsset.height / (isShowRunning ? 1 : 2)

  if (Date.now() - lit.timer > (isShowRunning ? 250 : 130)) {
    lit.frame = (lit.frame + 1) % 4
    lit.timer = Date.now()
  }

  // Si camina, usa fila 1. Si está quieto, fila 0.
  const row = (keys.right && !isShowRunning) ? 1 : 0

  ctx.drawImage(
    currentAsset,
    lit.frame * spriteW, row * spriteH, spriteW, spriteH,
    lit.x, lit.y, lit.width, lit.height
  )
}

function drawFlag() {
  const flagX = 5000 - scrollOffset
  // Mástil
  ctx.fillStyle = 'white'
  ctx.fillRect(flagX + 40, GROUND_Y - 300, 8, 300)
  // Bandera roja
  ctx.fillStyle = 'red'
  ctx.fillRect(flag
