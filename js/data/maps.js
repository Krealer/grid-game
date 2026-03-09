import { DEFAULT_MAP_ID, SECOND_MAP_ID, SECOND_MAP_ENTRY, STARTER_DOOR } from '../utils/constants.js';
import { STARTER_ENEMY_STARTS, SECOND_MAP_ENEMY_STARTS } from './enemies.js';
import { STARTER_NPC_TEMPLATE, RECRUITABLE_NPC_TEMPLATE } from './dialogue.js';

export const SECOND_MAP_HEALING_TILES = [{ id: 'healing_tile_second_01', type: 'healing_tile', x: 8, y: 10 }];

const STARTER_MAP_LAYOUT = [
  [0,0,0,0,0,0,0,0,0,0,0,0],[0,1,1,1,1,1,0,0,0,1,1,0],[0,0,0,0,0,1,0,0,0,0,1,0],[0,1,1,1,0,1,0,1,1,1,1,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,1,1,1,1,0,1,1,1,1,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,1,1,1,1,0,0,1,0,1,1,1],[0,0,0,0,1,0,0,1,0,0,0,0],[0,1,1,0,1,0,0,1,1,1,1,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,0,0]
];
const SECOND_MAP_LAYOUT = [
  [1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,1,0,0,0,0,1],[1,0,1,1,0,0,1,0,1,1,0,1],[1,0,1,0,0,0,1,0,0,1,0,1],[1,0,1,0,1,0,0,0,0,1,0,1],[1,0,0,0,1,1,1,1,0,0,0,1],[1,0,1,0,0,0,0,1,0,1,0,1],[1,0,1,1,1,0,0,1,0,1,0,1],[1,0,0,0,1,0,1,1,0,0,0,1],[1,1,1,0,1,0,0,0,0,1,0,1],[1,0,0,0,0,0,1,1,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1]
];

export const MAP_DEFINITIONS = {
  [DEFAULT_MAP_ID]: {
    id: DEFAULT_MAP_ID,
    metadata: { nameKey: 'starterMapName', zoneType: 'starter' },
    layout: STARTER_MAP_LAYOUT,
    spawn: { x: 0, y: 0 },
    enemies: STARTER_ENEMY_STARTS,
    npcs: [STARTER_NPC_TEMPLATE],
    doors: [STARTER_DOOR]
  },
  [SECOND_MAP_ID]: {
    id: SECOND_MAP_ID,
    metadata: { nameKey: 'secondMapName', zoneType: 'field' },
    layout: SECOND_MAP_LAYOUT,
    spawn: SECOND_MAP_ENTRY,
    enemies: SECOND_MAP_ENEMY_STARTS,
    npcs: [RECRUITABLE_NPC_TEMPLATE],
    doors: [],
    healingTiles: SECOND_MAP_HEALING_TILES
  }
};
