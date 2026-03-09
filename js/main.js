import { GRID_SIZE, TILE_SPEED_PER_SECOND, SAVE_SCHEMA_VERSION, DEFAULT_MAP_ID, STABLE_ID_PATTERNS, STARTER_REQUIRED_SLIME_IDS, STARTER_DOOR_EVENT_FLAG, STARTER_DOOR, MAIN_PARTY_MEMBER_ID, MAX_ACTIVE_PARTY_SIZE, STORAGE_LANGUAGE_KEY, STORAGE_SAVE_KEY, SLOT_COUNT, BATTLE_MENUS, ELEMENTAL_ADVANTAGE } from './utils/constants.js';
import { MAP_DEFINITIONS, SECOND_MAP_HEALING_TILES, TERRAIN_TILE_DEFINITIONS, TERRAIN_TILE_TYPES } from './data/maps.js';
import { ENEMY_SPECIES_DEFINITIONS } from './data/enemies.js';
import { COMPANION_DEFINITIONS, PLAYER_CLASS_STATS, LEVEL_GROWTH_BY_CLASS } from './data/characters.js';
import { GEAR_ITEM_DEFINITIONS, DEFAULT_EQUIPPED_GEAR, EQUIPMENT_SLOT_ORDER, EQUIPMENT_SLOT_TYPES } from './data/gear.js';
import { DIALOGUE_DEFINITIONS_BY_NPC_ID } from './data/dialogue.js';
import { STORY_CONDITIONED_DOOR_EVENT_DEFINITIONS, resolveStoryConditionedRoute } from './data/events.js';
import { translations } from './data/localization.js';
import { SKILL_DEFINITIONS } from './data/skills.js';
import { MEDAL_DEFINITIONS, MEDAL_ORDER } from './data/medals.js';
import { loadRawSlots, persistSlots } from './state/saveSystem.js';
import { gameState, playerState, dialogueState, battleState } from './state/gameState.js';
import { createScreenRouter } from './ui/screenRouter.js';
import { renderSaveSlotsUI } from './ui/saveSlotsUI.js';
import { formatText } from './utils/helpers.js';
import { calculateEquipmentBonuses, canEquipItemForSlot, createStarterGearInventoryForClass, normalizeEquippedGear, normalizeOwnedGearItemIds } from './systems/gearSystem.js';
import { createBattlePartyData as createBattlePartyDataFromPartySystem, getFirstActiveCompanionBattler as getFirstActiveCompanionBattlerFromPartySystem, updatePartyBattleMemberHp as updatePartyBattleMemberHpFromPartySystem } from './systems/partySystem.js';
import { resolveCompanionAction, resolveEnemyActionAgainstPlayer } from './systems/battleSystem.js';
import { buildBattleSubtitle } from './ui/battleUI.js';

const screens = {
  language: document.getElementById('language-screen'),
  menu: document.getElementById('menu-screen'),
  medals: document.getElementById('medals-screen'),
  save: document.getElementById('save-screen'),
  deleteConfirm: document.getElementById('delete-confirm-screen'),
  element: document.getElementById('element-screen'),
  class: document.getElementById('class-screen'),
  game: document.getElementById('game-screen'),
  battle: document.getElementById('battle-screen'),
  dialogue: document.getElementById('dialogue-screen'),
  victory: document.getElementById('victory-screen'),
  defeat: document.getElementById('defeat-screen'),
  gameMenu: document.getElementById('game-menu-screen'),
  settings: document.getElementById('settings-screen'),
  inventory: document.getElementById('inventory-screen'),
  info: document.getElementById('info-screen'),
  party: document.getElementById('party-screen')
};

const languageButtons = [...document.querySelectorAll('.language-option')];
const elementButtons = [...document.querySelectorAll('.element-option')];
const classButtons = [...document.querySelectorAll('.class-option')];
const gridBoard = document.getElementById('grid-board');

const textNodes = {
  languageTitle: document.getElementById('language-title'),
  languageSubtitle: document.getElementById('language-subtitle'),
  menuTitle: document.getElementById('menu-title'),
  menuInstruction: document.getElementById('menu-instruction'),
  menuPlay: document.getElementById('menu-play'),
  menuMedals: document.getElementById('menu-medals'),
  menuBack: document.getElementById('menu-back'),
  saveTitle: document.getElementById('save-title'),
  saveSubtitle: document.getElementById('save-subtitle'),
  saveBack: document.getElementById('save-back'),
  deleteConfirmMessage: document.getElementById('delete-confirm-message'),
  deleteConfirmYes: document.getElementById('delete-confirm-yes'),
  deleteConfirmNo: document.getElementById('delete-confirm-no'),
  elementTitle: document.getElementById('element-title'),
  elementBack: document.getElementById('element-back'),
  classTitle: document.getElementById('class-title'),
  classBack: document.getElementById('class-back'),
  classConfirmation: document.getElementById('class-confirmation'),
  gameTitle: document.getElementById('game-title'),
  gameSlot: document.getElementById('game-slot'),
  gameHelper: document.getElementById('game-helper'),
  openGameMenu: document.getElementById('open-game-menu'),
  battleTitle: document.getElementById('battle-title'),
  battleEnemyName: document.getElementById('battle-enemy-name'),
  battleEnemyStats: document.getElementById('battle-enemy-stats'),
  battleEnemyHp: document.getElementById('battle-enemy-hp'),
  battleEnemyHpFill: document.getElementById('battle-enemy-hp-fill'),
  battlePlayerName: document.getElementById('battle-player-name'),
  battlePlayerStats: document.getElementById('battle-player-stats'),
  battlePlayerHp: document.getElementById('battle-player-hp'),
  battlePlayerHpFill: document.getElementById('battle-player-hp-fill'),
  battleCompanionName: document.getElementById('battle-companion-name'),
  battleCompanionStats: document.getElementById('battle-companion-stats'),
  battleCompanionHp: document.getElementById('battle-companion-hp'),
  battleCompanionHpFill: document.getElementById('battle-companion-hp-fill'),
  battleSubtitle: document.getElementById('battle-subtitle'),
  dialogueTitle: document.getElementById('dialogue-title'),
  dialogueSpeaker: document.getElementById('dialogue-speaker'),
  dialogueLine: document.getElementById('dialogue-line'),
  dialogueChoices: document.getElementById('dialogue-choices'),
  dialogueHelper: document.getElementById('dialogue-helper'),
  victoryTitle: document.getElementById('victory-title'),
  victoryMessage: document.getElementById('victory-message'),
  victoryContinue: document.getElementById('victory-continue'),
  defeatTitle: document.getElementById('defeat-title'),
  defeatMainMenu: document.getElementById('defeat-main-menu'),
  gameMenuTitle: document.getElementById('game-menu-title'),
  gameMenuStatus: document.getElementById('game-menu-status'),
  gmBackToGame: document.getElementById('gm-back-to-game'),
  gmParty: document.getElementById('gm-party'),
  gmInventory: document.getElementById('gm-inventory'),
  gmInfo: document.getElementById('gm-info'),
  gmSettings: document.getElementById('gm-settings'),
  gmSave: document.getElementById('gm-save'),
  gmSaveQuit: document.getElementById('gm-save-quit'),
  gmQuit: document.getElementById('gm-quit'),
  settingsTitle: document.getElementById('settings-title'),
  settingsToggleCoordinates: document.getElementById('settings-toggle-coordinates'),
  settingsBack: document.getElementById('settings-back'),
  inventoryTitle: document.getElementById('inventory-title'),
  inventoryHelper: document.getElementById('inventory-helper'),
  inventoryStats: document.getElementById('inventory-stats'),
  inventoryBack: document.getElementById('inventory-back'),
  partyTitle: document.getElementById('party-title'),
  partyActiveTitle: document.getElementById('party-active-title'),
  partyRecruitedTitle: document.getElementById('party-recruited-title'),
  partyActiveEmpty: document.getElementById('party-active-empty'),
  partyRecruitedEmpty: document.getElementById('party-recruited-empty'),
  partyBack: document.getElementById('party-back'),
  infoTitle: document.getElementById('info-title'),
  infoHelper: document.getElementById('info-helper'),
  infoDetails: document.getElementById('info-details'),
  infoBack: document.getElementById('info-back'),
  medalsTitle: document.getElementById('medals-title'),
  medalsEmpty: document.getElementById('medals-empty'),
  medalsBack: document.getElementById('medals-back')
};

const saveSlotsList = document.getElementById('save-slots');
const battleOptionsList = document.getElementById('battle-options-list');
const dialogueArea = document.getElementById('dialogue-area');
const dialoguePlayerAvatar = document.getElementById('dialogue-player-avatar');
const partyActiveList = document.getElementById('party-active-list');
const partyRecruitedList = document.getElementById('party-recruited-list');
const inventoryList = document.getElementById('inventory-list');
const medalsList = document.getElementById('medals-list');
const debugOverlay = document.getElementById('debug-overlay');

let activeScreenName = 'language';
let debugOverlayVisible = false;
let lastClickedDestination = null;
let suppressNextGridClick = false;

let { currentLanguage, currentSlotId, gameMenuStatusKey, showCoordinates, pendingDeleteSlotId, currentMapId } = gameState;
let enemyStates = gameState.enemyStates;
let npcStates = gameState.npcStates;
const playerPiece = document.createElement('div');
playerPiece.className = 'player-piece';
gridBoard.append(playerPiece);

enemyStates = createInitialEnemyStates();
npcStates = createNpcStates(enemyStates);

function getLocale() {
  return translations[currentLanguage] || translations.en;
}

function isInsideGrid(x, y) {
  return x >= 0 && y >= 0 && x < GRID_SIZE && y < GRID_SIZE;
}

function getMapDefinition(mapId = currentMapId) {
  return MAP_DEFINITIONS[mapId] || MAP_DEFINITIONS[DEFAULT_MAP_ID];
}

function getCurrentMapDefinition() {
  return getMapDefinition(currentMapId);
}

function getTileDefinitionAt(x, y, mapId = currentMapId) {
  const map = getMapDefinition(mapId);
  if (!isInsideGrid(x, y)) {
    return null;
  }

  const tileCode = map.layout[y][x];
  return TERRAIN_TILE_DEFINITIONS[tileCode] || TERRAIN_TILE_DEFINITIONS[1];
}

function getPlayerTraversalTagsForSlot(slot) {
  if (!slot) {
    return new Set();
  }

  const mainMember = getMainPartyMemberState(slot);
  return new Set(getEffectiveMemberStats(mainMember, slot).traversalTagsGranted);
}

function isTileTraversableByTags(x, y, traversalTags = new Set(), mapId = currentMapId) {
  const tile = getTileDefinitionAt(x, y, mapId);
  if (!tile) {
    return false;
  }

  if (tile.walkable) {
    return true;
  }

  if (!tile.traversalTagRequired) {
    return false;
  }

  return traversalTags.has(tile.traversalTagRequired);
}

function isGround(x, y, mapId = currentMapId) {
  const tile = getTileDefinitionAt(x, y, mapId);
  return tile?.tileType === TERRAIN_TILE_TYPES.GROUND;
}

function isValidEnemySpawn(x, y, occupiedKeys, mapId = currentMapId) {
  const map = getMapDefinition(mapId);
  const mapSpawn = map.spawn || { x: 0, y: 0 };

  if (!isGround(x, y, mapId) || (x === mapSpawn.x && y === mapSpawn.y)) {
    return false;
  }

  return !occupiedKeys.has(`${x},${y}`);
}

function getFirstValidEnemySpawn(occupiedKeys, mapId = currentMapId) {
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (isValidEnemySpawn(x, y, occupiedKeys, mapId)) {
        return { x, y };
      }
    }
  }

  return { x: 1, y: 0 };
}

function createEnemyState(enemyTemplate, occupiedKeys, mapId = currentMapId) {
  const { x, y } = enemyTemplate;
  const species = enemyTemplate.species || 'slime';
  const speciesDefinition = ENEMY_SPECIES_DEFINITIONS[species] || ENEMY_SPECIES_DEFINITIONS.slime;
  const spawn = isValidEnemySpawn(x, y, occupiedKeys, mapId) ? { x, y } : getFirstValidEnemySpawn(occupiedKeys, mapId);

  occupiedKeys.add(`${spawn.x},${spawn.y}`);

  return {
    id: enemyTemplate.id,
    x: spawn.x,
    y: spawn.y,
    species,
    nameKey: enemyTemplate.nameKey,
    element: speciesDefinition.fixedElement || enemyTemplate.element,
    maxHp: speciesDefinition.hp,
    hp: speciesDefinition.hp,
    attack: speciesDefinition.attack,
    drops: { ...speciesDefinition.drops },
    skills: speciesDefinition.skills.map((skill) => ({ ...skill })),
    expReward: Number.isFinite(enemyTemplate.expReward) ? Math.max(0, Math.floor(enemyTemplate.expReward)) : 0
  };
}

function createInitialEnemyStates(mapId = currentMapId) {
  const occupiedKeys = new Set();
  const enemyTemplates = getMapDefinition(mapId).enemies || [];

  return enemyTemplates.map((enemyTemplate) => createEnemyState(enemyTemplate, occupiedKeys, mapId));
}

function isValidNpcSpawn(x, y, enemyList, occupiedNpcKeys = new Set(), mapId = currentMapId) {
  const mapSpawn = getMapDefinition(mapId).spawn || { x: 0, y: 0 };

  if (!isGround(x, y, mapId) || (x === mapSpawn.x && y === mapSpawn.y)) {
    return false;
  }

  if (getHealingTileAt(x, y, mapId)) {
    return false;
  }

  if (occupiedNpcKeys.has(`${x},${y}`)) {
    return false;
  }

  return !enemyList.some((enemy) => enemy.x === x && enemy.y === y);
}

function getCompanionWorldState(companionId, slot) {
  if (!companionId || !slot) {
    return null;
  }

  return slot.party?.companionWorldStateFlags?.[companionId] || null;
}

function shouldSpawnRecruitableNpc(npcTemplate, slot, mapId) {
  if (!npcTemplate || npcTemplate.type !== 'recruitable_npc') {
    return true;
  }

  const companionId = npcTemplate.companionId;
  const recruitedIds = new Set(slot?.party?.recruitedCompanionIds || []);
  const activeIds = new Set(slot?.party?.activePartyMemberIds || [MAIN_PARTY_MEMBER_ID]);
  const companionState = getCompanionWorldState(companionId, slot);

  if (!recruitedIds.has(companionId)) {
    return true;
  }

  if (activeIds.has(companionId)) {
    return false;
  }

  const onOriginMap = mapId === npcTemplate.originMapId;
  if (!onOriginMap) {
    return false;
  }

  return companionState === 'at_origin_pending_spawn' || companionState === 'at_origin';
}

function createNpcStates(enemyList, mapId = currentMapId) {
  const npcTemplates = getMapDefinition(mapId).npcs || [];
  const slot = currentSlotId ? getSlotById(currentSlotId) : null;
  const occupiedNpcKeys = new Set();
  const shouldUpdateCompanionWorldState = Boolean(slot && currentSlotId);
  const updatedCompanionStates = {
    ...(slot?.party?.companionWorldStateFlags || {})
  };
  let companionStateChanged = false;

  const spawnedNpcs = npcTemplates.reduce((result, npcTemplate) => {
    if (!shouldSpawnRecruitableNpc(npcTemplate, slot, mapId)) {
      return result;
    }

    const desired = { x: npcTemplate.x, y: npcTemplate.y };
    if (isValidNpcSpawn(desired.x, desired.y, enemyList, occupiedNpcKeys, mapId)) {
      occupiedNpcKeys.add(`${desired.x},${desired.y}`);
      result.push({ ...npcTemplate, x: desired.x, y: desired.y });
      if (npcTemplate.type === 'recruitable_npc' && getCompanionWorldState(npcTemplate.companionId, slot) === 'at_origin_pending_spawn') {
        updatedCompanionStates[npcTemplate.companionId] = 'at_origin';
        companionStateChanged = true;
      }
      return result;
    }

    for (let y = GRID_SIZE - 1; y >= 0; y -= 1) {
      for (let x = GRID_SIZE - 1; x >= 0; x -= 1) {
        if (isValidNpcSpawn(x, y, enemyList, occupiedNpcKeys, mapId)) {
          occupiedNpcKeys.add(`${x},${y}`);
          result.push({ ...npcTemplate, x, y });
          if (npcTemplate.type === 'recruitable_npc' && getCompanionWorldState(npcTemplate.companionId, slot) === 'at_origin_pending_spawn') {
            updatedCompanionStates[npcTemplate.companionId] = 'at_origin';
            companionStateChanged = true;
          }
          return result;
        }
      }
    }

    return result;
  }, []);

  if (shouldUpdateCompanionWorldState && companionStateChanged) {
    updateSlot(currentSlotId, {
      party: {
        companionWorldStateFlags: updatedCompanionStates
      }
    });
  }

  return spawnedNpcs;
}

