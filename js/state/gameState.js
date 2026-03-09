import { DEFAULT_MAP_ID, BATTLE_MENUS } from '../utils/constants.js';

export const gameState = {
  currentLanguage: 'en',
  currentSlotId: null,
  gameMenuStatusKey: '',
  showCoordinates: false,
  pendingDeleteSlotId: null,
  currentMapId: DEFAULT_MAP_ID,
  enemyStates: [],
  npcStates: []
};

export const playerState = {
  tileX: 0,
  tileY: 0,
  path: [],
  moving: false,
  stepToX: 0,
  stepToY: 0,
  stepElapsed: 0,
  lastTimestamp: null
};

export const dialogueState = { npcId: null, nodeId: null };
export const battleState = {
  menu: BATTLE_MENUS.ROOT,
  enemyId: null,
  enemy: null,
  player: null,
  feedbackKeys: [],
  resultMessageKey: 'obtainedNothing',
  resultItemKey: null,
  resultExpGained: 0,
  resultLevelUps: 0
};
