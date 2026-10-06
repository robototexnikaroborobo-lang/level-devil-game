const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const keys = {};

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys[key] = true;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key) || key === ' ') {
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  keys[key] = false;
});

const levels = [
  {
    name: 'Warm-Up Trap',
    start: { x: 40, y: 430 },
    platforms: [
      { x: 0, y: 500, w: 240, h: 40 },
      { x: 315, y: 455, w: 170, h: 18 },
      { x: 520, y: 420, w: 120, h: 18 },
      { x: 665, y: 385, w: 140, h: 18, disappearOnTouch: true },
      { x: 820, y: 500, w: 180, h: 40 },
      { x: 1020, y: 455, w: 150, h: 18 },
      { x: 1200, y: 500, w: 220, h: 40 }
    ],
    spikes: [
      { x: 240, y: 500, w: 60, h: 20 },
      { x: 485, y: 500, w: 30, h: 20 },
      { x: 640, y: 500, w: 25, h: 20 }
    ],
    doors: [
      { x: 1360, y: 420, w: 48, h: 80, fake: false },
      { x: 830, y: 420, w: 48, h: 80, fake: true }
    ],
    message: 'The obvious door is a trap.'
  },
  {
    name: 'Falling Floor',
    start: { x: 40, y: 430 },
    platforms: [
      { x: 0, y: 500, w: 260, h: 40 },
      { x: 315, y: 470, w: 180, h: 18 },
      { x: 530, y: 430, w: 110, h: 18, disappearOnTouch: true },
      { x: 670, y: 390, w: 120, h: 18 },
      { x: 860, y: 450, w: 140, h: 18, disappearOnTouch: true },
      { x: 1030, y: 500, w: 160, h: 40 },
      { x: 1240, y: 500, w: 220, h: 40 }
    ],
    spikes: [
      { x: 260, y: 500, w: 45, h: 20 },
      { x: 495, y: 500, w: 26, h: 20 },
      { x: 640, y: 500, w: 20, h: 20 },
      { x: 790, y: 500, w: 50, h: 20 },
      { x: 1170, y: 500, w: 50, h: 20 }
    ],
    doors: [
      { x: 1388, y: 420, w: 48, h: 80, fake: false },
      { x: 1005, y: 420, w: 48, h: 80, fake: true }
    ],
    message: 'Some floors vanish when you trust them.'
  },
  {
    name: 'Mirror Madness',
    start: { x: 42, y: 430 },
    platforms: [
      { x: 0, y: 500, w: 220, h: 40 },
      { x: 280, y: 440, w: 180, h: 18 },
      { x: 500, y: 390, w: 150, h: 18 },
      { x: 700, y: 330, w: 90, h: 18 },
      { x: 820, y: 440, w: 150, h: 18 },
      { x: 1010, y: 500, w: 210, h: 40 },
      { x: 1260, y: 500, w: 220, h: 40 }
    ],
    spikes: [
      { x: 220, y: 500, w: 40, h: 20 },
      { x: 460, y: 500, w: 35, h: 20 },
      { x: 650, y: 500, w: 30, h: 20 },
      { x: 790, y: 500, w: 30, h: 20 },
      { x: 970, y: 500, w: 30, h: 20 },
      { x: 1220, y: 500, w: 30, h: 20 }
    ],
    doors: [
      { x: 1420, y: 420, w: 48, h: 80, fake: false },
      { x: 1010, y: 420, w: 48, h: 80, fake: true }
    ],
    message: 'The controls switch when you least expect it.'
  },
  {
    name: 'Final Door',
    start: { x: 40, y: 430 },
    platforms: [
      { x: 0, y: 500, w: 240, h: 40 },
      { x: 330, y: 445, w: 140, h: 18 },
      { x: 520, y: 400, w: 100, h: 18, disappearOnTouch: true },
      { x: 680, y: 355, w: 90, h: 18 },
      { x: 820, y: 430, w: 100, h: 18, disappearOnTouch: true },
      { x: 980, y: 500, w: 140, h: 40 },
      { x: 1180, y: 460, w: 120, h: 18 },
      { x: 1360, y: 500, w: 220, h: 40 }
    ],
    spikes: [
      { x: 240, y: 500, w: 55, h: 20 },
      { x: 470, y: 500, w: 22, h: 20 },
      { x: 620, y: 500, w: 26, h: 20 },
      { x: 770, y: 500, w: 25, h: 20 },
      { x: 920, y: 500, w: 26, h: 20 },
      { x: 1120, y: 500, w: 26, h: 20 }
    ],
    doors: [
      { x: 1465, y: 420, w: 48, h: 80, fake: false },
      { x: 1185, y: 420, w: 48, h: 80, fake: true },
      { x: 820, y: 320, w: 46, h: 80, fake: true }
    ],
    message: 'The devil keeps moving the goal.'
  }
];