function getNpcAtTile(x, y) {
  return npcStates.find((npc) => npc.x === x && npc.y === y) || null;
}

function isNpcTile(x, y) {
  return Boolean(getNpcAtTile(x, y));
}

function getEnemyAtTile(x, y) {
  return enemyStates.find((enemy) => enemy.x === x && enemy.y === y) || null;
}

function isEnemyTile(x, y) {
  return Boolean(getEnemyAtTile(x, y));
}

function isWalkable(x, y, traversalTags = null) {
  const tags = traversalTags || getPlayerTraversalTagsForSlot(currentSlotId ? getSlotById(currentSlotId) : null);
  return isTileTraversableByTags(x, y, tags) && !isEnemyTile(x, y) && !isNpcTile(x, y);
}

function getExpRequirementForLevel(level) {
  const normalizedLevel = Math.max(1, Math.floor(level));
  return 10 + ((normalizedLevel - 1) * 5);
}

function getClassGrowth(className) {
  return LEVEL_GROWTH_BY_CLASS[className] || LEVEL_GROWTH_BY_CLASS.warrior;
}

function getMaxHpForClass(className) {
  return getPlayerStatsByClass(className).hp;
}

function getAttackForClass(className) {
  return getPlayerStatsByClass(className).attack;
}

function getSlotInventory(slot) {
  return {
    inventoryItems: normalizeOwnedGearItemIds(slot?.inventory?.inventoryItems),
    equippedGear: normalizeEquippedGear(slot?.inventory?.equippedGear)
  };
}

function getEffectiveMemberStats(memberState, slot) {
  const inventory = getSlotInventory(slot);
  const bonuses = calculateEquipmentBonuses(inventory.equippedGear, memberState.className);
  return {
    ...memberState,
    maxHp: memberState.maxHp + bonuses.hpBonus,
    attack: memberState.attack + bonuses.attackBonus,
    movementSpeedTilesPerSecond: TILE_SPEED_PER_SECOND + bonuses.movementSpeedBonus,
    traversalTagsGranted: [...bonuses.traversalTagsGranted]
  };
}

function getPlayerMovementSpeedTilesPerSecond() {
  const slot = currentSlotId ? getSlotById(currentSlotId) : null;
  if (!slot) {
    return TILE_SPEED_PER_SECOND;
  }

  const mainMember = getMainPartyMemberState(slot);
  return getEffectiveMemberStats(mainMember, slot).movementSpeedTilesPerSecond;
}

function createProgressionMemberState(id, className, element, currentHp = null) {
  const normalizedClass = normalizeStringEnum(className, ['warrior', 'mage'], 'warrior');
  const normalizedElement = normalizeStringEnum(element, ['fire', 'water', 'earth'], 'fire');
  const maxHp = getMaxHpForClass(normalizedClass);
  const attack = getAttackForClass(normalizedClass);
  const normalizedCurrentHp = Number.isFinite(currentHp)
    ? Math.max(0, Math.min(maxHp, Math.floor(currentHp)))
    : maxHp;

  return {
    id,
    className: normalizedClass,
    element: normalizedElement,
    level: 1,
    currentExp: 0,
    expToNextLevel: getExpRequirementForLevel(1),
    currentHp: normalizedCurrentHp,
    maxHp,
    attack
  };
}

function createMainPartyMemberState(className, element, currentHp = null) {
  return createProgressionMemberState(MAIN_PARTY_MEMBER_ID, className, element, currentHp);
}

function normalizePartyMemberStates(memberStates, playerIdentity) {
  const identityClass = normalizeStringEnum(playerIdentity?.chosenClass, ['warrior', 'mage'], 'warrior');
  const identityElement = normalizeStringEnum(playerIdentity?.chosenElement, ['fire', 'water', 'earth'], 'fire');
  const defaultMainState = createMainPartyMemberState(identityClass, identityElement);

  if (!memberStates || typeof memberStates !== 'object' || Array.isArray(memberStates)) {
    return {
      [MAIN_PARTY_MEMBER_ID]: defaultMainState
    };
  }

  const normalizedEntries = Object.entries(memberStates).reduce((result, [memberId, memberState]) => {
    if (typeof memberId !== 'string' || !memberState || typeof memberState !== 'object' || Array.isArray(memberState)) {
      return result;
    }

    const className = normalizeStringEnum(memberState.className, ['warrior', 'mage'], identityClass);
    const element = normalizeStringEnum(memberState.element, ['fire', 'water', 'earth'], identityElement);
    const fallbackState = createProgressionMemberState(memberId, className, element);
    const level = Number.isFinite(memberState.level) ? Math.max(1, Math.floor(memberState.level)) : fallbackState.level;
    const currentExp = Number.isFinite(memberState.currentExp) ? Math.max(0, Math.floor(memberState.currentExp)) : fallbackState.currentExp;
    const expToNextLevel = Number.isFinite(memberState.expToNextLevel)
      ? Math.max(1, Math.floor(memberState.expToNextLevel))
      : getExpRequirementForLevel(level);
    const maxHp = Number.isFinite(memberState.maxHp) ? Math.max(1, Math.floor(memberState.maxHp)) : fallbackState.maxHp;
    const attack = Number.isFinite(memberState.attack) ? Math.max(1, Math.floor(memberState.attack)) : fallbackState.attack;
    const currentHp = Number.isFinite(memberState.currentHp) ? Math.max(0, Math.min(maxHp, Math.floor(memberState.currentHp))) : maxHp;

    result[memberId] = {
      id: memberId,
      className,
      element,
      level,
      currentExp,
      expToNextLevel,
      currentHp,
      maxHp,
      attack
    };

    return result;
  }, {});

  const mainState = normalizedEntries[MAIN_PARTY_MEMBER_ID];
  normalizedEntries[MAIN_PARTY_MEMBER_ID] = mainState
    ? {
      ...mainState,
      id: MAIN_PARTY_MEMBER_ID,
      className: identityClass,
      element: identityElement
    }
    : defaultMainState;

  return normalizedEntries;
}

function getMainPartyMemberState(slot) {
  const className = slot?.playerIdentity?.chosenClass || 'warrior';
  const element = slot?.playerIdentity?.chosenElement || 'fire';
  const memberStates = normalizePartyMemberStates(slot?.party?.memberStates, slot?.playerIdentity);
  return memberStates[MAIN_PARTY_MEMBER_ID] || createMainPartyMemberState(className, element);
}

function createCanonicalSlot(slotId) {
  const now = new Date().toISOString();

  return {
    metadata: {
      slotId,
      createdAt: now,
      updatedAt: now,
      version: SAVE_SCHEMA_VERSION
    },
    playerIdentity: {
      chosenClass: null,
      chosenElement: null,
      storyModeChoice: 'story'
    },
    playerWorldPosition: {
      currentMapId: DEFAULT_MAP_ID,
      playerX: 0,
      playerY: 0
    },
    worldProgress: {
      defeatedEnemyIds: [],
      openedDoorIds: [],
      triggeredEventFlags: {},
      obtainedKeyIds: []
    },
    npcStateFlags: {},
    settings: {
      showCoordinates: false
    },
    medals: [],
    party: {
      activePartyMemberIds: [MAIN_PARTY_MEMBER_ID],
      recruitedCompanionIds: [],
      memberStates: {
        [MAIN_PARTY_MEMBER_ID]: createMainPartyMemberState('warrior', 'fire')
      },
      companionWorldStateFlags: {}
    },
    inventory: {
      inventoryItems: [],
      equippedGear: { ...DEFAULT_EQUIPPED_GEAR }
    }
  };
}

function getDefaultSlots() {
  return Array.from({ length: SLOT_COUNT }, (_, index) => createCanonicalSlot(index + 1));
}

function normalizePosition(playerData, mapId = DEFAULT_MAP_ID) {
  const map = getMapDefinition(mapId);
  const fallbackX = map.spawn.x;
  const fallbackY = map.spawn.y;
  const x = Number.isInteger(playerData?.x) ? playerData.x : fallbackX;
  const y = Number.isInteger(playerData?.y) ? playerData.y : fallbackY;

  if (!isInsideGrid(x, y)) {
    return { x: fallbackX, y: fallbackY };
  }

  const tile = getTileDefinitionAt(x, y, mapId);
  if (!tile || tile.tileType === TERRAIN_TILE_TYPES.WALL) {
    return { x: fallbackX, y: fallbackY };
  }

  return { x, y };
}

function normalizeBoolean(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeStringEnum(value, allowedValues, fallback = null) {
  if (typeof value !== 'string') {
    return fallback;
  }

  return allowedValues.includes(value) ? value : fallback;
}

function normalizeStableId(value, pattern, fallback = null) {
  if (typeof value !== 'string') {
    return fallback;
  }

  return pattern.test(value) ? value : fallback;
}

function normalizeMapId(value) {
  const stableId = normalizeStableId(value, STABLE_ID_PATTERNS.map, DEFAULT_MAP_ID);
  return MAP_DEFINITIONS[stableId] ? stableId : DEFAULT_MAP_ID;
}

function normalizeStableIdArray(value, pattern) {
  return normalizeStringArray(value).filter((entry) => pattern.test(entry));
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((entry) => typeof entry === 'string'))];
}

function normalizeStringRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce((result, [key, entryValue]) => {
    if (typeof key === 'string' && typeof entryValue === 'boolean') {
      result[key] = entryValue;
    }
    return result;
  }, {});
}

function normalizeStringValueRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce((result, [key, entryValue]) => {
    if (typeof key === 'string' && typeof entryValue === 'string') {
      result[key] = entryValue;
    }
    return result;
  }, {});
}

function normalizeCompanionWorldStateFlags(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const allowedStates = new Set(['following_player', 'at_origin_pending_spawn', 'at_origin']);

  return Object.entries(value).reduce((result, [companionId, state]) => {
    if (STABLE_ID_PATTERNS.companion.test(companionId) && typeof state === 'string' && allowedStates.has(state)) {
      result[companionId] = state;
    }
    return result;
  }, {});
}

function normalizeMedals(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((medal) => medal && typeof medal === 'object')
    .map((medal) => ({
      medalId: normalizeStableId(medal.medalId, STABLE_ID_PATTERNS.medal),
      unlockedAt: typeof medal.unlockedAt === 'string' ? medal.unlockedAt : null
    }))
    .filter((medal) => Boolean(medal.medalId));
}


function formatMedalUnlockedDate(unlockedAt) {
  if (!unlockedAt) {
    return null;
  }

  const localeTag = currentLanguage === 'ja'
    ? 'ja-JP'
    : currentLanguage === 'ru'
      ? 'ru-RU'
      : currentLanguage === 'ar'
        ? 'ar'
        : 'en-US';

  const parsedDate = new Date(unlockedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return unlockedAt;
  }

  return new Intl.DateTimeFormat(localeTag, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsedDate);
}

function unlockMedal(slotId, medalId) {
  if (!slotId || !medalId || !MEDAL_DEFINITIONS[medalId]) {
    return false;
  }

  const slot = getSlotById(slotId);
  if (!slot) {
    return false;
  }

  const medals = normalizeMedals(slot.medals);
  if (medals.some((medal) => medal.medalId === medalId)) {
    return false;
  }

  const unlockedAt = new Date().toISOString();
  updateSlot(slotId, {
    medals: [...medals, { medalId, unlockedAt }]
  });

  return true;
}

function renderMedalsScreen() {
  const locale = getLocale();
  const slot = currentSlotId ? getSlotById(currentSlotId) : null;
  const medalsById = new Map(normalizeMedals(slot?.medals).map((medal) => [medal.medalId, medal]));

  medalsList.innerHTML = '';

  MEDAL_ORDER.forEach((medalId) => {
    const medalDefinition = MEDAL_DEFINITIONS[medalId];
    if (!medalDefinition) {
      return;
    }

    const unlockedMedal = medalsById.get(medalId);
    if (!unlockedMedal) {
      return;
    }

    const li = document.createElement('li');
    li.className = 'medal-row';

    const title = document.createElement('p');
    title.className = 'medal-title';
    title.textContent = locale[medalDefinition.titleKey];

    const description = document.createElement('p');
    description.className = 'medal-description';
    description.textContent = locale[medalDefinition.descriptionKey];

    const unlockedAt = document.createElement('p');
    unlockedAt.className = 'medal-date';
    unlockedAt.textContent = formatText(locale.medalDateEarned, {
      date: formatMedalUnlockedDate(unlockedMedal.unlockedAt) || unlockedMedal.unlockedAt
    });

    li.append(title, description, unlockedAt);
    medalsList.append(li);
  });

  const hasUnlockedMedals = medalsList.children.length > 0;
  textNodes.medalsEmpty.hidden = hasUnlockedMedals;
  textNodes.medalsEmpty.textContent = locale.noMedalsUnlocked;
}


function normalizeDefeatedEnemyIds(defeatedEnemyIds) {
  if (!Array.isArray(defeatedEnemyIds)) {
    return [];
  }

  return [...new Set(defeatedEnemyIds.filter((enemyId) => typeof enemyId === 'string'))];
}

function areAllStarterSlimesDefeated(defeatedEnemyIds) {
  const defeatedSet = new Set(normalizeDefeatedEnemyIds(defeatedEnemyIds));
  return STARTER_REQUIRED_SLIME_IDS.every((enemyId) => defeatedSet.has(enemyId));
}

function getStarterDoorState(slot, defeatedEnemyIdsOverride) {
  const defeatedEnemyIds = defeatedEnemyIdsOverride || slot?.worldProgress?.defeatedEnemyIds;
  const allStarterSlimesDefeated = areAllStarterSlimesDefeated(defeatedEnemyIds);
  const openedDoorIds = new Set(slot?.worldProgress?.openedDoorIds || []);
  const triggeredEventFlags = slot?.worldProgress?.triggeredEventFlags || {};
  const spawned = openedDoorIds.has(STARTER_DOOR.id)
    || Boolean(triggeredEventFlags[STARTER_DOOR_EVENT_FLAG])
    || allStarterSlimesDefeated;

  return {
    spawned,
    allStarterSlimesDefeated
  };
}

function synchronizeStarterDoorProgress(slotId, defeatedEnemyIdsOverride) {
  const slot = getSlotById(slotId);
  if (!slot) {
    return null;
  }

  const defeatedEnemyIds = defeatedEnemyIdsOverride || slot.worldProgress?.defeatedEnemyIds || [];
  const doorState = getStarterDoorState(slot, defeatedEnemyIds);

  if (!doorState.spawned) {
    return slot;
  }

  const openedDoorIds = new Set(slot.worldProgress?.openedDoorIds || []);
  const triggeredEventFlags = {
    ...(slot.worldProgress?.triggeredEventFlags || {})
  };

  const needsDoorId = !openedDoorIds.has(STARTER_DOOR.id);
  const needsEventFlag = !triggeredEventFlags[STARTER_DOOR_EVENT_FLAG];

  if (!needsDoorId && !needsEventFlag) {
    return slot;
  }

  openedDoorIds.add(STARTER_DOOR.id);
  triggeredEventFlags[STARTER_DOOR_EVENT_FLAG] = true;

  updateSlot(slotId, {
    worldProgress: {
      defeatedEnemyIds,
      openedDoorIds: [...openedDoorIds],
      triggeredEventFlags
    }
  });

  return getSlotById(slotId);
}

