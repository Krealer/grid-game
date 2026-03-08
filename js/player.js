import { clampToGrid } from './utils.js';

export function createPlayer() {
  return {
    x: 1,
    y: 1,
    move(direction) {
      this.x = clampToGrid(this.x + direction.x);
      this.y = clampToGrid(this.y + direction.y);
    }
  };
}
