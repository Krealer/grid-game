import { createPlayer } from './player.js';
import { createEnemies, stepEnemies } from './enemies.js';
import {
  CANVAS_SIZE,
  CELL_SIZE,
  DIRECTIONS,
  GRID_SIZE,
  randomCell,
  sameCell
} from './utils.js';

export function createGame({ canvas, scoreEl, livesEl, statusEl, controls }) {
  const ctx = canvas.getContext('2d');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  const state = {
    player: createPlayer(),
    enemies: createEnemies(),
    star: { x: 6, y: 6 },
    score: 0,
    lives: 3,
    gameOver: false,
    lastStepTime: 0,
    stepIntervalMs: 140,
    queuedDirection: null
  };

  function setStatus(message) {
    statusEl.textContent = message;
  }

  function syncHud() {
    scoreEl.textContent = String(state.score);
    livesEl.textContent = String(state.lives);
  }

  function queueDirection(directionKey) {
    if (DIRECTIONS[directionKey]) {
      state.queuedDirection = DIRECTIONS[directionKey];
    }
  }

  function bindInput() {
    const keyboardMap = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      s: 'down',
      a: 'left',
      d: 'right'
    };

    window.addEventListener('keydown', (event) => {
      const directionKey = keyboardMap[event.key];
      if (!directionKey) {
        return;
      }

      event.preventDefault();
      if (state.gameOver && event.key === 'Enter') {
        restart();
        return;
      }

      queueDirection(directionKey);
    });

    controls.querySelectorAll('[data-move]').forEach((button) => {
      button.addEventListener('pointerdown', () => {
        if (state.gameOver) {
          restart();
          return;
        }

        queueDirection(button.dataset.move);
      });
    });
  }

  function placeNewStar() {
    const blocked = [state.player, ...state.enemies];
    state.star = randomCell(blocked);
  }

  function update() {
    if (state.gameOver) {
      return;
    }

    if (state.queuedDirection) {
      state.player.move(state.queuedDirection);
      state.queuedDirection = null;
    }

    stepEnemies(state.enemies, state.player);

    if (sameCell(state.player, state.star)) {
      state.score += 10;
      setStatus('Nice! Star captured.');
      placeNewStar();
    }

    const hitEnemy = state.enemies.some((enemy) => sameCell(enemy, state.player));
    if (hitEnemy) {
      state.lives -= 1;
      state.player.x = 1;
      state.player.y = 1;
      setStatus('Hit! Repositioning player.');
    }

    if (state.lives <= 0) {
      state.gameOver = true;
      setStatus('Game over. Press Enter or any touch control to restart.');
    }

    syncHud();
  }

  function drawGrid() {
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i += 1) {
      const position = i * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(position, 0);
      ctx.lineTo(position, CANVAS_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, position);
      ctx.lineTo(CANVAS_SIZE, position);
      ctx.stroke();
    }
  }

  function drawEntity(entity, color, radius = 0.2) {
    const centerX = entity.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = entity.y * CELL_SIZE + CELL_SIZE / 2;
    const size = CELL_SIZE * (0.45 + radius);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(centerX - size / 2, centerY - size / 2, size, size, 6);
    ctx.fill();
  }

  function render() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawGrid();

    drawEntity(state.star, '#facc15', 0.05);
    drawEntity(state.player, '#22d3ee');
    state.enemies.forEach((enemy) => drawEntity(enemy, '#f43f5e'));
  }

  function loop(timestamp) {
    if (timestamp - state.lastStepTime >= state.stepIntervalMs) {
      update();
      state.lastStepTime = timestamp;
    }

    render();
    requestAnimationFrame(loop);
  }

  function restart() {
    state.player = createPlayer();
    state.enemies = createEnemies();
    state.score = 0;
    state.lives = 3;
    state.gameOver = false;
    state.lastStepTime = 0;
    state.queuedDirection = null;
    placeNewStar();
    setStatus('Fresh run. Collect stars, dodge red bots.');
    syncHud();
  }

  bindInput();
  syncHud();
  render();

  return {
    start() {
      requestAnimationFrame(loop);
    }
  };
}
