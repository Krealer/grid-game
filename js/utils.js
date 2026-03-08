export const GRID_SIZE = 12;
export const CELL_SIZE = 30;
export const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export function randomCell(excluded = []) {
  const blocked = new Set(excluded.map((entity) => `${entity.x},${entity.y}`));

  while (true) {
    const cell = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };

    if (!blocked.has(`${cell.x},${cell.y}`)) {
      return cell;
    }
  }
}

export function sameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function clampToGrid(value) {
  return Math.min(GRID_SIZE - 1, Math.max(0, value));
}