function normalizeCanonicalSlot(slot, slotId) {
  const canonical = createCanonicalSlot(slotId);
  const normalizedMapId = typeof slot?.playerWorldPosition?.currentMapId === 'string'
    ? normalizeMapId(slot.playerWorldPosition.currentMapId)
    : DEFAULT_MAP_ID;
  const position = normalizePosition({
    x: slot?.playerWorldPosition?.playerX,
    y: slot?.playerWorldPosition?.playerY
  }, normalizedMapId);

  const normalizedRecruitedCompanionIds = normalizeStableIdArray(slot?.party?.recruitedCompanionIds, STABLE_ID_PATTERNS.companion)
    .filter((companionId) => Boolean(COMPANION_DEFINITIONS[companionId]));
  const normalizedActivePartyMemberIds = (() => {
    const normalized = normalizeStringArray(slot?.party?.activePartyMemberIds);
    const sanitized = normalized.filter((memberId) => memberId === MAIN_PARTY_MEMBER_ID
      || (normalizedRecruitedCompanionIds.includes(memberId) && Boolean(COMPANION_DEFINITIONS[memberId])));
    const ensuredMain = sanitized.includes(MAIN_PARTY_MEMBER_ID)
      ? sanitized
      : [MAIN_PARTY_MEMBER_ID, ...sanitized];
    return [...new Set(ensuredMain)].slice(0, MAX_ACTIVE_PARTY_SIZE);
  })();
  const normalizedCompanionWorldStateFlags = (() => {
    const incomingStates = normalizeCompanionWorldStateFlags(slot?.party?.companionWorldStateFlags);
    const activeCompanionSet = new Set(normalizedActivePartyMemberIds.filter((memberId) => memberId !== MAIN_PARTY_MEMBER_ID));

    return normalizedRecruitedCompanionIds.reduce((result, companionId) => {
      if (activeCompanionSet.has(companionId)) {
        result[companionId] = 'following_player';
        return result;
      }

      const priorState = incomingStates[companionId];
      result[companionId] = priorState === 'at_origin' || priorState === 'at_origin_pending_spawn'
        ? priorState
        : 'at_origin_pending_spawn';
      return result;
    }, {});
  })();

  const normalizedSlot = {
    metadata: {
      slotId,
      createdAt: typeof slot?.metadata?.createdAt === 'string' ? slot.metadata.createdAt : canonical.metadata.createdAt,
      updatedAt: typeof slot?.metadata?.updatedAt === 'string' ? slot.metadata.updatedAt : canonical.metadata.updatedAt,
      version: SAVE_SCHEMA_VERSION
    },
    playerIdentity: {
      chosenClass: normalizeStringEnum(slot?.playerIdentity?.chosenClass, ['warrior', 'mage']),
      chosenElement: normalizeStringEnum(slot?.playerIdentity?.chosenElement, ['fire', 'water', 'earth']),
      storyModeChoice: normalizeStringEnum(slot?.playerIdentity?.storyModeChoice, ['story', 'no_story'], 'story')
    },
    playerWorldPosition: {
      currentMapId: normalizedMapId,
      playerX: position.x,
      playerY: position.y
    },
    worldProgress: {
      defeatedEnemyIds: normalizeDefeatedEnemyIds(slot?.worldProgress?.defeatedEnemyIds),
      openedDoorIds: normalizeStableIdArray(slot?.worldProgress?.openedDoorIds, STABLE_ID_PATTERNS.door),
      triggeredEventFlags: normalizeStringRecord(slot?.worldProgress?.triggeredEventFlags),
      obtainedKeyIds: normalizeStableIdArray(slot?.worldProgress?.obtainedKeyIds, STABLE_ID_PATTERNS.key)
    },
    npcStateFlags: normalizeStringRecord(slot?.npcStateFlags),
    settings: {
      showCoordinates: normalizeBoolean(slot?.settings?.showCoordinates, false)
    },
    medals: normalizeMedals(slot?.medals),
    party: {
      activePartyMemberIds: normalizedActivePartyMemberIds,
      recruitedCompanionIds: normalizedRecruitedCompanionIds,
      memberStates: normalizePartyMemberStates(slot?.party?.memberStates, slot?.playerIdentity),
      companionWorldStateFlags: normalizedCompanionWorldStateFlags
    },
    inventory: {
      inventoryItems: normalizeOwnedGearItemIds(normalizeStableIdArray(slot?.inventory?.inventoryItems, STABLE_ID_PATTERNS.item)),
      equippedGear: normalizeEquippedGear(normalizeStringValueRecord(slot?.inventory?.equippedGear))
    }
  };

  const traversalTags = getPlayerTraversalTagsForSlot(normalizedSlot);
  const candidatePosition = normalizedSlot.playerWorldPosition;
  const canStandOnTile = isTileTraversableByTags(
    candidatePosition.playerX,
    candidatePosition.playerY,
    traversalTags,
    candidatePosition.currentMapId
  );

  if (!canStandOnTile) {
    const fallback = getMapDefinition(candidatePosition.currentMapId).spawn;
    normalizedSlot.playerWorldPosition.playerX = fallback.x;
    normalizedSlot.playerWorldPosition.playerY = fallback.y;
  }

  return normalizedSlot;
}

function normalizeLegacySlot(slot, slotId) {
  const canonical = createCanonicalSlot(slotId);
  const position = normalizePosition(slot?.playerData, DEFAULT_MAP_ID);

  canonical.playerIdentity.chosenElement = normalizeStringEnum(slot?.element, ['fire', 'water', 'earth']);
  canonical.playerIdentity.chosenClass = normalizeStringEnum(slot?.class, ['warrior', 'mage']);
  canonical.playerWorldPosition.playerX = position.x;
  canonical.playerWorldPosition.playerY = position.y;
  canonical.worldProgress.defeatedEnemyIds = normalizeDefeatedEnemyIds(slot?.defeatedEnemyIds);
  canonical.party.memberStates = normalizePartyMemberStates(canonical.party.memberStates, canonical.playerIdentity);
  if (canonical.playerIdentity.chosenClass) {
    canonical.inventory.inventoryItems = createStarterGearInventoryForClass(canonical.playerIdentity.chosenClass);
  }
  return canonical;
}

function createEnemyStatesFromDefeatedIds(defeatedEnemyIds, mapId = currentMapId) {
  const defeated = new Set(normalizeDefeatedEnemyIds(defeatedEnemyIds));
  return createInitialEnemyStates(mapId).filter((enemy) => !defeated.has(enemy.id));
}

function loadSlots() {
  const raw = localStorage.getItem(STORAGE_SAVE_KEY);

  if (!raw) {
    return getDefaultSlots();
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return getDefaultSlots();
    }

    const normalized = [];
    let shouldPersistNormalizedSlots = parsed.length !== SLOT_COUNT;

    for (let index = 0; index < SLOT_COUNT; index += 1) {
      const rawSlot = parsed[index];
      const slotId = index + 1;

      if (!rawSlot) {
        normalized.push(createCanonicalSlot(slotId));
        shouldPersistNormalizedSlots = true;
        continue;
      }

      const isCanonical = rawSlot.metadata && rawSlot.playerIdentity && rawSlot.playerWorldPosition && rawSlot.worldProgress;
      const normalizedSlot = isCanonical ? normalizeCanonicalSlot(rawSlot, slotId) : normalizeLegacySlot(rawSlot, slotId);

      if (!isCanonical || JSON.stringify(rawSlot) !== JSON.stringify(normalizedSlot)) {
        shouldPersistNormalizedSlots = true;
      }

      normalized.push(normalizedSlot);
    }

    if (shouldPersistNormalizedSlots) {
      saveSlots(normalized);
    }

    return normalized;
  } catch (_error) {
    return getDefaultSlots();
  }
}

function saveSlots(slots) {
  persistSlots(STORAGE_SAVE_KEY, slots);
}

function getSlotById(slotId) {
  return loadSlots().find((slot) => slot.metadata.slotId === slotId) || null;
}

function updateSlot(slotId, data) {
  const slots = loadSlots();
  const slotIndex = slots.findIndex((slot) => slot.metadata.slotId === slotId);

  if (slotIndex === -1) {
    return;
  }

  const merged = {
    ...slots[slotIndex],
    ...data,
    metadata: {
      ...slots[slotIndex].metadata,
      ...(data.metadata || {}),
      slotId,
      updatedAt: new Date().toISOString(),
      version: SAVE_SCHEMA_VERSION
    },
    playerIdentity: {
      ...slots[slotIndex].playerIdentity,
      ...(data.playerIdentity || {})
    },
    playerWorldPosition: {
      ...slots[slotIndex].playerWorldPosition,
      ...(data.playerWorldPosition || {})
    },
    worldProgress: {
      ...slots[slotIndex].worldProgress,
      ...(data.worldProgress || {})
    },
    npcStateFlags: {
      ...slots[slotIndex].npcStateFlags,
      ...(data.npcStateFlags || {})
    },
    settings: {
      ...slots[slotIndex].settings,
      ...(data.settings || {})
    },
    party: {
      ...slots[slotIndex].party,
      ...(data.party || {})
    },
    inventory: {
      ...slots[slotIndex].inventory,
      ...(data.inventory || {})
    }
  };

  slots[slotIndex] = normalizeCanonicalSlot(merged, slotId);

  saveSlots(slots);
}

function setDocumentLanguage() {
  const locale = getLocale();
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = locale.dir;
}

function getCurrentTilePosition() {
  return {
    x: playerState.tileX,
    y: playerState.tileY
  };
}

function hasExistingSave(slot) {
  return Boolean(slot && slot.playerIdentity?.chosenElement && slot.playerIdentity?.chosenClass);
}

function renderGameplayInfo() {
  const locale = getLocale();
  textNodes.gameTitle.textContent = locale.gameplayTitle;
  textNodes.gameHelper.textContent = locale.gameplayHelper;

  const slot = currentSlotId ? getSlotById(currentSlotId) : null;
  if (slot && slot.playerIdentity?.chosenElement && slot.playerIdentity?.chosenClass) {
    textNodes.gameSlot.textContent = formatText(locale.gameplaySlot, {
      number: slot.metadata.slotId,
      element: locale[slot.playerIdentity.chosenElement],
      className: locale[slot.playerIdentity.chosenClass]
    });
  } else {
    textNodes.gameSlot.textContent = '';
  }
}

function renderSettingsText() {
  const locale = getLocale();
  const stateLabel = showCoordinates ? locale.on : locale.off;

  textNodes.settingsTitle.textContent = locale.settings;
  textNodes.settingsToggleCoordinates.textContent = `${locale.showCoordinates}: ${stateLabel}`;
  textNodes.settingsBack.textContent = locale.back;
}

function renderInfoDetails() {
  const locale = getLocale();
  const slot = currentSlotId ? getSlotById(currentSlotId) : null;
  const currentPos = getCurrentTilePosition();

  if (!slot) {
    textNodes.infoDetails.textContent = '';
    return;
  }

  const mainMember = getMainPartyMemberState(slot);

  const lines = [
    formatText(locale.infoSlot, { slot: slot.metadata.slotId }),
    formatText(locale.infoElement, {
      element: slot.playerIdentity?.chosenElement ? locale[slot.playerIdentity.chosenElement] : locale.infoNone
    }),
    formatText(locale.infoClass, {
      className: slot.playerIdentity?.chosenClass ? locale[slot.playerIdentity.chosenClass] : locale.infoNone
    }),
    `${locale.levelLabel}: ${mainMember.level}`,
    `${locale.expLabel}: ${mainMember.currentExp} / ${mainMember.expToNextLevel}`,
    `${locale.hp}: ${mainMember.currentHp} / ${effectiveMainMember.maxHp}`,
    `${locale.attack}: ${effectiveMainMember.attack}`,
    `${locale.movementSpeed}: ${effectiveMainMember.movementSpeedTilesPerSecond.toFixed(1)}`,
    formatText(locale.infoCoordinates, { x: currentPos.x, y: currentPos.y })
  ];

  textNodes.infoDetails.textContent = lines.join('\n');
}

function getPartyMemberDisplayName(memberId, locale) {
  if (memberId === MAIN_PARTY_MEMBER_ID) {
    return locale.battleStatusPlayer;
  }

  const companion = COMPANION_DEFINITIONS[memberId];
  if (!companion) {
    return memberId;
  }

  return locale[companion.nameKey] || companion.id;
}

function getPartyMemberSummary(memberId, memberState, locale) {
  if (!memberState) {
    return '';
  }

  const roleKey = memberId === MAIN_PARTY_MEMBER_ID
    ? memberState.className
    : (COMPANION_DEFINITIONS[memberId]?.role === 'vanguard' ? 'companionRoleVanguard' : memberState.className);

  return formatText(locale.partyMemberSummary, {
    level: memberState.level,
    role: locale[roleKey] || memberState.className,
    element: locale[memberState.element] || memberState.element
  });
}

function renderPartyScreen() {
  const locale = getLocale();
  const slot = currentSlotId ? getSlotById(currentSlotId) : null;
  const memberStates = normalizePartyMemberStates(slot?.party?.memberStates, slot?.playerIdentity);
  const activeMemberIds = slot?.party?.activePartyMemberIds || [MAIN_PARTY_MEMBER_ID];
  const recruitedCompanionIds = slot?.party?.recruitedCompanionIds || [];
  const activeCompanionIds = activeMemberIds.filter((memberId) => memberId !== MAIN_PARTY_MEMBER_ID);
  const activeSet = new Set(activeMemberIds);

  partyActiveList.innerHTML = '';
  partyRecruitedList.innerHTML = '';

  const mainPlayerItem = document.createElement('li');
  mainPlayerItem.className = 'party-row';
  mainPlayerItem.textContent = `${locale.battleStatusPlayer} — ${getPartyMemberSummary(MAIN_PARTY_MEMBER_ID, memberStates[MAIN_PARTY_MEMBER_ID], locale)} — ${locale.cannotRemoveMainPlayer}`;
  partyActiveList.append(mainPlayerItem);

  activeCompanionIds.forEach((companionId) => {
    const item = document.createElement('li');
    item.className = 'party-row party-row-removable';

    const label = document.createElement('span');
    label.className = 'party-member-label';
    const memberSummary = getPartyMemberSummary(companionId, memberStates[companionId], locale);
    label.textContent = `${getPartyMemberDisplayName(companionId, locale)} — ${memberSummary}`;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'menu-option party-remove-button';
    removeButton.dataset.removeCompanionId = companionId;
    removeButton.textContent = locale.remove;

    item.append(label, removeButton);
    partyActiveList.append(item);
  });

  recruitedCompanionIds.forEach((companionId) => {
    const item = document.createElement('li');
    item.className = 'party-row';
    const statusKey = activeSet.has(companionId) ? 'activeLabel' : 'reserveLabel';
    const memberSummary = getPartyMemberSummary(companionId, memberStates[companionId], locale);
    item.textContent = `${getPartyMemberDisplayName(companionId, locale)} — ${memberSummary} — ${locale[statusKey]}`;
    partyRecruitedList.append(item);
  });

  textNodes.partyActiveEmpty.textContent = activeCompanionIds.length ? '' : locale.noRemovableCompanions;
  textNodes.partyRecruitedEmpty.textContent = recruitedCompanionIds.length ? '' : locale.noCompanionsRecruited;
}

function getEquipmentSlotLabelKey(slotType, className) {
  if (slotType === EQUIPMENT_SLOT_TYPES.HEAD_OR_ARMOR) {
    return className === 'mage' ? 'gearHat' : 'gearArmour';
  }
  if (slotType === EQUIPMENT_SLOT_TYPES.WEAPON) {
    return className === 'mage' ? 'gearStaff' : 'gearSword';
  }
  return className === 'mage' ? 'gearCape' : 'gearBoots';
}

