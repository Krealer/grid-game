// Helper to check if a position is within grid bounds
function isInBounds(grid, x, y) {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length;
}

// Helper to check if a tile is walkable (not a wall)
function isWalkable(grid, x, y) {
  const tile = grid[y][x];
  const type = typeof tile === 'string' ? tile : tile.type;

  return ['floor', 'enemy'].includes(type); // or just 'floor' if enemy is non-walkable
}




// Breadth-First Search for shortest path
export function findPath(grid, start, end) {
  const queue = [];
  const visited = new Set();
  const parentMap = new Map(); // To reconstruct path

  const key = (pos) => `${pos.x},${pos.y}`;

  queue.push(start);
  visited.add(key(start));

  while (queue.length > 0) {
    const current = queue.shift();

    // Reached destination
    if (current.x === end.x && current.y === end.y) {
      return reconstructPath(parentMap, start, end);
    }

    // Check all 4 directions
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }, // left
      { x: 1, y: 0 },  // right
    ];

    for (const dir of directions) {
      const next = { x: current.x + dir.x, y: current.y + dir.y };

      if (
        isInBounds(grid, next.x, next.y) &&
        isWalkable(grid, next.x, next.y) &&
        !visited.has(key(next))
      ) {
        queue.push(next);
        visited.add(key(next));
        parentMap.set(key(next), current); // Track path
      }
    }
  }

  // No path found
  return null;
}

// Reconstruct the path by walking backwards from end to start
function reconstructPath(parentMap, start, end) {
  const path = [];
  let current = end;
  const key = (pos) => `${pos.x},${pos.y}`;

  while (key(current) !== key(start)) {
    path.push(current);
    current = parentMap.get(key(current));
  }

  path.reverse(); // Make path go from start to end
  return path;
}
