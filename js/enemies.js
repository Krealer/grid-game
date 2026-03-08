import { clampToGrid } from './utils.js';

export function createEnemies() {
  return [
    { x: 10, y: 10 },
    { x: 10, y: 1 }
  ];
}

// Enemy AI movement toward player
// Normalized vector movement on grid axis
export function stepEnemies(enemies, player) {
  enemies.forEach((enemy) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      enemy.x = clampToGrid(enemy.x + Math.sign(dx));
    } else {
      enemy.y = clampToGrid(enemy.y + Math.sign(dy));
    }
  });
}