function renderInventoryScreen() {
  const locale = getLocale();
  const slot = currentSlotId ? getSlotById(currentSlotId) : null;
  inventoryList.innerHTML = '';

  if (!slot) {
    textNodes.inventoryHelper.textContent = locale.inventoryEmpty;
    textNodes.inventoryStats.textContent = '';
    return;
  }

  const className = slot.playerIdentity?.chosenClass || 'warrior';
  const inventory = getSlotInventory(slot);
  const mainMember = getMainPartyMemberState(slot);
  const effectiveMainMember = getEffectiveMemberStats(mainMember, slot);

  textNodes.inventoryHelper.textContent = locale.equipmentTitle;
  textNodes.inventoryStats.textContent = `${locale.hp}: ${effectiveMainMember.maxHp} • ${locale.attack}: ${effectiveMainMember.attack} • ${locale.movementSpeed}: ${effectiveMainMember.movementSpeedTilesPerSecond.toFixed(1)}`;

  EQUIPMENT_SLOT_ORDER.forEach((slotType) => {
    const equippedItemId = inventory.equippedGear[slotType];
    const equippedItem = GEAR_ITEM_DEFINITIONS[equippedItemId];
    const row = document.createElement('li');
    row.className = 'party-row';

    const slotLabel = document.createElement('p');
    slotLabel.textContent = `${locale[getEquipmentSlotLabelKey(slotType, className)]}: ${equippedItem ? locale[equippedItem.nameKey] : locale.empty}`;
    row.append(slotLabel);

    inventory.inventoryItems.forEach((itemId) => {
      const item = GEAR_ITEM_DEFINITIONS[itemId];
      if (!item || item.slotType !== slotType || !item.allowedClasses.includes(className)) {
        return;
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'menu-option party-remove-button';
      button.dataset.equipSlotType = slotType;
      button.dataset.equipItemId = item.itemId;
      button.textContent = `${locale.equip}: ${locale[item.nameKey]}`;
      if (equippedItemId === item.itemId) {
        button.disabled = true;
      }
      row.append(button);
    });

    inventoryList.append(row);
  });
}

function handleEquipItem(slotType, itemId) {
  if (!currentSlotId) {
    return;
  }

  const slot = getSlotById(currentSlotId);
  if (!slot) {
    return;
  }

  const className = slot.playerIdentity?.chosenClass || 'warrior';
  const inventory = getSlotInventory(slot);
  const allowed = canEquipItemForSlot({
    className,
    slotType,
    itemId,
    ownedGearItemIds: inventory.inventoryItems
  });

  if (!allowed) {
    return;
  }

  updateSlot(currentSlotId, {
    inventory: {
      inventoryItems: inventory.inventoryItems,
      equippedGear: {
        ...inventory.equippedGear,
        [slotType]: itemId
      }
    }
  });

  const updatedSlot = getSlotById(currentSlotId);
  const updatedMainMember = getMainPartyMemberState(updatedSlot);
  updateMainPartyMemberHp(currentSlotId, Math.min(updatedMainMember.currentHp, getEffectiveMemberStats(updatedMainMember, updatedSlot).maxHp));
  renderInventoryScreen();
  renderInfoDetails();
}

function removeCompanionFromActiveParty(companionId) {
  if (!currentSlotId || !companionId || !COMPANION_DEFINITIONS[companionId]) {
    return;
  }

  const slot = getSlotById(currentSlotId);
  if (!slot) {
    return;
  }

  const activePartyMemberIds = (slot.party?.activePartyMemberIds || [MAIN_PARTY_MEMBER_ID])
    .filter((memberId) => memberId !== companionId);
  const companionWorldStateFlags = {
    ...(slot.party?.companionWorldStateFlags || {}),
    [companionId]: 'at_origin_pending_spawn'
  };

  updateSlot(currentSlotId, {
    party: {
      activePartyMemberIds,
      companionWorldStateFlags
    }
  });

  renderPartyScreen();
}



function matchesDialogueConditions(node, slot) {
  if (!node?.conditions) {
    return true;
  }

  if (node.conditions.storyModeChoice && slot?.playerIdentity?.storyModeChoice !== node.conditions.storyModeChoice) {
    return false;
  }

  return true;
}

function getCurrentDialogueNode() {
  if (!dialogueState.nodeId) {
    return null;
  }

  if (dialogueState.scriptedNodes) {
    return dialogueState.scriptedNodes[dialogueState.nodeId] || null;
  }

  if (!dialogueState.npcId) {
    return null;
  }

  const dialogueDef = DIALOGUE_DEFINITIONS_BY_NPC_ID[dialogueState.npcId];
  if (!dialogueDef) {
    return null;
  }

  return dialogueDef.nodes[dialogueState.nodeId] || null;
}

function createCompanionMemberState(companionId) {
  const companion = COMPANION_DEFINITIONS[companionId];
  if (!companion) {
    return null;
  }

  return {
    id: companion.id,
    className: companion.className,
    element: companion.element,
    level: 1,
    currentExp: 0,
    expToNextLevel: getExpRequirementForLevel(1),
    attack: getAttackForClass(companion.className),
    currentHp: getMaxHpForClass(companion.className),
    maxHp: getMaxHpForClass(companion.className)
  };
}

function applyRecruitmentEffects(effects, slot) {
  const companionId = effects.recruitCompanionId;
  if (!companionId || !COMPANION_DEFINITIONS[companionId]) {
    return {
      recruitedCompanionIds: slot.party?.recruitedCompanionIds || [],
      activePartyMemberIds: slot.party?.activePartyMemberIds || [MAIN_PARTY_MEMBER_ID],
      memberStates: normalizePartyMemberStates(slot.party?.memberStates, slot.playerIdentity),
      companionWorldStateFlags: slot.party?.companionWorldStateFlags || {},
      npcStateFlags: slot.npcStateFlags || {}
    };
  }

  const recruitedCompanionIds = new Set(slot.party?.recruitedCompanionIds || []);
  const activePartyMemberIds = [...(slot.party?.activePartyMemberIds || [MAIN_PARTY_MEMBER_ID])];
  const memberStates = normalizePartyMemberStates(slot.party?.memberStates, slot.playerIdentity);
  const companionWorldStateFlags = {
    ...(slot.party?.companionWorldStateFlags || {})
  };
  const npcStateFlags = { ...(slot.npcStateFlags || {}) };

  recruitedCompanionIds.add(companionId);

  if (!activePartyMemberIds.includes(companionId) && activePartyMemberIds.length < MAX_ACTIVE_PARTY_SIZE) {
    activePartyMemberIds.push(companionId);
  }

  const companionState = memberStates[companionId] || createCompanionMemberState(companionId);
  if (companionState && !memberStates[companionId]) {
    memberStates[companionId] = companionState;
  }

  companionWorldStateFlags[companionId] = 'following_player';

  if (effects.recruitNpcFlag) {
    npcStateFlags[effects.recruitNpcFlag] = true;
  }

  return {
    recruitedCompanionIds: [...recruitedCompanionIds],
    activePartyMemberIds,
    memberStates,
    companionWorldStateFlags,
    npcStateFlags
  };
}

function applyDialogueEffects(effects) {
  if (!effects || !currentSlotId) {
    return;
  }

  const slot = getSlotById(currentSlotId);
  if (!slot) {
    return;
  }

  const keyIds = new Set(slot.worldProgress?.obtainedKeyIds || []);

  if (Array.isArray(effects.removeKeyIds)) {
    effects.removeKeyIds.forEach((keyId) => keyIds.delete(keyId));
  }

  if (effects.grantKeyId) {
    keyIds.add(effects.grantKeyId);
  }

  const recruitmentState = effects.recruitCompanionId ? applyRecruitmentEffects(effects, slot) : {
    recruitedCompanionIds: slot.party?.recruitedCompanionIds || [],
    activePartyMemberIds: slot.party?.activePartyMemberIds || [MAIN_PARTY_MEMBER_ID],
    memberStates: normalizePartyMemberStates(slot.party?.memberStates, slot.playerIdentity),
    companionWorldStateFlags: slot.party?.companionWorldStateFlags || {},
    npcStateFlags: slot.npcStateFlags || {}
  };

  const healedMemberStates = effects.healActiveParty
    ? healMemberStatesToFull(recruitmentState.memberStates, getHealingTargetMemberIds(recruitmentState.activePartyMemberIds))
    : recruitmentState.memberStates;

  updateSlot(currentSlotId, {
    playerIdentity: {
      storyModeChoice: effects.setStoryModeChoice || slot.playerIdentity.storyModeChoice
    },
    worldProgress: {
      obtainedKeyIds: [...keyIds],
      triggeredEventFlags: {
        ...(slot.worldProgress?.triggeredEventFlags || {}),
        ...(effects.eventFlags || {})
      }
    },
    npcStateFlags: {
      ...recruitmentState.npcStateFlags,
      ...(effects.npcFlags || {})
    },
    party: {
      recruitedCompanionIds: recruitmentState.recruitedCompanionIds,
      activePartyMemberIds: recruitmentState.activePartyMemberIds,
      memberStates: healedMemberStates,
      companionWorldStateFlags: recruitmentState.companionWorldStateFlags
    }
  });

  if (effects.recruitNpcId) {
    npcStates = npcStates.filter((npc) => npc.id !== effects.recruitNpcId);
    buildGrid();
  }
}

function completeDialogueAndReturnToMap() {
  const onComplete = dialogueState.onComplete;
  dialogueState.npcId = null;
  dialogueState.nodeId = null;
  dialogueState.scriptedNodes = null;
  dialogueState.scriptedSpeakerKey = null;
  dialogueState.onComplete = null;

  if (typeof onComplete === 'function') {
    onComplete();
    return;
  }

  renderGameplayInfo();
  showScreen('game');
}

function selectDialogueChoice(choiceId) {
  const node = getCurrentDialogueNode();
  if (!node || !Array.isArray(node.choices)) {
    return;
  }

  const choice = node.choices.find((entry) => entry.id === choiceId);
  if (!choice) {
    return;
  }

  applyDialogueEffects(choice.effects);
  dialogueState.nodeId = choice.nextNodeId || null;

  const nextNode = getCurrentDialogueNode();
  if (!nextNode) {
    completeDialogueAndReturnToMap();
    return;
  }

  applyDialogueEffects(nextNode.effects);
  renderDialogueUI();
}

function renderDialogueUI() {
  const locale = getLocale();
  const line = getCurrentDialogueNode();

  textNodes.dialogueTitle.textContent = locale.dialogueTitle;
  textNodes.dialogueHelper.textContent = line?.choices?.length ? locale.dialogueSelectAnswer : locale.dialogueTapToContinue;

  textNodes.dialogueChoices.innerHTML = '';

  if (!line) {
    textNodes.dialogueSpeaker.textContent = '';
    textNodes.dialogueLine.textContent = '';
    return;
  }

  const activeNpc = npcStates.find((npc) => npc.id === dialogueState.npcId);
  const npcNameKey = dialogueState.scriptedSpeakerKey || activeNpc?.nameKey || 'npcGuide';
  const speakerName = line.speaker === 'player' ? locale.dialoguePlayerLabel : (locale[npcNameKey] || locale.npcGuide);
  textNodes.dialogueSpeaker.textContent = speakerName;
  textNodes.dialogueLine.textContent = locale[line.textKey];

  const playerActive = line.speaker === 'player';
  dialogueArea.classList.toggle('speaker-player', playerActive);
  dialogueArea.classList.toggle('speaker-npc', !playerActive);

  const slot = currentSlotId ? getSlotById(currentSlotId) : null;
  const playerClassName = slot?.playerIdentity?.chosenClass || 'warrior';
  dialoguePlayerAvatar.classList.remove('portrait--warrior', 'portrait--mage');
  dialoguePlayerAvatar.classList.add(`portrait--${playerClassName}`);

  if (Array.isArray(line.choices)) {
    line.choices.forEach((choice) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'menu-option dialogue-choice';
      button.dataset.choiceId = choice.id;
      button.textContent = locale[choice.textKey] || choice.textKey;
      item.append(button);
      textNodes.dialogueChoices.append(item);
    });
  }
}

function enterDialogueMode(npc) {
  if (!npc || !currentSlotId) {
    return;
  }

  const dialogueDef = DIALOGUE_DEFINITIONS_BY_NPC_ID[npc.id];
  if (!dialogueDef) {
    return;
  }

  const slot = getSlotById(currentSlotId);
  const startNodeId = dialogueDef.getStartNodeId(slot);
  const startNode = dialogueDef.nodes[startNodeId];

  if (!startNode || !matchesDialogueConditions(startNode, slot)) {
    return;
  }

  dialogueState.npcId = npc.id;
  dialogueState.nodeId = startNodeId;
  dialogueState.scriptedNodes = null;
  dialogueState.scriptedSpeakerKey = null;
  dialogueState.onComplete = null;
  renderDialogueUI();
  showScreen('dialogue');
}

function advanceDialogue() {
  if (screens.dialogue.hidden) {
    return;
  }

  const node = getCurrentDialogueNode();
  if (!node || (Array.isArray(node.choices) && node.choices.length > 0)) {
    return;
  }

  if (!node.nextNodeId) {
    completeDialogueAndReturnToMap();
    return;
  }

  dialogueState.nodeId = node.nextNodeId;
  const nextNode = getCurrentDialogueNode();

  if (!nextNode) {
    completeDialogueAndReturnToMap();
    return;
  }

  applyDialogueEffects(nextNode.effects);
  renderDialogueUI();
}

function createEnemyForBattle(enemy) {
  return {
    id: enemy.id,
    species: enemy.species || 'slime',
    nameKey: enemy.nameKey,
    element: enemy.element,
    maxHp: enemy.maxHp,
    hp: enemy.hp,
    attack: enemy.attack,
    drops: { ...enemy.drops },
    skills: enemy.skills.map((skill) => ({ ...skill })),
    expReward: enemy.expReward || 0
  };
}

function getPlayerStatsByClass(className) {
  return PLAYER_CLASS_STATS[className] || PLAYER_CLASS_STATS.warrior;
}

function getPlayerOffensiveSkills(className, element) {
  const baseSkillIds = { warrior: 'sword_slash', mage: 'stick_bonk' };
  const elementalSkillIds = {
    warrior: { fire: 'fire_slash', water: 'water_slash', earth: 'earth_slash' },
    mage: { fire: 'fire_ball', water: 'water_ball', earth: 'earth_ball' }
  };
  const baseSkill = SKILL_DEFINITIONS[baseSkillIds[className]];
  const elementalSkill = SKILL_DEFINITIONS[elementalSkillIds[className]?.[element]];
  return [baseSkill, elementalSkill].filter(Boolean).map((skill) => ({ ...skill }));
}

function createPlayerBattleData(slot) {
  const mainMember = getMainPartyMemberState(slot);
  const effectiveMainMember = getEffectiveMemberStats(mainMember, slot);
  const chosenClass = mainMember.className || slot.playerIdentity?.chosenClass || 'warrior';
  const chosenElement = mainMember.element || slot.playerIdentity?.chosenElement || 'fire';

  return {
    class: chosenClass,
    element: chosenElement,
    level: mainMember.level,
    currentExp: mainMember.currentExp,
    expToNextLevel: mainMember.expToNextLevel,
    maxHp: effectiveMainMember.maxHp,
    hp: Math.max(0, Math.min(effectiveMainMember.maxHp, mainMember.currentHp)),
    attack: effectiveMainMember.attack,
    skills: getPlayerOffensiveSkills(chosenClass, chosenElement)
  };
}

function getCompanionOffensiveSkills(companionId) {
  const companion = COMPANION_DEFINITIONS[companionId];
  if (!companion) {
    return [];
  }

  return (companion.skillIds || [])
    .map((skillId) => SKILL_DEFINITIONS[skillId])
    .filter(Boolean)
    .map((skill) => ({ ...skill }));
}

