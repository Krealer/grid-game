// Import helper modules
import { showDialog, clearDialog } from './components/dialog.js';
import { addItem } from './components/inventory.js';
import { findPath } from './components/pathfinding.js';


// Set up basic game state
let mapData = [];
let playerPosition = { x: 1, y: 1 }; // ✅ you need this
let currentMap = 'map1'; // Default map


// Load map JSON and render grid
async function loadMap(name, entryPosition = null) {
  const res = await fetch(`maps/${name}.json`);
  const newMap = await res.json();

  mapData = newMap;
  currentMap = name; // ✅ update current map

  if (entryPosition) {
    playerPosition = entryPosition;
  }

  console.log(`Switched to map "${name}" at`, playerPosition);
  renderGrid();
}



// Render the grid based on mapData
function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = ''; // Clear previous

  for (let y = 0; y < mapData.length; y++) {
    for (let x = 0; x < mapData[y].length; x++) {
      const tileData = mapData[y][x];
      const tileType = typeof tileData === 'string' ? tileData : tileData.type;
      const tile = document.createElement('div');
      tile.classList.add('tile', `tile-${tileType}`);

      // If this is the player's position, add player styling
      if (playerPosition.x === x && playerPosition.y === y) {
        tile.classList.add('tile-player');
      }

      // Handle tile click
      tile.addEventListener('click', () => onTileClick(x, y));

      grid.appendChild(tile);
    }
  }
}

// Handle what happens when a tile is clicked
function onTileClick(x, y) {
  const tile = mapData[y][x];
  const type = typeof tile === 'string' ? tile : tile.type;

  if (['wall', 'npc', 'chest', 'door'].includes(type)) {
    // Check if player is adjacent (for interaction only)
    const dx = Math.abs(playerPosition.x - x);
    const dy = Math.abs(playerPosition.y - y);
    const isAdjacent = (dx + dy === 1);

    if (isAdjacent) {
      handleTileEvent(tile, type);
    } else {
      console.log('Too far to interact.');
    }
    return;
  }

  // For walkable tiles (like 'floor', 'enemy') — use pathfinding
  const path = findPath(mapData, playerPosition, { x, y });

  if (!path) {
    console.log('No path found.');
    return;
  }

  movePlayerStepByStep(path, () => handleTileEvent(tile, type));
}

function movePlayerStepByStep(path, onComplete) {
  if (!path.length) {
    onComplete();
    return;
  }

  let index = 0;

  const interval = setInterval(() => {
    playerPosition = path[index];
    renderGrid();
    clearDialog(); // ✅ Clear dialog during each move

    index++;
    if (index >= path.length) {
      clearInterval(interval);
      onComplete();
    }
  }, 500); // 0.5s per step
}




// Respond to special tile types
function handleTileEvent(tile, type) {
  switch (type) {
    case 'chest':
      addItem('Gold Coin');
      break;
   case 'door':
  if (tile.target && tile.entry) {
    loadMap(tile.target, tile.entry); // ✅ the entry from the clicked tile
  } else {
    console.warn("Invalid door data.");
  }
  break;


    case 'enemy':
      alert("Enemy encountered! (Turn-based battle coming soon!)");
      break;
    case 'npc':
      showDialog();
      break;
  }
}


// Initial load
loadMap(currentMap);