let currentLevelIndex = 0;
let player;
let gameOver = false;
let levelMessage = '';
let levelStartFlash = 0;

function cloneLevelState(level) {
  return JSON.parse(JSON.stringify(level));
}

function loadLevel(index) {
  currentLevelIndex = index;
  const level = levels[index];
  levelStartFlash = 1;
  levelMessage = level.message;
  statusEl.textContent = `Level ${index + 1}: ${level.name}`;

  const start = level.start;
  player = {
    x: start.x,
    y: start.y,
    w: 30,
    h: 42,
    vx: 0,
    vy: 0,
    onGround: false,
    speed: 4.5,
    jumpForce: 13.5,
    gravity: 0.72,
    direction: 1,
    controlsFlipped: false,
    flipTimer: 0,
    color: '#fdd84d'
  };

  gameOver = false;
  for (const p of level.platforms) {
    p.triggered = false;
  }
}

function resetLevel() {
  loadLevel(currentLevelIndex);
}

function getActivePlatforms() {
  const level = levels[currentLevelIndex];
  return level.platforms.filter((platform) => !(platform.disappearOnTouch && platform.triggered));
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function hitSpike() {
  const level = levels[currentLevelIndex];
  for (const spike of level.spikes) {
    if (intersects(player, spike)) {
      return true;
    }
  }
  return false;
}

function touchFakeDoor() {
  const doors = levels[currentLevelIndex].doors;
  for (const door of doors) {
    if (door.fake && intersects(player, door)) {
      return door;
    }
  }
  return null;
}

function touchGoalDoor() {
  const doors = levels[currentLevelIndex].doors;
  for (const door of doors) {
    if (!door.fake && intersects(player, door)) {
      return door;
    }
  }
  return null;
}

function endLevel() {
  if (currentLevelIndex < levels.length - 1) {
    setTimeout(() => {
      loadLevel(currentLevelIndex + 1);
    }, 350);
  } else {
    statusEl.textContent = 'You escaped the devil!';
    setTimeout(() => {
      loadLevel(0);
    }, 1200);
  }
}

function die() {
  if (gameOver) return;
  gameOver = true;
  setTimeout(() => {
    resetLevel();
  }, 280);
}

function update() {
  const level = levels[currentLevelIndex];
  const moveDir = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);

  if (keys.r) {
    resetLevel();
  }

  if (gameOver) {
    return;
  }

  let activeMove = moveDir;
  if (player.controlsFlipped) {
    activeMove *= -1;
  }

  if (activeMove !== 0) {
    player.vx = activeMove * player.speed;
    player.direction = activeMove;
  } else {
    player.vx = 0;
  }

  const jumpPressed = keys.w || keys.arrowup || keys[' '];
  if (jumpPressed && player.onGround) {
    player.vy = -player.jumpForce;
    player.onGround = false;
  }

  if (player.flipTimer > 0) {
    player.flipTimer -= 1;
  } else {
    player.controlsFlipped = false;
  }

  player.vy += player.gravity;
  player.x += player.vx;

  for (const platform of getActivePlatforms()) {
    if (intersects(player, platform)) {
      if (player.vx > 0) {
        player.x = platform.x - player.w;
      } else if (player.vx < 0) {
        player.x = platform.x + platform.w;
      }
    }
  }

  player.y += player.vy;
  player.onGround = false;

  for (const platform of getActivePlatforms()) {
    if (intersects(player, platform)) {
      if (player.vy > 0) {
        player.y = platform.y - player.h;
        player.vy = 0;
        player.onGround = true;
      } else if (player.vy < 0) {
        player.y = platform.y + platform.h;
        player.vy = 0;
      }

      if (platform.disappearOnTouch && !platform.triggered) {
        platform.triggered = true;
      }
    }
  }

  if (player.y > canvas.height + 100) {
    die();
  }

  if (player.x < 0) {
    player.x = 0;
  }

  if (player.x + player.w > 1600) {
    player.x = 1600 - player.w;
  }

  if (player.x > 540 && currentLevelIndex === 2) {
    player.controlsFlipped = true;
    player.flipTimer = 60;
  }

  const fakeDoor = touchFakeDoor();
  if (fakeDoor) {
    die();
  }

  if (touchGoalDoor()) {
    endLevel();
  }

  if (hitSpike()) {
    die();
  }

  if (currentLevelIndex === 0 && player.x > 650) {
    const trapPlatform = level.platforms.find((p) => p.x === 665 && p.y === 385);
    if (trapPlatform) {
      trapPlatform.triggered = true;
    }
  }

  if (currentLevelIndex === 1 && player.x > 650) {
    const trapPlatform = level.platforms.find((p) => p.x === 860 && p.y === 450);
    if (trapPlatform) {
      trapPlatform.triggered = true;
    }
  }

  if (currentLevelIndex === 3 && player.x > 900) {
    const trapPlatform = level.platforms.find((p) => p.x === 820 && p.y === 430);
    if (trapPlatform) {
      trapPlatform.triggered = true;
    }
  }
};