function createCompanionBattleData(companionId, memberState) {
  const companion = COMPANION_DEFINITIONS[companionId];
  if (!companion || !memberState) {
    return null;
  }

  return {
    id: companionId,
    nameKey: companion.nameKey,
    role: companion.role,
    class: memberState.className,
    element: memberState.element,
    level: memberState.level,
    currentExp: memberState.currentExp,
    expToNextLevel: memberState.expToNextLevel,
    maxHp: memberState.maxHp,
    hp: memberState.currentHp,
    attack: memberState.attack,
    skills: getCompanionOffensiveSkills(companionId)
  };
}

function createBattlePartyData(slot) {
  return createBattlePartyDataFromPartySystem(slot, {
    normalizePartyMemberStates,
    createPlayerBattleData,
    createCompanionBattleData
  });
}

function updateMainPartyMemberHp(slotId, currentHp) {
  const slot = getSlotById(slotId);
  if (!slot) {
    return;
  }

  const currentMainState = getMainPartyMemberState(slot);
  const effectiveMaxHp = getEffectiveMemberStats(currentMainState, slot).maxHp;
  const normalizedHp = Math.max(0, Math.min(effectiveMaxHp, Math.floor(currentHp)));

  updateSlot(slotId, {
    party: {
      activePartyMemberIds: slot.party?.activePartyMemberIds || [MAIN_PARTY_MEMBER_ID],
      memberStates: {
        ...(slot.party?.memberStates || {}),
        [MAIN_PARTY_MEMBER_ID]: {
          ...currentMainState,
          currentHp: normalizedHp
        }
      }
    }
  });
}

function updatePartyBattleMemberHp(slotId, partyMembers = []) {
  updatePartyBattleMemberHpFromPartySystem(slotId, partyMembers, {
    getSlotById,
    updateSlot,
    normalizePartyMemberStates
  });
}

function getFirstActiveCompanionBattler() {
  return getFirstActiveCompanionBattlerFromPartySystem(battleState.partyMembers);
}

function addBattleFeedbackEntry(key, params = {}) {
  battleState.feedbackEntries.push({ key, params });
}

function applyExperienceGain(memberState, expAmount) {
  const gainedExp = Math.max(0, Math.floor(expAmount));
  if (!gainedExp) {
    return { updatedState: memberState, levelsGained: 0 };
  }

  const updatedState = {
    ...memberState,
    currentExp: memberState.currentExp + gainedExp
  };
  let levelsGained = 0;

  while (updatedState.currentExp >= updatedState.expToNextLevel) {
    updatedState.currentExp -= updatedState.expToNextLevel;
    updatedState.level += 1;
    levelsGained += 1;

    const growth = getClassGrowth(updatedState.className);
    updatedState.maxHp += growth.hp;
    updatedState.currentHp = Math.min(updatedState.maxHp, updatedState.currentHp + growth.hp);
    updatedState.attack += growth.attack;
    updatedState.expToNextLevel = getExpRequirementForLevel(updatedState.level);
  }

  return { updatedState, levelsGained };
}

function grantBattleExpToActiveParty(slotId, expAmount) {
  const slot = getSlotById(slotId);
  if (!slot) {
    return {
      gainedExp: 0,
      levelsGainedByMemberId: {},
      updatedMemberStatesById: {},
      memberState: null
    };
  }

  const activeIds = slot.party?.activePartyMemberIds?.length ? slot.party.activePartyMemberIds : [MAIN_PARTY_MEMBER_ID];
  const gainedExp = Math.max(0, Math.floor(expAmount));
  const memberStates = normalizePartyMemberStates(slot.party?.memberStates, slot.playerIdentity);
  const levelsGainedByMemberId = {};
  const updatedMemberStatesById = {};

  activeIds.forEach((memberId) => {
    const memberState = memberStates[memberId];
    if (!memberState) {
      return;
    }

    const progressionResult = applyExperienceGain(memberState, gainedExp);
    memberStates[memberId] = progressionResult.updatedState;
    levelsGainedByMemberId[memberId] = progressionResult.levelsGained;
    updatedMemberStatesById[memberId] = progressionResult.updatedState;
  });

  updateSlot(slotId, {
    party: {
      activePartyMemberIds: activeIds,
      memberStates
    }
  });

  return {
    gainedExp,
    levelsGainedByMemberId,
    updatedMemberStatesById,
    memberState: memberStates[MAIN_PARTY_MEMBER_ID]
  };
}

function buildBattleProgressSummary(activeMemberIds, progressionResult) {
  const gainedExp = progressionResult?.gainedExp || 0;
  if (!activeMemberIds?.length || !gainedExp) {
    return [];
  }

  return activeMemberIds
    .filter((memberId) => Boolean(progressionResult.updatedMemberStatesById?.[memberId]))
    .map((memberId) => {
      const updatedState = progressionResult.updatedMemberStatesById[memberId];
      return {
        memberId,
        gainedExp,
        levelsGained: progressionResult.levelsGainedByMemberId?.[memberId] || 0,
        newLevel: updatedState.level
      };
    });
}

function getHealingTargetMemberIds(activePartyMemberIds = []) {
  return [...new Set([MAIN_PARTY_MEMBER_ID, ...(activePartyMemberIds || [])])];
}

function healMemberStatesToFull(memberStates, memberIds) {
  const healedMemberStates = { ...memberStates };
  memberIds.forEach((memberId) => {
    const member = healedMemberStates[memberId];
    if (!member) {
      return;
    }
    healedMemberStates[memberId] = {
      ...member,
      currentHp: member.maxHp
    };
  });
  return healedMemberStates;
}

function healActivePartyToFull(slotId) {
  const slot = getSlotById(slotId);
  if (!slot) {
    return false;
  }

  const activeIds = getHealingTargetMemberIds(slot.party?.activePartyMemberIds || []);
  const memberStates = normalizePartyMemberStates(slot.party?.memberStates, slot.playerIdentity);
  const healedMemberStates = healMemberStatesToFull(memberStates, activeIds);

  updateSlot(slotId, {
    party: {
      activePartyMemberIds: slot.party?.activePartyMemberIds || [MAIN_PARTY_MEMBER_ID],
      memberStates: healedMemberStates
    }
  });

  return true;
}

function clampHp(value) {
  return Math.max(0, value);
}

function calculateSkillDamage(attack, multiplier) {
  return attack * multiplier;
}

function getElementalOutcome(attackElement, targetElement) {
  if (attackElement === 'none' || !ELEMENTAL_ADVANTAGE[attackElement] || !targetElement) {
    return { modifier: 1, feedbackKey: null };
  }

  if (ELEMENTAL_ADVANTAGE[attackElement] === targetElement) {
    if (Math.random() < 0.5) {
      return { modifier: 2, feedbackKey: 'critical' };
    }

    return { modifier: 1, feedbackKey: null };
  }

  if (ELEMENTAL_ADVANTAGE[targetElement] === attackElement) {
    if (Math.random() < 0.5) {
      return { modifier: 0.5, feedbackKey: 'resisted' };
    }

    return { modifier: 1, feedbackKey: null };
  }

  return { modifier: 1, feedbackKey: null };
}

function calculateDamageWithElement(attacker, skill, target) {
  const baseDamage = calculateSkillDamage(attacker.attack, skill.damageMultiplier);
  const elementalOutcome = getElementalOutcome(skill.elementType, target.element);
  const finalDamage = Math.floor(baseDamage * elementalOutcome.modifier);

  return {
    damage: finalDamage,
    feedbackKey: elementalOutcome.feedbackKey
  };
}

function getHpRatio(currentHp, maxHp) {
  if (maxHp <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(1, currentHp / maxHp));
}

function getHpFillColor(ratio) {
  const hue = Math.round(ratio * 120);
  return `hsl(${hue} 80% 45%)`;
}

function updateHpBar(fillNode, currentHp, maxHp) {
  const ratio = getHpRatio(currentHp, maxHp);

  fillNode.style.width = `${ratio * 100}%`;
  fillNode.style.backgroundColor = getHpFillColor(ratio);
}

function resolveDropMessage(enemy) {
  if (!enemy?.drops || enemy.drops.type === 'none' || !enemy.drops.itemKey) {
    return { key: 'obtainedNothing', itemKey: null };
  }

  return { key: 'obtainedItem', itemKey: enemy.drops.itemKey };
}

function endBattleVictory() {
  if (currentSlotId) {
    updatePartyBattleMemberHp(currentSlotId, battleState.partyMembers);
  }

  const dropResult = resolveDropMessage(battleState.enemy);

  if (battleState.enemyId) {
    enemyStates = enemyStates.filter((enemy) => enemy.id !== battleState.enemyId);
  }

  battleState.resultExpGained = battleState.enemy?.expReward || 0;
  battleState.resultLevelUps = 0;
  battleState.resultPartyProgress = [];

  if (currentSlotId) {
    const slot = getSlotById(currentSlotId);
    const activeMemberIds = slot?.party?.activePartyMemberIds?.length
      ? slot.party.activePartyMemberIds
      : [MAIN_PARTY_MEMBER_ID];
    const progressionResult = grantBattleExpToActiveParty(currentSlotId, battleState.resultExpGained);
    battleState.resultExpGained = progressionResult.gainedExp;
    battleState.resultLevelUps = progressionResult.levelsGainedByMemberId[MAIN_PARTY_MEMBER_ID] || 0;
    battleState.resultPartyProgress = buildBattleProgressSummary(activeMemberIds, progressionResult);

    const defeatedEnemyIds = getDefeatedEnemyIdsFromCurrentState();
    synchronizeStarterDoorProgress(currentSlotId, defeatedEnemyIds);
    const newlyUnlockedFirstEnemyMedal = unlockMedal(currentSlotId, 'medal_first_enemy');
    if (newlyUnlockedFirstEnemyMedal) {
      battleState.feedbackEntries = [{ key: 'medalUnlockedFirstEnemy', params: {} }];
    }
  }

  battleState.resultMessageKey = dropResult.key;
  battleState.resultItemKey = dropResult.itemKey;
  battleState.menu = BATTLE_MENUS.ROOT;

  buildGrid();
  renderVictoryScreen();
  showScreen('victory');
}

function endBattleDefeat() {
  if (currentSlotId) {
    updatePartyBattleMemberHp(currentSlotId, battleState.partyMembers);
  }

  battleState.menu = BATTLE_MENUS.ROOT;
  renderDefeatScreen();
  showScreen('defeat');
}

function applyPlayerSkill(skillIndex) {
  const enemy = battleState.enemy;
  const player = battleState.player;
  const companion = getFirstActiveCompanionBattler();
  const skill = player?.skills?.[skillIndex];

  if (!enemy || !player || !skill) {
    return;
  }

  battleState.feedbackEntries = [];

  const playerAttackResult = calculateDamageWithElement(player, skill, enemy);
  enemy.hp = clampHp(enemy.hp - playerAttackResult.damage);
  addBattleFeedbackEntry('battleActionLine', {
    actor: getLocale().battleStatusPlayer,
    skill: getLocale()[skill.nameKey] || skill.id,
    target: getLocale()[enemy.nameKey] || enemy.nameKey,
    damage: playerAttackResult.damage
  });
  if (playerAttackResult.feedbackKey) {
    addBattleFeedbackEntry(playerAttackResult.feedbackKey);
  }

  if (enemy.hp <= 0) {
    renderBattleUI();
    endBattleVictory();
    return;
  }

  if (companion) {
    resolveCompanionAction({
      companion,
      enemy,
      locale: getLocale(),
      calculateDamageWithElement,
      addBattleFeedbackEntry,
      getPartyMemberDisplayName
    });
  }

  if (enemy.hp <= 0) {
    renderBattleUI();
    endBattleVictory();
    return;
  }

  const enemySkill = enemy.skills[0];
  resolveEnemyActionAgainstPlayer({
    enemy,
    enemySkill,
    player,
    locale: getLocale(),
    calculateDamageWithElement,
    addBattleFeedbackEntry
  });

  if (player.hp <= 0) {
    renderBattleUI();
    endBattleDefeat();
    return;
  }

  battleState.menu = BATTLE_MENUS.ROOT;
  renderBattleUI();
}

function getBattleMenuOptions() {
  if (battleState.menu === BATTLE_MENUS.ROOT) {
    return [
      { key: 'fight', action: 'openFightCategories' },
      { key: 'run', action: 'run' }
    ];
  }

  if (battleState.menu === BATTLE_MENUS.FIGHT_CATEGORIES) {
    return [
      { key: 'offensive', action: 'openOffensive' },
      { key: 'defenders', action: 'openDefenders' },
      { key: 'back', action: 'backToRoot' }
    ];
  }

  if (battleState.menu === BATTLE_MENUS.OFFENSIVE || battleState.menu === BATTLE_MENUS.DEFENDERS) {
    return [{ key: 'back', action: 'backToCategories' }];
  }

  return [];
}

function getSkillElementLabel(skill, locale) {
  if (skill.elementType === 'none') {
    return locale.nonElemental;
  }

  return locale[skill.elementType];
}

