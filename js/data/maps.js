import {
  DEFAULT_MAP_ID,
  SECOND_MAP_ID,
  SECOND_MAP_ENTRY,
  STARTER_DOOR,
  FIRE_BIOME_MAP_ID,
  FIRE_BIOME_MAP_ENTRY
} from '../utils/constants.js';
import { STARTER_ENEMY_STARTS, SECOND_MAP_ENEMY_STARTS, FIRE_BIOME_MAP_ENEMY_STARTS } from './enemies.js';
import { STARTER_NPC_TEMPLATE, RECRUITABLE_NPC_TEMPLATE } from './dialogue.js';

export const SECOND_MAP_HEALING_TILES = [{ id: 'healing_tile_second_01', type: 'healing_tile', x: 8, y: 10 }];

export const TERRAIN_TILE_TYPES = {
  GROUND: 'ground',
  WALL: 'wall',
  SWAMP: 'swamp',
  EMBER: 'ember'
};

export const TERRAIN_TILE_DEFINITIONS = {
  0: { tileType: TERRAIN_TILE_TYPES.GROUND, walkable: true, traversalTagRequired: null },
  1: { tileType: TERRAIN_TILE_TYPES.WALL, walkable: false, traversalTagRequired: null },
  2: { tileType: TERRAIN_TILE_TYPES.SWAMP, walkable: false, traversalTagRequired: 'swamp_walk' },
  3: { tileType: TERRAIN_TILE_TYPES.EMBER, walkable: false, traversalTagRequired: 'swamp_walk' }
};

const STARTER_MAP_LAYOUT = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0], [0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0], [0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0], [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0], [0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1], [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0], [0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0], [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0]
];

const SECOND_MAP_LAYOUT = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1], [1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1], [1, 0, 1, 0, 1, 2, 2, 2, 0, 1, 0, 1], [1, 0, 0, 0, 1, 1, 1, 2, 0, 0, 0, 1], [1, 0, 1, 0, 0, 0, 2, 2, 0, 1, 0, 1], [1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1], [1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1], [1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1], [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const FIRE_BIOME_MAP_LAYOUT = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 3, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 3, 0, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 0, 3, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 3, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 3, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export const MAP_DEFINITIONS = {
  [DEFAULT_MAP_ID]: {
    id: DEFAULT_MAP_ID,
    metadata: { nameKey: 'starterMapName', zoneType: 'starter' },
    layout: STARTER_MAP_LAYOUT,
    spawn: { x: 0, y: 0 },
    enemies: STARTER_ENEMY_STARTS,
    npcs: [STARTER_NPC_TEMPLATE],
    doors: [{ ...STARTER_DOOR, targetMapId: SECOND_MAP_ID, targetSpawn: SECOND_MAP_ENTRY }]
  },
  [SECOND_MAP_ID]: {
    id: SECOND_MAP_ID,
    metadata: { nameKey: 'secondMapName', zoneType: 'field' },
    layout: SECOND_MAP_LAYOUT,
    spawn: SECOND_MAP_ENTRY,
    enemies: SECOND_MAP_ENEMY_STARTS,
    npcs: [RECRUITABLE_NPC_TEMPLATE],
    doors: [
      { id: 'door_second_to_fire_01', type: 'door', x: 10, y: 10, targetMapId: FIRE_BIOME_MAP_ID, targetSpawn: FIRE_BIOME_MAP_ENTRY }
    ],
    healingTiles: SECOND_MAP_HEALING_TILES
  },
  [FIRE_BIOME_MAP_ID]: {
    id: FIRE_BIOME_MAP_ID,
    metadata: { nameKey: 'fireBiomeMapName', zoneType: 'fire_biome' },
    layout: FIRE_BIOME_MAP_LAYOUT,
    spawn: FIRE_BIOME_MAP_ENTRY,
    enemies: FIRE_BIOME_MAP_ENEMY_STARTS,
    npcs: [],
    doors: [
      { id: 'door_fire_to_second_01', type: 'door', x: 1, y: 9, targetMapId: SECOND_MAP_ID, targetSpawn: { x: 9, y: 10 } }
    ]
  }
};