function drawBackground() {
  ctx.fillStyle = '#101722';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#1f1836');
  gradient.addColorStop(1, '#0d101a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.fillRect(x, 0, 1, canvas.height);
  }
}

function drawPlatforms() {
  const level = levels[currentLevelIndex];
  for (const platform of getActivePlatforms()) {
    ctx.fillStyle = '#5d6b8a';
    ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
    ctx.fillStyle = '#7f8db3';
    ctx.fillRect(platform.x + 4, platform.y + 4, platform.w - 8, platform.h - 8);
  }

  for (const door of level.doors) {
    const isFake = door.fake;
    ctx.fillStyle = isFake ? '#ff5b5b' : '#5ae27d';
    ctx.fillRect(door.x, door.y, door.w, door.h);
    ctx.fillStyle = '#e8f1ff';
    ctx.fillRect(door.x + 12, door.y + 12, door.w - 24, door.h - 24);
  }
}

function drawSpikes() {
  const level = levels[currentLevelIndex];
  for (const spike of level.spikes) {
    ctx.fillStyle = '#d53d3d';
    const triCount = Math.max(3, Math.floor(spike.w / 8));
    const step = spike.w / triCount;
    for (let i = 0; i < triCount; i++) {
      const x = spike.x + i * step;
      ctx.beginPath();
      ctx.moveTo(x, spike.y + spike.h);
      ctx.lineTo(x + step / 2, spike.y);
      ctx.lineTo(x + step, spike.y + spike.h);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = '#291f18';
  const eyeX = player.x + (player.direction > 0 ? 20 : 10);
  ctx.fillRect(eyeX, player.y + 10, 4, 4);
  ctx.fillRect(player.x + (player.direction > 0 ? 6 : 20), player.y + 10, 4, 4);
}

function drawMessage() {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(20, 18, 360, 30);

  ctx.fillStyle = '#f5e8a6';
  ctx.font = '16px Arial';
  ctx.fillText(levels[currentLevelIndex].message, 32, 40);
}

function draw() {
  drawBackground();
  drawPlatforms();
  drawSpikes();
  drawPlayer();
  drawMessage();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadLevel(0);
loop();