function renderBattleUI() {
  if (!textNodes.battleEnemyName) {
    return;
  }

  const locale = getLocale();
  const enemy = battleState.enemy;
  const player = battleState.player;
  const companion = getFirstActiveCompanionBattler();
  const companionCount = companion ? 1 : 0;

  if (!enemy || !player) {
    textNodes.battleEnemyName.textContent = '';
    textNodes.battleEnemyStats.textContent = '';
    textNodes.battleEnemyHp.textContent = '';
    textNodes.battlePlayerName.textContent = '';
    textNodes.battlePlayerStats.textContent = '';
    textNodes.battlePlayerHp.textContent = '';
    updateHpBar(textNodes.battleEnemyHpFill, 0, 1);
    updateHpBar(textNodes.battlePlayerHpFill, 0, 1);
    textNodes.battleCompanionName.textContent = '';
    textNodes.battleCompanionStats.textContent = '';
    textNodes.battleCompanionHp.textContent = '';
    updateHpBar(textNodes.battleCompanionHpFill, 0, 1);
    textNodes.battleSubtitle.textContent = '';
    battleOptionsList.innerHTML = '';
    const battleEnemyPiece = document.querySelector('.battle-enemy');
    if (battleEnemyPiece) {
      battleEnemyPiece.classList.remove('battle-enemy-fire', 'battle-enemy-earth', 'battle-enemy-water');
      battleEnemyPiece.innerHTML = '';
    }

    const battlePlayerPiece = document.querySelector('.battle-player');
    if (battlePlayerPiece) {
      battlePlayerPiece.classList.remove('battle-player-warrior', 'battle-player-mage');
    }

    const battleCharacter = document.querySelector('.battle-player .character');
    if (battleCharacter) {
      battleCharacter.classList.remove('character--warrior', 'character--mage');
    }

    const slimePiece = document.querySelector('.battle-enemy .slime');
    if (slimePiece) {
      slimePiece.classList.remove('slime--fire', 'slime--earth', 'slime--water');
    }
    return;
  }

  textNodes.battleEnemyName.textContent = locale[enemy.nameKey];

  const battleEnemyPiece = document.querySelector('.battle-enemy');
  if (battleEnemyPiece) {
    battleEnemyPiece.classList.remove('battle-enemy-fire', 'battle-enemy-earth', 'battle-enemy-water');
    battleEnemyPiece.classList.add(`battle-enemy-${enemy.element}`);
    battleEnemyPiece.innerHTML = getBattleEnemyMarkup(enemy.species, enemy.element);
  }

  const battlePlayerPiece = document.querySelector('.battle-player');
  if (battlePlayerPiece) {
    battlePlayerPiece.classList.remove('battle-player-warrior', 'battle-player-mage');
    battlePlayerPiece.classList.add(`battle-player-${player.class}`);
  }

  const battleCharacter = document.querySelector('.battle-player .character');
  if (battleCharacter) {
    battleCharacter.classList.remove('character--warrior', 'character--mage');
    battleCharacter.classList.add(`character--${player.class}`);
  }

  textNodes.battleEnemyStats.textContent = `${locale.attack}: ${enemy.attack}`;
  textNodes.battleEnemyHp.textContent = `${locale.hp}: ${enemy.hp} / ${enemy.maxHp}`;
  textNodes.battlePlayerName.textContent = locale.battleStatusPlayer;
  textNodes.battlePlayerStats.textContent = `${locale.classLabel}: ${locale[player.class]} • ${locale.attack}: ${player.attack}`;
  textNodes.battlePlayerHp.textContent = `${locale.hp}: ${player.hp} / ${player.maxHp}`;

  if (companion) {
    textNodes.battleCompanionName.textContent = getPartyMemberDisplayName(companion.id, locale);
    textNodes.battleCompanionStats.textContent = `${locale.classLabel}: ${locale[companion.class] || companion.class} • ${locale.attack}: ${companion.attack}`;
    textNodes.battleCompanionHp.textContent = `${locale.hp}: ${companion.hp} / ${companion.maxHp}`;
  } else {
    textNodes.battleCompanionName.textContent = locale.noActiveCompanion;
    textNodes.battleCompanionStats.textContent = '';
    textNodes.battleCompanionHp.textContent = '';
  }

  updateHpBar(textNodes.battleEnemyHpFill, enemy.hp, enemy.maxHp);
  updateHpBar(textNodes.battlePlayerHpFill, player.hp, player.maxHp);
  updateHpBar(textNodes.battleCompanionHpFill, companion?.hp || 0, companion?.maxHp || 1);

  textNodes.battleSubtitle.textContent = buildBattleSubtitle({
    locale,
    feedbackEntries: battleState.feedbackEntries,
    menu: battleState.menu,
    companionCount,
    battleMenus: BATTLE_MENUS
  });

  battleOptionsList.innerHTML = '';

  if (battleState.menu === BATTLE_MENUS.OFFENSIVE) {
    player.skills.filter((skill) => skill.category === 'offensive').forEach((skill, skillIndex) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      const name = document.createElement('span');
      const meta = document.createElement('span');

      button.type = 'button';
      button.className = 'menu-option';
      button.dataset.action = `skill:${skillIndex}`;
      name.className = 'battle-skill-name';
      meta.className = 'battle-skill-meta';

      name.textContent = locale[skill.nameKey];
      meta.textContent = `${formatText(locale.skillDamage, { percent: skill.damageMultiplier * 100 })} • ${formatText(locale.elementLabel, { element: getSkillElementLabel(skill, locale) })}`;

      button.append(name, meta);
      li.append(button);
      battleOptionsList.append(li);
    });
  }

  getBattleMenuOptions().forEach((option) => {
    const li = document.createElement('li');
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'menu-option';
    button.dataset.action = option.action;
    button.textContent = locale[option.key];

    li.append(button);
    battleOptionsList.append(li);
  });
}

function renderVictoryScreen() {
  const locale = getLocale();
  const lines = [];

  textNodes.victoryTitle.textContent = locale.battleResultVictory;

  if (battleState.resultMessageKey === 'obtainedItem' && battleState.resultItemKey) {
    lines.push(formatText(locale.obtainedItem, {
      item: locale[battleState.resultItemKey] || battleState.resultItemKey
    }));
  } else {
    lines.push(locale.obtainedNothing);
  }

  lines.push(formatText(locale.gainedExp, { amount: battleState.resultExpGained || 0 }));

  if (battleState.resultLevelUps > 0) {
    lines.push(locale.levelUp);
  }

  battleState.resultPartyProgress
    .filter((entry) => entry.memberId !== MAIN_PARTY_MEMBER_ID)
    .forEach((entry) => {
      const companionName = getPartyMemberDisplayName(entry.memberId, locale);
      lines.push(formatText(locale.companionGainedExp, {
        companion: companionName,
        amount: entry.gainedExp
      }));

      if (entry.levelsGained > 0) {
        lines.push(formatText(locale.companionLevelUp, {
          companion: companionName,
          level: entry.newLevel
        }));
      }
    });

  textNodes.victoryMessage.textContent = lines.join('\n');

  textNodes.victoryContinue.textContent = locale.continueToGrid;
}

function renderDefeatScreen() {
  const locale = getLocale();

  textNodes.defeatTitle.textContent = locale.battleResultDefeat;
  textNodes.defeatMainMenu.textContent = locale.returnToMainMenu;
}

function renderStaticText() {
  const locale = getLocale();

  textNodes.languageTitle.textContent = locale.languageTitle;
  textNodes.languageSubtitle.textContent = locale.languageSubtitle;
  textNodes.menuTitle.textContent = locale.menuTitle;
  textNodes.menuInstruction.textContent = locale.menuInstruction;
  textNodes.menuPlay.textContent = locale.play;
  textNodes.menuMedals.textContent = locale.medals;
  textNodes.menuBack.textContent = locale.back;
  textNodes.saveTitle.textContent = locale.saveTitle;
  textNodes.saveSubtitle.textContent = locale.saveSubtitle;
  textNodes.saveBack.textContent = locale.back;
  textNodes.medalsTitle.textContent = locale.medals;
  textNodes.medalsBack.textContent = locale.back;
  textNodes.elementTitle.textContent = locale.elementQuestion;
  textNodes.elementBack.textContent = locale.back;
  textNodes.classTitle.textContent = locale.classQuestion;
  textNodes.classBack.textContent = locale.back;
  textNodes.deleteConfirmMessage.textContent = locale.deleteSaveConfirm;
  textNodes.deleteConfirmYes.textContent = locale.yes;
  textNodes.deleteConfirmNo.textContent = locale.no;

  textNodes.openGameMenu.textContent = locale.gameMenu;
  textNodes.battleTitle.textContent = locale.battleTitle;
  textNodes.victoryTitle.textContent = locale.battleResultVictory;
  textNodes.victoryContinue.textContent = locale.continueToGrid;
  textNodes.defeatTitle.textContent = locale.battleResultDefeat;
  textNodes.defeatMainMenu.textContent = locale.returnToMainMenu;
  textNodes.gameMenuTitle.textContent = locale.gameMenu;
  textNodes.gmBackToGame.textContent = locale.backToGame;
  textNodes.gmParty.textContent = locale.party;
  textNodes.gmInventory.textContent = locale.inventory;
  textNodes.gmInfo.textContent = locale.info;
  textNodes.gmSettings.textContent = locale.settings;
  textNodes.gmSave.textContent = locale.save;
  textNodes.gmSaveQuit.textContent = locale.saveQuit;
  textNodes.gmQuit.textContent = locale.quit;
  renderSettingsText();

  textNodes.inventoryTitle.textContent = locale.inventoryTitle;
  textNodes.inventoryHelper.textContent = locale.equipmentTitle;
  textNodes.inventoryStats.textContent = '';
  textNodes.inventoryBack.textContent = locale.back;

  textNodes.partyTitle.textContent = locale.partyTitle;
  textNodes.partyActiveTitle.textContent = locale.activeParty;
  textNodes.partyRecruitedTitle.textContent = locale.recruitedCompanions;
  textNodes.partyBack.textContent = locale.back;

  textNodes.infoTitle.textContent = locale.infoTitle;
  textNodes.infoHelper.textContent = locale.infoPlaceholder;
  textNodes.infoBack.textContent = locale.back;

  textNodes.gameMenuStatus.textContent = gameMenuStatusKey ? locale[gameMenuStatusKey] : '';

  elementButtons.forEach((button) => {
    button.textContent = locale[button.dataset.element];
  });

  classButtons.forEach((button) => {
    button.textContent = locale[button.dataset.class];
  });

  renderSaveSlots();
  renderMedalsScreen();
  renderClassConfirmation();
  renderGameplayInfo();
  renderInfoDetails();
  renderInventoryScreen();
  renderPartyScreen();
  renderBattleUI();
  renderVictoryScreen();
  renderDefeatScreen();
  renderDialogueUI();
}

function renderSaveSlots() {
  renderSaveSlotsUI({
    saveSlotsList,
    slots: loadSlots(),
    currentSlotId,
    getLocale,
    formatText,
    hasExistingSave,
    onDeleteRequest: openDeleteConfirmation
  });
}

function renderClassConfirmation() {
  const locale = getLocale();
  const slot = currentSlotId ? getSlotById(currentSlotId) : null;

  if (!slot || !slot.playerIdentity?.chosenClass) {
    textNodes.classConfirmation.textContent = '';
    return;
  }

  textNodes.classConfirmation.textContent = formatText(locale.classSaved, { number: slot.metadata.slotId });
}

const screenRouter = createScreenRouter(screens);

function formatDebugValue(value, fallback = 'none') {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  return String(value);
}

function getCurrentSlot() {
  return currentSlotId ? getSlotById(currentSlotId) : null;
}

function getPlayerGearSummary(slot) {
  if (!slot) {
    return 'none';
  }

  const equippedGear = slot.inventory?.equippedGear || {};
  const summary = EQUIPMENT_SLOT_ORDER
    .map((slotType) => {
      const itemId = equippedGear[slotType];
      const item = itemId ? GEAR_ITEM_DEFINITIONS[itemId] : null;
      return `${slotType}:${item ? itemId : 'none'}`;
    })
    .join(', ');

  return summary || 'none';
}

function renderDebugOverlay() {
  if (!debugOverlay) {
    return;
  }

  debugOverlay.hidden = !debugOverlayVisible;
  debugOverlay.setAttribute('aria-hidden', String(!debugOverlayVisible));

  if (!debugOverlayVisible) {
    debugOverlay.textContent = '';
    return;
  }

  const slot = getCurrentSlot();
  const playerMember = slot ? getMainPartyMemberState(slot) : null;
  const activePartyIds = slot?.party?.activePartyMemberIds || [MAIN_PARTY_MEMBER_ID];
  const recruitedIds = slot?.party?.recruitedCompanionIds || [];
  const destinationFromPath = playerState.path.length > 0 ? playerState.path[playerState.path.length - 1] : null;
  const destinationTile = playerState.moving
    ? { x: playerState.stepToX, y: playerState.stepToY }
    : (destinationFromPath || lastClickedDestination);

  const lines = [
    'DEBUG OVERLAY (F3 / Shift+D)',
    `screen: ${formatDebugValue(activeScreenName)}`,
    `mapId: ${formatDebugValue(currentMapId)}`,
    `playerTile: ${playerState.tileX},${playerState.tileY}`,
    `isMoving: ${playerState.moving ? 'yes' : 'no'}`,
    `targetTile: ${destinationTile ? `${destinationTile.x},${destinationTile.y}` : 'none'}`,
    `activePartyIds: ${activePartyIds.length ? activePartyIds.join(', ') : 'none'}`,
    `recruitedCompanionIds: ${recruitedIds.length ? recruitedIds.join(', ') : 'none'}`,
    `saveSlotId: ${formatDebugValue(currentSlotId)}`,
    `showCoordinates: ${showCoordinates ? 'on' : 'off'}`,
    `playerHp: ${playerMember ? `${playerMember.currentHp}/${playerMember.maxHp}` : 'none'}`,
    `playerLevelExp: ${playerMember ? `${playerMember.level}/${playerMember.currentExp}` : 'none'}`,
    `companionWorldStateFlags: ${slot?.party?.companionWorldStateFlags ? JSON.stringify(slot.party.companionWorldStateFlags) : 'none'}`,
    `equippedGear: ${getPlayerGearSummary(slot)}`,
    `dialogueNpcId: ${formatDebugValue(dialogueState.npcId)}`,
    `battleEnemyId: ${formatDebugValue(battleState.enemyId)}`
  ];

  debugOverlay.textContent = lines.join('\n');
}

function showScreen(screenName) {
  activeScreenName = screenName;
  screenRouter.showScreen(screenName);
  renderDebugOverlay();
}

function setLanguage(language) {
  if (!translations[language]) {
    return;
  }

  currentLanguage = language;
  localStorage.setItem(STORAGE_LANGUAGE_KEY, language);
  setDocumentLanguage();
  renderStaticText();
}

function goToLanguageScreen() {
  currentSlotId = null;
  gameMenuStatusKey = '';
  showScreen('language');
}

function goToMenuScreen() {
  gameMenuStatusKey = '';
  showScreen('menu');
}

function goToSaveScreen() {
  renderSaveSlots();
  showScreen('save');
}

function goToMedalsScreen() {
  renderMedalsScreen();
  showScreen('medals');
}

function goToElementScreen(slotId) {
  currentSlotId = slotId;
  currentMapId = DEFAULT_MAP_ID;
  showCoordinates = false;
  applyCoordinateVisibility();
  initializeMapState(DEFAULT_MAP_ID, []);
  buildGrid();
  showScreen('element');
}

function goToClassScreen() {
  renderClassConfirmation();
  showScreen('class');
}

function setPlayerPosition(x, y) {
  playerState.tileX = x;
  playerState.tileY = y;
  playerState.path = [];
  playerState.moving = false;
  playerState.stepToX = x;
  playerState.stepToY = y;
  playerState.stepElapsed = 0;
  playerState.lastTimestamp = null;
  updatePlayerPiece();
}

function initializeMapState(mapId, defeatedEnemyIds = []) {
  currentMapId = getMapDefinition(mapId).id;
  enemyStates = createEnemyStatesFromDefeatedIds(defeatedEnemyIds, currentMapId);
  npcStates = createNpcStates(enemyStates, currentMapId);
}

function canUseStarterDoor(slot) {
  const keyIds = new Set(slot?.worldProgress?.obtainedKeyIds || []);
  return keyIds.has('key_story') || keyIds.has('key_no_story');
}

function transitionToMap(mapId, spawnOverride = null) {
  if (!currentSlotId) {
    return false;
  }

  const slot = getSlotById(currentSlotId);
  if (!slot) {
    return false;
  }

  const map = getMapDefinition(mapId);
  const spawn = normalizePosition(spawnOverride || map.spawn, map.id);
  const defeatedEnemyIds = getPersistentDefeatedEnemyIds(slot, currentMapId);

  updateSlot(currentSlotId, {
    playerWorldPosition: {
      currentMapId: map.id,
      playerX: spawn.x,
      playerY: spawn.y
    },
    worldProgress: {
      defeatedEnemyIds
    }
  });

  initializeMapState(map.id, defeatedEnemyIds);
  setPlayerPosition(spawn.x, spawn.y);
  buildGrid();

  renderGameplayInfo();
  renderInfoDetails();
  return true;
}

function openScriptedDialogueSequence(textKeys, onComplete, speakerKey = 'narrator') {
  if (!Array.isArray(textKeys) || textKeys.length === 0) {
    if (typeof onComplete === 'function') {
      onComplete();
    }
    return;
  }

  const nodes = textKeys.reduce((result, textKey, index) => {
    const nodeId = `scripted_${index}`;
    const nextNodeId = index < textKeys.length - 1 ? `scripted_${index + 1}` : null;
    result[nodeId] = {
      id: nodeId,
      speaker: 'npc',
      textKey,
      nextNodeId
    };
    return result;
  }, {});

  dialogueState.npcId = null;
  dialogueState.nodeId = 'scripted_0';
  dialogueState.scriptedNodes = nodes;
  dialogueState.scriptedSpeakerKey = speakerKey;
  dialogueState.onComplete = typeof onComplete === 'function' ? onComplete : null;
  renderDialogueUI();
  showScreen('dialogue');
}

