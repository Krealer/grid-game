import { createGame } from './js/game.js';

const game = createGame({
  canvas: document.getElementById('game'),
  scoreEl: document.getElementById('score'),
  livesEl: document.getElementById('lives'),
  statusEl: document.getElementById('status'),
  controls: document.querySelector('.controls')
});

game.start();
