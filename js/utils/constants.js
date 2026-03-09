export const GRID_SIZE = 12;
export const TILE_SPEED_PER_SECOND = 2;
export const TILE_STEP_DURATION = 1 / TILE_SPEED_PER_SECOND;
export const SAVE_SCHEMA_VERSION = 3;
export const DEFAULT_MAP_ID = 'map_starter_field';
export const STABLE_ID_PATTERNS = {
  map: /^map_[a-z0-9]+(?:_[a-z0-9]+)*$/,
  door: /^door_[a-z0-9]+(?:_[a-z0-9]+)*$/,
  key: /^key_[a-z0-9]+(?:_[a-z0-9]+)*$/,
  medal: /^medal_[a-z0-9]+(?:_[a-z0-9]+)*$/,
  companion: /^companion_[a-z0-9]+(?:_[a-z0-9]+)*$/,
  item: /^item_[a-z0-9]+(?:_[a-z0-9]+)*$/
};
export const STARTER_REQUIRED_SLIME_IDS = ['enemy_fire_slime_01', 'enemy_earth_slime_01', 'enemy_water_slime_01'];
export const STARTER_DOOR_EVENT_FLAG = 'event_starter_door_spawned';
export const STARTER_DOOR = { id: 'door_starter_exit', type: 'door', x: 10, y: 10 };
export const SECOND_MAP_ID = 'map_second_field';
export const SECOND_MAP_ENTRY = { x: 1, y: 1 };
export const MAIN_PARTY_MEMBER_ID = 'main_player';
export const MAX_ACTIVE_PARTY_SIZE = 4;
export const STORAGE_LANGUAGE_KEY = 'preferredLanguage';
export const STORAGE_SAVE_KEY = 'gridGameSaveSlots';
export const SLOT_COUNT = 3;
export const BATTLE_MENUS = { ROOT: 'root', FIGHT_CATEGORIES: 'fightCategories', OFFENSIVE: 'offensive', DEFENDERS: 'defenders' };
export const ELEMENTAL_ADVANTAGE = { fire: 'earth', earth: 'water', water: 'fire' };