function runStoryConditionedDoorEvent(door, slot) {
  const eventDefinition = STORY_CONDITIONED_DOOR_EVENT_DEFINITIONS[door.id];
  if (!eventDefinition) {
    return transitionToMap(door.targetMapId, door.targetSpawn);
  }

  const eventFlags = slot.worldProgress?.triggeredEventFlags || {};
  const routeChoice = resolveStoryConditionedRoute(slot);
  const isCompleted = Boolean(eventFlags[eventDefinition.firstCompletedFlag]);
  const textKeys = isCompleted
    ? eventDefinition.repeatTextKeysByRoute[routeChoice]
    : eventDefinition.firstTimeTextKeysByRoute[routeChoice];

  const nextFlags = {
    ...eventFlags,
    [eventDefinition.firstSeenFlag]: true,
    [eventDefinition.firstCompletedFlag]: true
  };

  updateSlot(currentSlotId, {
    worldProgress: {
      triggeredEventFlags: nextFlags
    }
  });

  openScriptedDialogueSequence(textKeys, () => {
    transitionToMap(door.targetMapId, door.targetSpawn);
  });
  return true;
}

function tryUseDoor(door) {
  if (!door?.targetMapId) {
    return false;
  }

  if (!currentSlotId) {
    return false;
  }

  if (door.id === STARTER_DOOR.id && currentMapId === DEFAULT_MAP_ID) {
    const slot = synchronizeStarterDoorProgress(currentSlotId) || getSlotById(currentSlotId);
    if (!slot || !getStarterDoorState(slot).spawned || !canUseStarterDoor(slot)) {
      return false;
    }

    return transitionToMap(door.targetMapId, door.targetSpawn);
  }

  const slot = getSlotById(currentSlotId);
  if (!slot) {
    return false;
  }

  if (STORY_CONDITIONED_DOOR_EVENT_DEFINITIONS[door.id]) {
    return runStoryConditionedDoorEvent(door, slot);
  }

  return transitionToMap(door.targetMapId, door.targetSpawn);
}

function beginNextStep() {
  if (playerState.path.length === 0) {
    lastClickedDestination = null;
    playerState.moving = false;
    playerState.lastTimestamp = null;
    playerState.stepElapsed = 0;
    return;
  }

  const nextTile = playerState.path.shift();
  playerState.stepToX = nextTile.x;
  playerState.stepToY = nextTile.y;
  playerState.stepElapsed = 0;
  playerState.lastTimestamp = null;
  playerState.moving = true;
}

function goToGameScreen() {
  renderGameplayInfo();
  showScreen('game');
}

function openGameMenu() {
  gameMenuStatusKey = '';
  textNodes.gameMenuStatus.textContent = '';
  showScreen('gameMenu');
}

function openInventoryScreen() {
  renderInventoryScreen();
  showScreen('inventory');
}

function openPartyScreen() {
  renderPartyScreen();
  showScreen('party');
}

function openInfoScreen() {
  renderInfoDetails();
  showScreen('info');
}

function openSettingsScreen() {
  renderSettingsText();
  showScreen('settings');
}

function applyCoordinateVisibility() {
  gridBoard.classList.toggle('show-coordinates', showCoordinates);
}

function toggleShowCoordinates() {
  showCoordinates = !showCoordinates;
  if (currentSlotId) {
    updateSlot(currentSlotId, {
      settings: {
        showCoordinates
      }
    });
  }
  applyCoordinateVisibility();
  renderSettingsText();
}

function returnToGameMenu() {
  renderInfoDetails();
  renderPartyScreen();
  showScreen('gameMenu');
}

function writeCurrentGameToSlot() {
  if (!currentSlotId) {
    return false;
  }

  const slot = getSlotById(currentSlotId);
  if (!slot || !slot.playerIdentity?.chosenElement || !slot.playerIdentity?.chosenClass) {
    return false;
  }

  const pos = getCurrentTilePosition();
  const defeatedEnemyIds = getDefeatedEnemyIdsFromCurrentState();
  const syncedSlot = synchronizeStarterDoorProgress(currentSlotId, defeatedEnemyIds) || slot;

  updateSlot(currentSlotId, {
    playerIdentity: {
      chosenElement: slot.playerIdentity.chosenElement,
      chosenClass: slot.playerIdentity.chosenClass,
      storyModeChoice: slot.playerIdentity.storyModeChoice
    },
    playerWorldPosition: {
      currentMapId,
      playerX: pos.x,
      playerY: pos.y
    },
    worldProgress: {
      defeatedEnemyIds,
      openedDoorIds: syncedSlot.worldProgress?.openedDoorIds || [],
      triggeredEventFlags: syncedSlot.worldProgress?.triggeredEventFlags || {}
    },
    settings: {
      showCoordinates
    }
  });

  renderSaveSlots();
  renderMedalsScreen();
  renderInfoDetails();
  return true;
}

function getDefeatedEnemyIdsFromCurrentState() {
  return getPersistentDefeatedEnemyIds(getCurrentSlot(), currentMapId);
}

function getPersistentDefeatedEnemyIds(slot, mapId = currentMapId) {
  const currentSlot = slot || getCurrentSlot();
  if (!currentSlot) {
    return [];
  }

  const existingDefeated = new Set(normalizeDefeatedEnemyIds(currentSlot.worldProgress?.defeatedEnemyIds));
  const mapEnemyIds = new Set((getMapDefinition(mapId).enemies || []).map((enemy) => enemy.id));

  mapEnemyIds.forEach((enemyId) => existingDefeated.delete(enemyId));

  (getMapDefinition(mapId).enemies || [])
    .filter((enemyTemplate) => !enemyStates.some((enemy) => enemy.id === enemyTemplate.id))
    .forEach((enemyTemplate) => existingDefeated.add(enemyTemplate.id));

  return [...existingDefeated];
}

function deleteSlotProgress(slotId) {
  const slots = loadSlots();
  const slotIndex = slots.findIndex((slot) => slot.metadata.slotId === slotId);

  if (slotIndex === -1) {
    return;
  }

  slots[slotIndex] = createCanonicalSlot(slotId);
  saveSlots(slots);
}

function openDeleteConfirmation(slotId) {
  pendingDeleteSlotId = slotId;
  showScreen('deleteConfirm');
}

function cancelDeleteConfirmation() {
  pendingDeleteSlotId = null;
  showScreen('save');
}

function confirmDeleteSlot() {
  if (Number.isInteger(pendingDeleteSlotId)) {
    deleteSlotProgress(pendingDeleteSlotId);
  }

  pendingDeleteSlotId = null;
  renderSaveSlots();
  renderMedalsScreen();
  showScreen('save');
}

function handleSaveOnly() {
  if (writeCurrentGameToSlot()) {
    gameMenuStatusKey = 'saved';
    textNodes.gameMenuStatus.textContent = getLocale().saved;
  }
}

function handleSaveAndQuit() {
  writeCurrentGameToSlot();
  goToMenuScreen();
}

function handleQuitWithoutSaving() {
  goToMenuScreen();
}

function updatePlayerPiece() {
  const tilePercent = 100 / GRID_SIZE;
  const tokenSizePercent = tilePercent * 0.68;
  const leftPercent = (playerState.tileX * tilePercent) + (tilePercent * 0.16);
  const topPercent = (playerState.tileY * tilePercent) + (tilePercent * 0.16);

  playerPiece.style.width = `${tokenSizePercent}%`;
  playerPiece.style.height = `${tokenSizePercent}%`;
  playerPiece.style.left = `${leftPercent}%`;
  playerPiece.style.top = `${topPercent}%`;
}

function createNpcPiece(npc) {
  const npcPiece = document.createElement('div');
  npcPiece.className = `npc-piece npc-piece-${npc.type || 'npc'}`;

  const tilePercent = 100 / GRID_SIZE;
  const tokenSizePercent = tilePercent * 0.68;
  const leftPercent = (npc.x * tilePercent) + (tilePercent * 0.16);
  const topPercent = (npc.y * tilePercent) + (tilePercent * 0.16);

  npcPiece.style.width = `${tokenSizePercent}%`;
  npcPiece.style.height = `${tokenSizePercent}%`;
  npcPiece.style.left = `${leftPercent}%`;
  npcPiece.style.top = `${topPercent}%`;

  return npcPiece;
}

function createEnemyPiece(enemy) {
  const enemyPiece = document.createElement('div');
  enemyPiece.className = `enemy-piece enemy-piece-${enemy.element} enemy-piece-species-${enemy.species || 'slime'}`;

  const tilePercent = 100 / GRID_SIZE;
  const tokenSizePercent = tilePercent * 0.68;
  const leftPercent = (enemy.x * tilePercent) + (tilePercent * 0.16);
  const topPercent = (enemy.y * tilePercent) + (tilePercent * 0.16);

  enemyPiece.style.width = `${tokenSizePercent}%`;
  enemyPiece.style.height = `${tokenSizePercent}%`;
  enemyPiece.style.left = `${leftPercent}%`;
  enemyPiece.style.top = `${topPercent}%`;

  return enemyPiece;
}


function getBattleEnemyMarkup(species, element) {
  if (species === 'tree_monster') {
    return `
      <div class="tree-monster tree-monster--${element}" aria-hidden="true">
        <div class="tree-monster__crown"></div>
        <div class="tree-monster__trunk"></div>
        <div class="tree-monster__arm tree-monster__arm--left"></div>
        <div class="tree-monster__arm tree-monster__arm--right"></div>
        <div class="tree-monster__eye tree-monster__eye--left"></div>
        <div class="tree-monster__eye tree-monster__eye--right"></div>
      </div>
    `;
  }

  if (species === 'lava_turtle') {
    return `
      <div class="lava-turtle lava-turtle--${element}" aria-hidden="true">
        <div class="lava-turtle__shell"></div>
        <div class="lava-turtle__head"></div>
        <div class="lava-turtle__leg lava-turtle__leg--front-left"></div>
        <div class="lava-turtle__leg lava-turtle__leg--front-right"></div>
        <div class="lava-turtle__leg lava-turtle__leg--rear-left"></div>
        <div class="lava-turtle__leg lava-turtle__leg--rear-right"></div>
        <div class="lava-turtle__flame"></div>
      </div>
    `;
  }

  return `
    <div class="slime slime--${element}" aria-hidden="true">
      <div class="slime__body">
        <div class="slime__shine"></div>
        <div class="slime__eye slime__eye--left"></div>
        <div class="slime__eye slime__eye--right"></div>
      </div>
    </div>
  `;
}

function isValidDoorSpawn(x, y, enemyList, npcList, playerPos) {
  if (!isGround(x, y)) {
    return false;
  }

  if ((x === 0 && y === 0) || (playerPos && x === playerPos.x && y === playerPos.y)) {
    return false;
  }

  if (Array.isArray(npcList) && npcList.some((npc) => npc.x === x && npc.y === y)) {
    return false;
  }

  return !enemyList.some((enemy) => enemy.x === x && enemy.y === y);
}

function resolveDoorPlacement(door) {
  if (door.id !== STARTER_DOOR.id || currentMapId !== DEFAULT_MAP_ID || !currentSlotId) {
    return { ...door };
  }

  const slot = getSlotById(currentSlotId);
  if (!slot || !getStarterDoorState(slot).spawned) {
    return null;
  }

  const playerPos = getCurrentTilePosition();
  if (isValidDoorSpawn(door.x, door.y, enemyStates, npcStates, playerPos)) {
    return { ...door };
  }

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (isValidDoorSpawn(x, y, enemyStates, npcStates, playerPos)) {
        return { ...door, x, y };
      }
    }
  }

  return null;
}

function getMapDoors(mapId = currentMapId) {
  const mapDoors = getMapDefinition(mapId).doors || [];
  return mapDoors
    .map((door) => resolveDoorPlacement(door))
    .filter(Boolean);
}

function createDoorPiece(door) {
  const doorPiece = document.createElement('div');
  doorPiece.className = 'door-piece';

  const tilePercent = 100 / GRID_SIZE;
  const tokenSizePercent = tilePercent * 0.68;
  const leftPercent = (door.x * tilePercent) + (tilePercent * 0.16);
  const topPercent = (door.y * tilePercent) + (tilePercent * 0.16);

  doorPiece.style.width = `${tokenSizePercent}%`;
  doorPiece.style.height = `${tokenSizePercent}%`;
  doorPiece.style.left = `${leftPercent}%`;
  doorPiece.style.top = `${topPercent}%`;

  return doorPiece;
}

function getHealingTilesForMap(mapId = currentMapId) {
  return getMapDefinition(mapId).healingTiles || [];
}

function getHealingTileAt(x, y, mapId = currentMapId) {
  return getHealingTilesForMap(mapId).find((tile) => tile.x === x && tile.y === y) || null;
}

function createHealingTilePiece(tile) {
  const healingPiece = document.createElement('div');
  healingPiece.className = 'healing-tile-piece';

  const tilePercent = 100 / GRID_SIZE;
  const tokenSizePercent = tilePercent * 0.68;
  const leftPercent = (tile.x * tilePercent) + (tilePercent * 0.16);
  const topPercent = (tile.y * tilePercent) + (tilePercent * 0.16);

  healingPiece.style.width = `${tokenSizePercent}%`;
  healingPiece.style.height = `${tokenSizePercent}%`;
  healingPiece.style.left = `${leftPercent}%`;
  healingPiece.style.top = `${topPercent}%`;

  return healingPiece;
}

function buildGrid() {
  const fragment = document.createDocumentFragment();
  const healingTileLookup = new Set(getHealingTilesForMap().map((tile) => `${tile.x},${tile.y}`));
  const zoneType = getCurrentMapDefinition().metadata?.zoneType || 'starter';
  gridBoard.dataset.zoneType = zoneType;

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const tile = document.createElement('button');
      tile.type = 'button';
      const isHealingTile = healingTileLookup.has(`${x},${y}`);
      const tileType = getTileDefinitionAt(x, y)?.tileType || TERRAIN_TILE_TYPES.WALL;
      const terrainClass = tileType === TERRAIN_TILE_TYPES.GROUND
        ? 'tile-ground'
        : (tileType === TERRAIN_TILE_TYPES.SWAMP
          ? 'tile-swamp'
          : (tileType === TERRAIN_TILE_TYPES.EMBER ? 'tile-ember' : 'tile-wall'));
      tile.className = `grid-tile ${terrainClass}${isHealingTile ? ' tile-healing' : ''}`;
      tile.dataset.x = String(x);
      tile.dataset.y = String(y);
      tile.setAttribute('role', 'gridcell');
      tile.setAttribute('aria-label', `Tile ${x}, ${y}`);

      const coordinateLabel = document.createElement('span');
      coordinateLabel.className = 'tile-coordinate-label';
      coordinateLabel.textContent = `${x},${y}`;

      tile.append(coordinateLabel);
      fragment.append(tile);
    }
  }

  gridBoard.innerHTML = '';
  const doors = getMapDoors();
  const healingPieces = getHealingTilesForMap().map((tile) => createHealingTilePiece(tile));
  const npcPieces = npcStates.map((npc) => createNpcPiece(npc));
  const doorPieces = doors.map((door) => createDoorPiece(door));
  gridBoard.append(fragment, ...healingPieces, ...doorPieces, playerPiece, ...enemyStates.map((enemy) => createEnemyPiece(enemy)), ...npcPieces);
  applyCoordinateVisibility();
  updatePlayerPiece();
}

function getNeighbors(node) {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  return directions
    .map((dir) => ({ x: node.x + dir.x, y: node.y + dir.y }))
    .filter((point) => isWalkable(point.x, point.y));
}

function findPath(start, end) {
  const queue = [start];
  const visited = new Set([`${start.x},${start.y}`]);
  const cameFrom = new Map();

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.x === end.x && current.y === end.y) {
      const path = [];
      let key = `${end.x},${end.y}`;

      while (cameFrom.has(key)) {
        const point = key.split(',').map(Number);
        path.unshift({ x: point[0], y: point[1] });
        key = cameFrom.get(key);
      }

      return path;
    }

    getNeighbors(current).forEach((neighbor) => {
      const key = `${neighbor.x},${neighbor.y}`;
      if (visited.has(key)) {
        return;
      }

      visited.add(key);
      cameFrom.set(key, `${current.x},${current.y}`);
      queue.push(neighbor);
    });
  }

  return null;
}

function moveToTile(targetX, targetY) {
  if (playerState.moving) {
    return;
  }

  if (!isInsideGrid(targetX, targetY)) {
    return;
  }

  lastClickedDestination = { x: targetX, y: targetY };

  if (!isWalkable(targetX, targetY)) {
    return;
  }

  const start = { x: playerState.tileX, y: playerState.tileY };

  if (targetX === start.x && targetY === start.y) {
    return;
  }

  const path = findPath(start, { x: targetX, y: targetY });

  if (!path || path.length === 0) {
    return;
  }

  playerState.path = path;
  playerState.moving = false;
  playerState.stepElapsed = 0;
  playerState.lastTimestamp = null;
  beginNextStep();
  updatePlayerPiece();
}


function isOrthogonallyAdjacentToEntity(entity) {
  const distance = Math.abs(playerState.tileX - entity.x) + Math.abs(playerState.tileY - entity.y);
  return distance === 1;
}

function enterBattleMode(enemy) {
  const slot = currentSlotId ? getSlotById(currentSlotId) : null;

  if (!slot || !slot.playerIdentity?.chosenClass || !slot.playerIdentity?.chosenElement) {
    return;
  }

  const partyMembers = createBattlePartyData(slot);

  battleState.menu = BATTLE_MENUS.ROOT;
  battleState.enemyId = enemy.id;
  battleState.enemy = createEnemyForBattle(enemy);
  battleState.partyMembers = partyMembers;
  battleState.player = partyMembers.find((member) => member.id === MAIN_PARTY_MEMBER_ID) || createPlayerBattleData(slot);
  battleState.feedbackEntries = [];
  battleState.resultExpGained = 0;
  battleState.resultLevelUps = 0;
  battleState.resultPartyProgress = [];

  renderBattleUI();
  showScreen('battle');
}

function getInteractableAtTile(x, y) {
  const door = getMapDoors().find((entry) => entry.x === x && entry.y === y);
  if (door) {
    return { type: 'door', entity: door };
  }

  const enemy = getEnemyAtTile(x, y);
  if (enemy) {
    return { type: 'enemy', entity: enemy };
  }

  const npc = getNpcAtTile(x, y);
  if (npc) {
    return { type: 'npc', entity: npc };
  }

  return null;
}

function tryInteractWithEntity(tileX, tileY) {
  if (playerState.moving || !isInsideGrid(tileX, tileY)) {
    return false;
  }

  const target = getInteractableAtTile(tileX, tileY);

  if (!target) {
    return false;
  }

  if (!isOrthogonallyAdjacentToEntity(target.entity)) {
    return true;
  }

  if (target.type === 'enemy') {
    enterBattleMode(target.entity);
  } else if (target.type === 'npc') {
    enterDialogueMode(target.entity);
  } else if (target.type === 'door') {
    tryUseDoor(target.entity);
    return true;
  }

  return true;
}

function runFromBattle() {
  if (currentSlotId) {
    updatePartyBattleMemberHp(currentSlotId, battleState.partyMembers);
  }

  battleState.menu = BATTLE_MENUS.ROOT;
  battleState.enemyId = null;
  battleState.enemy = null;
  battleState.player = null;
  battleState.partyMembers = [];
  battleState.feedbackEntries = [];
  battleState.resultExpGained = 0;
  battleState.resultLevelUps = 0;
  battleState.resultPartyProgress = [];
  renderBattleUI();
  goToGameScreen();
}


function handleBattleAction(action) {
  if (action.startsWith('skill:')) {
    const skillIndex = Number(action.split(':')[1]);
    if (Number.isInteger(skillIndex)) {
      applyPlayerSkill(skillIndex);
    }
    return;
  }

  if (action === 'run') {
    runFromBattle();
    return;
  }

  if (action === 'openFightCategories') {
    battleState.menu = BATTLE_MENUS.FIGHT_CATEGORIES;
  } else if (action === 'openOffensive') {
    battleState.menu = BATTLE_MENUS.OFFENSIVE;
  } else if (action === 'openDefenders') {
    battleState.menu = BATTLE_MENUS.DEFENDERS;
  } else if (action === 'backToRoot') {
    battleState.menu = BATTLE_MENUS.ROOT;
  } else if (action === 'backToCategories') {
    battleState.menu = BATTLE_MENUS.FIGHT_CATEGORIES;
  }

  renderBattleUI();
}

function clearBattleState() {
  battleState.menu = BATTLE_MENUS.ROOT;
  battleState.enemyId = null;
  battleState.enemy = null;
  battleState.player = null;
  battleState.partyMembers = [];
  battleState.feedbackEntries = [];
  battleState.resultExpGained = 0;
  battleState.resultLevelUps = 0;
  battleState.resultPartyProgress = [];
}

function handleVictoryContinue() {
  clearBattleState();
  renderBattleUI();
  goToGameScreen();
}

function handleDefeatReturnToMenu() {
  clearBattleState();
  renderBattleUI();
  goToMenuScreen();
}

function tryActivateHealingTileAtPlayerPosition() {
  if (!currentSlotId) {
    return;
  }

  const healingTile = getHealingTileAt(playerState.tileX, playerState.tileY);
  if (!healingTile) {
    return;
  }

  healActivePartyToFull(currentSlotId);
}

function animationStep(timestamp) {
  if (!screens.game.hidden && playerState.moving) {
    const dt = playerState.lastTimestamp ? (timestamp - playerState.lastTimestamp) / 1000 : 0;
    playerState.lastTimestamp = timestamp;
    playerState.stepElapsed += dt;

    const effectiveStepDuration = 1 / getPlayerMovementSpeedTilesPerSecond();
    if (playerState.stepElapsed >= effectiveStepDuration) {
      playerState.tileX = playerState.stepToX;
      playerState.tileY = playerState.stepToY;
      tryActivateHealingTileAtPlayerPosition();
      beginNextStep();
      renderInfoDetails();
    }

    updatePlayerPiece();
  } else if (screens.game.hidden) {
    playerState.lastTimestamp = null;
  }

  syncRuntimeState();
  renderDebugOverlay();
  requestAnimationFrame(animationStep);
}

function handleGridSelection(event) {
  if (screens.game.hidden) {
    return;
  }

  const tile = event.target.closest('.grid-tile');
  if (!tile) {
    return;
  }

  const x = Number(tile.dataset.x);
  const y = Number(tile.dataset.y);
  if (!Number.isInteger(x) || !Number.isInteger(y)) {
    return;
  }

  if (tryInteractWithEntity(x, y)) {
    return;
  }

  moveToTile(x, y);
}

gridBoard.addEventListener('click', (event) => {
  if (suppressNextGridClick) {
    suppressNextGridClick = false;
    return;
  }

  handleGridSelection(event);
});
gridBoard.addEventListener('pointerup', (event) => {
  if (event.pointerType === 'mouse') {
    return;
  }

  suppressNextGridClick = true;
  event.preventDefault();
  handleGridSelection(event);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'F3' || (event.key.toLowerCase() === 'd' && event.shiftKey)) {
    event.preventDefault();
    debugOverlayVisible = !debugOverlayVisible;
    renderDebugOverlay();
    return;
  }

  if (!screens.dialogue.hidden && (event.key === 'Enter' || event.key === ' ')) {
    const node = getCurrentDialogueNode();
    if (!node?.choices?.length) {
      event.preventDefault();
      advanceDialogue();
      return;
    }
  }

  if (screens.game.hidden) {
    return;
  }

  const keyToDirection = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 }
  };

  const normalizedKey = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const direction = keyToDirection[normalizedKey];
  if (!direction) {
    return;
  }

  event.preventDefault();
  const base = { x: playerState.tileX, y: playerState.tileY };
  moveToTile(base.x + direction.x, base.y + direction.y);
});

languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setLanguage(button.dataset.language);
    goToMenuScreen();
  });
});

textNodes.menuBack.addEventListener('click', goToLanguageScreen);
textNodes.menuPlay.addEventListener('click', goToSaveScreen);
textNodes.menuMedals.addEventListener('click', goToMedalsScreen);
textNodes.saveBack.addEventListener('click', goToMenuScreen);
textNodes.medalsBack.addEventListener('click', goToMenuScreen);
textNodes.elementBack.addEventListener('click', goToSaveScreen);
textNodes.classBack.addEventListener('click', () => {
  textNodes.classConfirmation.textContent = '';
  showScreen('element');
});
textNodes.openGameMenu.addEventListener('click', openGameMenu);
textNodes.gmBackToGame.addEventListener('click', goToGameScreen);
textNodes.gmParty.addEventListener('click', openPartyScreen);
textNodes.gmInventory.addEventListener('click', openInventoryScreen);
textNodes.gmInfo.addEventListener('click', openInfoScreen);
textNodes.gmSettings.addEventListener('click', openSettingsScreen);
textNodes.gmSave.addEventListener('click', handleSaveOnly);
textNodes.gmSaveQuit.addEventListener('click', handleSaveAndQuit);
textNodes.gmQuit.addEventListener('click', handleQuitWithoutSaving);
textNodes.settingsToggleCoordinates.addEventListener('click', toggleShowCoordinates);
textNodes.settingsBack.addEventListener('click', returnToGameMenu);
textNodes.inventoryBack.addEventListener('click', returnToGameMenu);
textNodes.partyBack.addEventListener('click', returnToGameMenu);
textNodes.infoBack.addEventListener('click', returnToGameMenu);
textNodes.deleteConfirmYes.addEventListener('click', confirmDeleteSlot);
textNodes.deleteConfirmNo.addEventListener('click', cancelDeleteConfirmation);
textNodes.victoryContinue.addEventListener('click', handleVictoryContinue);
textNodes.defeatMainMenu.addEventListener('click', handleDefeatReturnToMenu);
battleOptionsList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || screens.battle.hidden) {
    return;
  }

  handleBattleAction(button.dataset.action);
});

saveSlotsList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.save-slot-delete');
  if (deleteButton) {
    event.stopPropagation();

    if (deleteButton.disabled) {
      return;
    }

    const slotId = Number(deleteButton.dataset.deleteSlotId);
    if (!Number.isInteger(slotId)) {
      return;
    }

    openDeleteConfirmation(slotId);
    return;
  }

  const button = event.target.closest('.save-slot');
  if (!button) {
    return;
  }

  const slotId = Number(button.dataset.slotId);
  if (!Number.isInteger(slotId)) {
    return;
  }

  const slot = getSlotById(slotId);
  if (!slot) {
    return;
  }

  if (!hasExistingSave(slot)) {
    deleteSlotProgress(slotId);
    goToElementScreen(slotId);
    return;
  }

  currentSlotId = slotId;
  currentMapId = getMapDefinition(slot.playerWorldPosition?.currentMapId).id;
  showCoordinates = slot.settings?.showCoordinates || false;
  applyCoordinateVisibility();
  synchronizeStarterDoorProgress(slotId, slot.worldProgress?.defeatedEnemyIds);
  initializeMapState(currentMapId, slot.worldProgress?.defeatedEnemyIds || []);
  const savedPos = normalizePosition({
    x: slot.playerWorldPosition?.playerX,
    y: slot.playerWorldPosition?.playerY
  }, currentMapId);
  setPlayerPosition(savedPos.x, savedPos.y);
  buildGrid();
  goToGameScreen();
});

elementButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!currentSlotId) {
      return;
    }

    updateSlot(currentSlotId, {
      playerIdentity: {
        chosenElement: button.dataset.element,
        chosenClass: null,
        storyModeChoice: 'story'
      },
      playerWorldPosition: {
        currentMapId: DEFAULT_MAP_ID,
        playerX: 0,
        playerY: 0
      },
      worldProgress: {
        defeatedEnemyIds: [],
        openedDoorIds: [],
        triggeredEventFlags: {},
        obtainedKeyIds: []
      },
      npcStateFlags: {},
      medals: [],
      party: {
        activePartyMemberIds: [MAIN_PARTY_MEMBER_ID],
        recruitedCompanionIds: [],
        companionWorldStateFlags: {},
        memberStates: {
          [MAIN_PARTY_MEMBER_ID]: createMainPartyMemberState('warrior', button.dataset.element)
        }
      },
      inventory: {
        inventoryItems: [],
        equippedGear: { ...DEFAULT_EQUIPPED_GEAR }
      },
      settings: {
        showCoordinates: false
      }
    });
    goToClassScreen();
  });
});

classButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!currentSlotId) {
      return;
    }

    const slotBeforeClassUpdate = getSlotById(currentSlotId);
    const chosenElement = slotBeforeClassUpdate?.playerIdentity?.chosenElement || 'fire';

    updateSlot(currentSlotId, {
      playerIdentity: {
        chosenClass: button.dataset.class
      },
      playerWorldPosition: {
        currentMapId: DEFAULT_MAP_ID,
        playerX: 0,
        playerY: 0
      },
      worldProgress: {
        defeatedEnemyIds: []
      },
      settings: {
        showCoordinates: false
      },
      party: {
        activePartyMemberIds: [MAIN_PARTY_MEMBER_ID],
        companionWorldStateFlags: {},
        memberStates: {
          [MAIN_PARTY_MEMBER_ID]: createMainPartyMemberState(button.dataset.class, chosenElement)
        }
      },
      inventory: {
        inventoryItems: createStarterGearInventoryForClass(button.dataset.class),
        equippedGear: { ...DEFAULT_EQUIPPED_GEAR }
      }
    });

    const slot = getSlotById(currentSlotId);
    currentMapId = getMapDefinition(slot?.playerWorldPosition?.currentMapId).id;
    const start = normalizePosition({
      x: slot?.playerWorldPosition?.playerX,
      y: slot?.playerWorldPosition?.playerY
    }, currentMapId);
    showCoordinates = slot?.settings?.showCoordinates || false;
    applyCoordinateVisibility();
    initializeMapState(currentMapId, slot?.worldProgress?.defeatedEnemyIds || []);
    setPlayerPosition(start.x, start.y);
    buildGrid();

    renderClassConfirmation();
    renderSaveSlots();
    goToGameScreen();
  });
});

dialogueArea.addEventListener('click', (event) => {
  if (screens.dialogue.hidden) {
    return;
  }

  const choiceButton = event.target.closest('button[data-choice-id]');
  if (choiceButton) {
    selectDialogueChoice(choiceButton.dataset.choiceId);
    return;
  }

  advanceDialogue();
});

dialogueArea.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }

  const node = getCurrentDialogueNode();
  if (node?.choices?.length) {
    return;
  }

  event.preventDefault();
  advanceDialogue();
});

partyActiveList.addEventListener('click', (event) => {
  const removeButton = event.target.closest('button[data-remove-companion-id]');
  if (!removeButton || screens.party.hidden) {
    return;
  }

  removeCompanionFromActiveParty(removeButton.dataset.removeCompanionId);
});

inventoryList.addEventListener('click', (event) => {
  const equipButton = event.target.closest('button[data-equip-slot-type][data-equip-item-id]');
  if (!equipButton || screens.inventory.hidden) {
    return;
  }

  handleEquipItem(equipButton.dataset.equipSlotType, equipButton.dataset.equipItemId);
});


function syncRuntimeState() {
  gameState.currentLanguage = currentLanguage;
  gameState.currentSlotId = currentSlotId;
  gameState.gameMenuStatusKey = gameMenuStatusKey;
  gameState.showCoordinates = showCoordinates;
  gameState.pendingDeleteSlotId = pendingDeleteSlotId;
  gameState.currentMapId = currentMapId;
  gameState.enemyStates = enemyStates;
  gameState.npcStates = npcStates;
}

const savedLanguage = localStorage.getItem(STORAGE_LANGUAGE_KEY);
if (translations[savedLanguage]) {
  currentLanguage = savedLanguage;
}

showCoordinates = false;

buildGrid();
setDocumentLanguage();
renderStaticText();
goToLanguageScreen();
renderDebugOverlay();
syncRuntimeState();
requestAnimationFrame(animationStep);
