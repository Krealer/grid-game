const GRID_SIZE = 12;
const TILE_SPEED_PER_SECOND = 2;
const TILE_STEP_DURATION = 1 / TILE_SPEED_PER_SECOND;
const SAVE_SCHEMA_VERSION = 1;
const DEFAULT_MAP_ID = 'map_starter_field';
const STABLE_ID_PATTERNS = {
  map: /^map_[a-z0-9]+(?:_[a-z0-9]+)*$/,
  door: /^door_[a-z0-9]+(?:_[a-z0-9]+)*$/,
  key: /^key_[a-z0-9]+(?:_[a-z0-9]+)*$/,
  medal: /^medal_[a-z0-9]+(?:_[a-z0-9]+)*$/,
  companion: /^companion_[a-z0-9]+(?:_[a-z0-9]+)*$/,
  item: /^item_[a-z0-9]+(?:_[a-z0-9]+)*$/
};

const STARTER_ENEMY_STARTS = [
  { id: 'enemy_fire_slime_01', x: 3, y: 0, species: 'slime', nameKey: 'fireSlime', element: 'fire' },
  { id: 'enemy_earth_slime_01', x: 6, y: 2, species: 'slime', nameKey: 'earthSlime', element: 'earth' },
  { id: 'enemy_water_slime_01', x: 9, y: 4, species: 'slime', nameKey: 'waterSlime', element: 'water' }
];

const SECOND_MAP_ENEMY_STARTS = [
  {
    id: 'enemy_tree_monster_01',
    x: 4,
    y: 1,
    species: 'tree_monster',
    nameKey: 'treeMonster',
    element: 'earth'
  }
];

const STARTER_REQUIRED_SLIME_IDS = [
  'enemy_fire_slime_01',
  'enemy_earth_slime_01',
  'enemy_water_slime_01'
];

const STARTER_DOOR_EVENT_FLAG = 'event_starter_door_spawned';
const STARTER_DOOR = { id: 'door_starter_exit', type: 'door', x: 10, y: 10 };
const SECOND_MAP_ID = 'map_second_field';
const SECOND_MAP_ENTRY = { x: 1, y: 1 };

const STARTER_NPC_TEMPLATE = { id: 'npc_starter_guide', type: 'npc', x: 11, y: 11, nameKey: 'npcGuide' };

const STARTER_GUIDE_DIALOGUE_NODES = {
  intro_question: {
    id: 'intro_question',
    speaker: 'npc',
    textKey: 'npcStoryQuestion',
    choices: [
      {
        id: 'with_story',
        textKey: 'dialogueChoiceWithStory',
        nextNodeId: 'story_selected',
        effects: {
          setStoryModeChoice: 'story',
          grantKeyId: 'key_story',
          removeKeyIds: ['key_no_story'],
          npcFlags: {
            npc_starter_guide_intro_seen: true,
            npc_starter_guide_story_choice_made: true
          },
          eventFlags: {
            event_starter_guide_story_choice_made: true
          }
        }
      },
      {
        id: 'without_story',
        textKey: 'dialogueChoiceWithoutStory',
        nextNodeId: 'no_story_selected',
        effects: {
          setStoryModeChoice: 'no_story',
          grantKeyId: 'key_no_story',
          removeKeyIds: ['key_story'],
          npcFlags: {
            npc_starter_guide_intro_seen: true,
            npc_starter_guide_story_choice_made: true
          },
          eventFlags: {
            event_starter_guide_story_choice_made: true
          }
        }
      }
    ]
  },
  story_selected: {
    id: 'story_selected',
    speaker: 'npc',
    textKey: 'npcStoryChoiceAccepted',
    nextNodeId: null,
    effects: {
      npcFlags: {
        npc_starter_guide_followup_seen: true
      }
    }
  },
  no_story_selected: {
    id: 'no_story_selected',
    speaker: 'npc',
    textKey: 'npcNoStoryChoiceAccepted',
    nextNodeId: null,
    effects: {
      npcFlags: {
        npc_starter_guide_followup_seen: true
      }
    }
  },
  followup_story: {
    id: 'followup_story',
    speaker: 'npc',
    textKey: 'npcStoryModeFollowup',
    nextNodeId: null,
    conditions: {
      storyModeChoice: 'story'
    }
  },
  followup_no_story: {
    id: 'followup_no_story',
    speaker: 'npc',
    textKey: 'npcNoStoryModeFollowup',
    nextNodeId: null,
    conditions: {
      storyModeChoice: 'no_story'
    }
  },
  post_door_story: {
    id: 'post_door_story',
    speaker: 'npc',
    textKey: 'npcStoryModeDoorSpawnedFollowup',
    nextNodeId: null,
    conditions: {
      storyModeChoice: 'story'
    }
  },
  post_door_no_story: {
    id: 'post_door_no_story',
    speaker: 'npc',
    textKey: 'npcNoStoryModeDoorSpawnedFollowup',
    nextNodeId: null,
    conditions: {
      storyModeChoice: 'no_story'
    }
  }
};

const STARTER_GUIDE_DIALOGUE_FLOW = {
  entryNodeId: 'intro_question',
  postDoorNodeByStoryChoice: {
    story: 'post_door_story',
    no_story: 'post_door_no_story'
  },
  repeatNodeByStoryChoice: {
    story: 'followup_story',
    no_story: 'followup_no_story'
  }
};

const STARTER_MAP_LAYOUT = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1],
  [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
  [0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0]
];

const SECOND_MAP_LAYOUT = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const MAP_DEFINITIONS = {
  [DEFAULT_MAP_ID]: {
    id: DEFAULT_MAP_ID,
    layout: STARTER_MAP_LAYOUT,
    spawn: { x: 0, y: 0 },
    enemies: STARTER_ENEMY_STARTS,
    npcs: [STARTER_NPC_TEMPLATE],
    doors: [STARTER_DOOR]
  },
  [SECOND_MAP_ID]: {
    id: SECOND_MAP_ID,
    layout: SECOND_MAP_LAYOUT,
    spawn: SECOND_MAP_ENTRY,
    enemies: SECOND_MAP_ENEMY_STARTS,
    npcs: [],
    doors: []
  }
};

const screens = {
  language: document.getElementById('language-screen'),
  menu: document.getElementById('menu-screen'),
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
  info: document.getElementById('info-screen')
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
  inventoryBack: document.getElementById('inventory-back'),
  infoTitle: document.getElementById('info-title'),
  infoHelper: document.getElementById('info-helper'),
  infoDetails: document.getElementById('info-details'),
  infoBack: document.getElementById('info-back')
};

const saveSlotsList = document.getElementById('save-slots');
const battleOptionsList = document.getElementById('battle-options-list');
const dialogueArea = document.getElementById('dialogue-area');
const dialoguePlayerAvatar = document.getElementById('dialogue-player-avatar');

const STORAGE_LANGUAGE_KEY = 'preferredLanguage';
const STORAGE_SAVE_KEY = 'gridGameSaveSlots';
const SLOT_COUNT = 3;

let currentLanguage = 'en';
let currentSlotId = null;
let gameMenuStatusKey = '';
let showCoordinates = false;
let pendingDeleteSlotId = null;
let currentMapId = DEFAULT_MAP_ID;

const playerState = {
  tileX: 0,
  tileY: 0,
  path: [],
  moving: false,
  stepToX: 0,
  stepToY: 0,
  stepElapsed: 0,
  lastTimestamp: null
};

let enemyStates = [];
let npcState = null;

const playerPiece = document.createElement('div');
playerPiece.className = 'player-piece';
gridBoard.append(playerPiece);

const BATTLE_MENUS = {
  ROOT: 'root',
  FIGHT_CATEGORIES: 'fightCategories',
  OFFENSIVE: 'offensive',
  DEFENDERS: 'defenders'
};

const ENEMY_SPECIES_DEFINITIONS = {
  slime: {
    hp: 20,
    attack: 3,
    drops: {
      type: 'none',
      itemKey: null
    },
    skills: [
      {
        nameKey: 'slimeAttack',
        damageMultiplier: 1,
        elementType: 'none',
        category: 'offensive'
      }
    ]
  },
  tree_monster: {
    fixedElement: 'earth',
    hp: 25,
    attack: 4,
    drops: {
      type: 'none',
      itemKey: null
    },
    skills: [
      {
        nameKey: 'branchStrike',
        damageMultiplier: 1,
        elementType: 'earth',
        category: 'offensive'
      }
    ]
  }
};
enemyStates = createInitialEnemyStates();
npcState = createNpcState(enemyStates);

const dialogueState = {
  npcId: null,
  nodeId: null
};

const battleState = {
  menu: BATTLE_MENUS.ROOT,
  enemyId: null,
  enemy: null,
  player: null,
  feedbackKeys: [],
  resultMessageKey: 'obtainedNothing',
  resultItemKey: null
};

const ELEMENTAL_ADVANTAGE = {
  fire: 'earth',
  earth: 'water',
  water: 'fire'
};

const PLAYER_CLASS_STATS = {
  mage: { hp: 20, attack: 10 },
  warrior: { hp: 40, attack: 5 }
};

const translations = {
  en: {
    languageTitle: 'Select Language',
    languageSubtitle: 'Choose one option to continue.',
    menuTitle: 'Main Menu',
    menuInstruction: 'Select an option.',
    play: 'Play',
    back: 'Back',
    saveTitle: 'Save Slots',
    saveSubtitle: 'Choose a save slot.',
    slotLabel: 'Slot {number}',
    newGame: 'New Game',
    deleteSlot: 'X',
    deleteSaveConfirm: 'Are you sure you want to delete this save data?',
    yes: 'Yes',
    no: 'No',
    elementQuestion: 'What element do you want to choose?',
    fire: 'Fire',
    water: 'Water',
    earth: 'Earth',
    classQuestion: 'What class are you?',
    warrior: 'Warrior',
    mage: 'Mage',
    classSaved: 'Selection saved for Slot {number}.',
    gameplayTitle: 'Grid Movement',
    gameplayHelper: 'Tap or click a reachable gray tile to move. Tap a nearby enemy to battle, or tap a nearby NPC to talk.',
    gameplaySlot: 'Slot {number}: {element} • {className}',
    battleTitle: 'Battle',
    battleStatusPlayer: 'Player',
    fight: 'Fight',
    run: 'Run',
    gameMenu: 'Game Menu',
    backToGame: 'Back to Game',
    inventory: 'Inventory',
    info: 'Info',
    settings: 'Settings',
    showCoordinates: 'Show Coordinates',
    on: 'On',
    off: 'Off',
    save: 'Save',
    saveQuit: 'Save & Quit',
    quit: 'Quit',
    inventoryTitle: 'Inventory',
    inventoryEmpty: 'Your inventory is empty',
    infoTitle: 'Info',
    infoPlaceholder: 'Current character and slot information.',
    saved: 'Saved.',
    infoSlot: 'Slot: {slot}',
    infoElement: 'Element: {element}',
    infoClass: 'Class: {className}',
    classLabel: 'Class',
    infoCoordinates: 'Coordinates: ({x}, {y})',
    infoNone: 'None',
    hp: 'HP',
    attack: 'Attack',
    fireSlime: 'Fire Slime',
    earthSlime: 'Earth Slime',
    waterSlime: 'Water Slime',
    treeMonster: 'Tree Monster',
    slimeAttack: 'Slime Attack',
    branchStrike: 'Branch Strike',
    swordSlash: 'Sword Slash',
    stickBonk: 'Stick Bonk',
    fireSlash: 'Fire Slash',
    waterSlash: 'Water Slash',
    earthSlash: 'Earth Slash',
    fireBall: 'Fire Ball',
    waterBall: 'Water Ball',
    earthBall: 'Earth Ball',
    offensive: 'Offensive',
    defenders: 'Defenders',
    defendersPlaceholder: 'Defenders menu placeholder.',
    battleChooseSkill: 'Choose an offensive skill.',
    battleResultVictory: 'Victory',
    battleResultDefeat: 'You have been defeated',
    obtainedItem: 'You have obtained {item}',
    obtainedNothing: 'You have obtained nothing',
    continueToGrid: 'Continue',
    returnToMainMenu: 'Return to Main Menu',
    noItem: 'nothing',
    skillDamage: 'Damage {percent}%',
    elementLabel: 'Element: {element}',
    nonElemental: 'Non-elemental',
    critical: 'Critical!',
    resisted: 'Resisted!',
    npcGuide: 'Village Guide',
    dialogueTitle: 'Dialogue',
    dialogueTapToContinue: 'Tap or click to continue.',
    dialogueSelectAnswer: 'Choose one answer.',
    dialoguePlayerLabel: 'You',
    npcStoryQuestion: 'Do you want to go on an adventure with the story?',
    dialogueChoiceWithStory: 'With the story',
    dialogueChoiceWithoutStory: 'Without the story',
    npcStoryChoiceAccepted: 'Great. I will guide you through the story path. Take this story key.',
    npcNoStoryChoiceAccepted: 'Understood. You can travel freely without story guidance. Take this no-story key.',
    npcStoryModeFollowup: 'Your story path is set. The story key will open your way later.',
    npcNoStoryModeFollowup: 'Your free path is set. The no-story key marks your route.',
    npcStoryModeDoorSpawnedFollowup: 'The gate has appeared. Follow the story path when you are ready to move forward.',
    npcNoStoryModeDoorSpawnedFollowup: 'The gate has appeared. Your free route is open, so move forward whenever you want.',
    dir: 'ltr'
  },
  ja: {
    languageTitle: '言語を選択',
    languageSubtitle: '続行する言語を選んでください。',
    menuTitle: 'メインメニュー',
    menuInstruction: '項目を選んでください。',
    play: 'プレイ',
    back: '戻る',
    saveTitle: 'セーブスロット',
    saveSubtitle: 'セーブスロットを選んでください。',
    slotLabel: 'スロット {number}',
    newGame: 'ニューゲーム',
    deleteSlot: 'X',
    deleteSaveConfirm: 'このセーブデータを削除してもよろしいですか？',
    yes: 'はい',
    no: 'いいえ',
    elementQuestion: 'どの属性を選びますか？',
    fire: '火',
    water: '水',
    earth: '土',
    classQuestion: 'あなたのクラスは？',
    warrior: '戦士',
    mage: '魔法使い',
    classSaved: 'スロット {number} に選択を保存しました。',
    gameplayTitle: 'グリッド移動',
    gameplayHelper: '到達できる灰色タイルをタップまたはクリックして移動します。近くの敵は戦闘、近くのNPCとは会話できます。',
    gameplaySlot: 'スロット {number}: {element} • {className}',
    battleTitle: 'バトル',
    battleStatusPlayer: 'プレイヤー',
    fight: 'たたかう',
    run: 'にげる',
    gameMenu: 'ゲームメニュー',
    backToGame: 'ゲームに戻る',
    inventory: 'インベントリ',
    info: '情報',
    settings: '設定',
    showCoordinates: '座標を表示',
    on: 'オン',
    off: 'オフ',
    save: 'セーブ',
    saveQuit: 'セーブして終了',
    quit: '終了',
    inventoryTitle: 'インベントリ',
    inventoryEmpty: 'あなたのインベントリは空です',
    infoTitle: '情報',
    infoPlaceholder: '現在のキャラクター情報とスロット情報です。',
    saved: '保存しました。',
    infoSlot: 'スロット: {slot}',
    infoElement: '属性: {element}',
    infoClass: 'クラス: {className}',
    classLabel: 'クラス',
    infoCoordinates: '座標: ({x}, {y})',
    infoNone: 'なし',
    hp: 'HP',
    attack: '攻撃',
    fireSlime: 'ファイアスライム',
    earthSlime: 'アーススライム',
    waterSlime: 'ウォータースライム',
    treeMonster: 'ツリーモンスター',
    slimeAttack: 'スライムアタック',
    branchStrike: 'ブランチストライク',
    swordSlash: 'ソードスラッシュ',
    stickBonk: 'スティックボンク',
    fireSlash: 'ファイアスラッシュ',
    waterSlash: 'ウォータースラッシュ',
    earthSlash: 'アーススラッシュ',
    fireBall: 'ファイアボール',
    waterBall: 'ウォーターボール',
    earthBall: 'アースボール',
    offensive: '攻撃',
    defenders: '防御',
    defendersPlaceholder: '防御メニューのプレースホルダーです。',
    battleChooseSkill: '攻撃スキルを選択してください。',
    battleResultVictory: '勝利',
    battleResultDefeat: 'あなたは倒されました',
    obtainedItem: '{item} を獲得しました',
    obtainedNothing: '何も獲得しませんでした',
    continueToGrid: '続ける',
    returnToMainMenu: 'メインメニューに戻る',
    noItem: 'なし',
    skillDamage: 'ダメージ {percent}%',
    elementLabel: '属性: {element}',
    nonElemental: '無属性',
    critical: 'クリティカル！',
    resisted: '耐性！',
    npcGuide: '村の案内人',
    dialogueTitle: '会話',
    dialogueTapToContinue: 'タップまたはクリックで続行します。',
    dialogueSelectAnswer: '回答を1つ選んでください。',
    dialoguePlayerLabel: 'あなた',
    npcStoryQuestion: '物語ありで冒険に出ますか？',
    dialogueChoiceWithStory: '物語ありで進む',
    dialogueChoiceWithoutStory: '物語なしで進む',
    npcStoryChoiceAccepted: 'いい選択です。物語ルートを案内します。ストーリーキーを受け取ってください。',
    npcNoStoryChoiceAccepted: 'わかりました。物語案内なしで自由に進めます。ノーストーリーキーを受け取ってください。',
    npcStoryModeFollowup: '物語ルートは確定しています。ストーリーキーはこの先で役立ちます。',
    npcNoStoryModeFollowup: '自由ルートは確定しています。ノーストーリーキーがあなたの道しるべです。',
    npcStoryModeDoorSpawnedFollowup: '扉が現れました。準備ができたら、ストーリーの道を進んでください。',
    npcNoStoryModeDoorSpawnedFollowup: '扉が現れました。自由ルートが開いたので、好きなときに先へ進めます。',
    dir: 'ltr'
  },
  ru: {
    languageTitle: 'Выберите язык',
    languageSubtitle: 'Выберите язык, чтобы продолжить.',
    menuTitle: 'Главное меню',
    menuInstruction: 'Выберите пункт.',
    play: 'Играть',
    back: 'Назад',
    saveTitle: 'Слоты сохранения',
    saveSubtitle: 'Выберите слот сохранения.',
    slotLabel: 'Слот {number}',
    newGame: 'Новая игра',
    deleteSlot: 'X',
    deleteSaveConfirm: 'Вы уверены, что хотите удалить эти данные сохранения?',
    yes: 'Да',
    no: 'Нет',
    elementQuestion: 'Какой элемент вы хотите выбрать?',
    fire: 'Огонь',
    water: 'Вода',
    earth: 'Земля',
    classQuestion: 'Какой вы класс?',
    warrior: 'Воин',
    mage: 'Маг',
    classSaved: 'Выбор сохранён для слота {number}.',
    gameplayTitle: 'Движение по сетке',
    gameplayHelper: 'Нажмите на достижимую серую клетку, чтобы переместиться. Нажмите на соседнего врага для боя или на соседнего NPC для диалога.',
    gameplaySlot: 'Слот {number}: {element} • {className}',
    battleTitle: 'Бой',
    battleStatusPlayer: 'Игрок',
    fight: 'Биться',
    run: 'Бежать',
    gameMenu: 'Меню игры',
    backToGame: 'Вернуться в игру',
    inventory: 'Инвентарь',
    info: 'Инфо',
    settings: 'Настройки',
    showCoordinates: 'Показывать координаты',
    on: 'Вкл',
    off: 'Выкл',
    save: 'Сохранить',
    saveQuit: 'Сохранить и выйти',
    quit: 'Выйти',
    inventoryTitle: 'Инвентарь',
    inventoryEmpty: 'Ваш инвентарь пуст',
    infoTitle: 'Инфо',
    infoPlaceholder: 'Текущая информация о персонаже и слоте.',
    saved: 'Сохранено.',
    infoSlot: 'Слот: {slot}',
    infoElement: 'Элемент: {element}',
    infoClass: 'Класс: {className}',
    classLabel: 'Класс',
    infoCoordinates: 'Координаты: ({x}, {y})',
    infoNone: 'Нет',
    hp: 'HP',
    attack: 'Атака',
    fireSlime: 'Огненный слизень',
    earthSlime: 'Земляной слизень',
    waterSlime: 'Водяной слизень',
    treeMonster: 'Древесный монстр',
    slimeAttack: 'Атака слизня',
    branchStrike: 'Удар ветвью',
    swordSlash: 'Удар мечом',
    stickBonk: 'Удар палкой',
    fireSlash: 'Огненный разрез',
    waterSlash: 'Водный разрез',
    earthSlash: 'Земляной разрез',
    fireBall: 'Огненный шар',
    waterBall: 'Водный шар',
    earthBall: 'Земляной шар',
    offensive: 'Атака',
    defenders: 'Защитники',
    defendersPlaceholder: 'Раздел защитников (заглушка).',
    battleChooseSkill: 'Выберите атакующий навык.',
    battleResultVictory: 'Победа',
    battleResultDefeat: 'Вы были побеждены',
    obtainedItem: 'Вы получили {item}',
    obtainedNothing: 'Вы ничего не получили',
    continueToGrid: 'Продолжить',
    returnToMainMenu: 'Вернуться в главное меню',
    noItem: 'ничего',
    skillDamage: 'Урон {percent}%',
    elementLabel: 'Элемент: {element}',
    nonElemental: 'Без элемента',
    critical: 'Критический удар!',
    resisted: 'Сопротивление!',
    npcGuide: 'Проводник деревни',
    dialogueTitle: 'Диалог',
    dialogueTapToContinue: 'Нажмите или коснитесь, чтобы продолжить.',
    dialogueSelectAnswer: 'Выберите один ответ.',
    dialoguePlayerLabel: 'Вы',
    npcStoryQuestion: 'Ты хочешь отправиться в приключение с сюжетом?',
    dialogueChoiceWithStory: 'С сюжетом',
    dialogueChoiceWithoutStory: 'Без сюжета',
    npcStoryChoiceAccepted: 'Отлично. Я направлю тебя по сюжетному пути. Возьми сюжетный ключ.',
    npcNoStoryChoiceAccepted: 'Понял. Можешь идти свободно без сюжетного пути. Возьми ключ без сюжета.',
    npcStoryModeFollowup: 'Твой сюжетный путь уже выбран. Сюжетный ключ пригодится дальше.',
    npcNoStoryModeFollowup: 'Твой свободный путь уже выбран. Ключ без сюжета отмечает твой маршрут.',
    npcStoryModeDoorSpawnedFollowup: 'Врата появились. Когда будешь готов, иди дальше по сюжетному пути.',
    npcNoStoryModeDoorSpawnedFollowup: 'Врата появились. Свободный маршрут открыт, так что двигайся дальше когда захочешь.',
    dir: 'ltr'
  },
  ar: {
    languageTitle: 'اختر اللغة',
    languageSubtitle: 'اختر لغة واحدة للمتابعة.',
    menuTitle: 'القائمة الرئيسية',
    menuInstruction: 'اختر خيارًا.',
    play: 'لعب',
    back: 'رجوع',
    saveTitle: 'خانات الحفظ',
    saveSubtitle: 'اختر خانة حفظ.',
    slotLabel: 'الخانة {number}',
    newGame: 'لعبة جديدة',
    deleteSlot: 'X',
    deleteSaveConfirm: 'هل أنت متأكد أنك تريد حذف بيانات الحفظ هذه؟',
    yes: 'نعم',
    no: 'لا',
    elementQuestion: 'ما العنصر الذي تريد اختياره؟',
    fire: 'النار',
    water: 'الماء',
    earth: 'الأرض',
    classQuestion: 'ما فئتك؟',
    warrior: 'محارب',
    mage: 'ساحر',
    classSaved: 'تم حفظ الاختيار في الخانة {number}.',
    gameplayTitle: 'الحركة على الشبكة',
    gameplayHelper: 'انقر أو المس مربّعًا رماديًا يمكن الوصول إليه للتحرك. المس عدوًا مجاورًا للمعركة أو شخصية NPC مجاورة لبدء الحوار.',
    gameplaySlot: 'الخانة {number}: {element} • {className}',
    battleTitle: 'معركة',
    battleStatusPlayer: 'اللاعب',
    fight: 'قتال',
    run: 'هرب',
    gameMenu: 'قائمة اللعبة',
    backToGame: 'العودة إلى اللعبة',
    inventory: 'المخزون',
    info: 'معلومات',
    settings: 'الإعدادات',
    showCoordinates: 'إظهار الإحداثيات',
    on: 'تشغيل',
    off: 'إيقاف',
    save: 'حفظ',
    saveQuit: 'حفظ وإنهاء',
    quit: 'إنهاء',
    inventoryTitle: 'المخزون',
    inventoryEmpty: 'مخزونك فارغ',
    infoTitle: 'معلومات',
    infoPlaceholder: 'معلومات الشخصية الحالية والخانة.',
    saved: 'تم الحفظ.',
    infoSlot: 'الخانة: {slot}',
    infoElement: 'العنصر: {element}',
    infoClass: 'الفئة: {className}',
    classLabel: 'الفئة',
    infoCoordinates: 'الإحداثيات: ({x}, {y})',
    infoNone: 'لا يوجد',
    hp: 'الصحة',
    attack: 'الهجوم',
    fireSlime: 'سلايم النار',
    earthSlime: 'سلايم الأرض',
    waterSlime: 'سلايم الماء',
    treeMonster: 'وحش الشجرة',
    slimeAttack: 'هجوم السلايم',
    branchStrike: 'ضربة الغصن',
    swordSlash: 'ضربة السيف',
    stickBonk: 'ضربة العصا',
    fireSlash: 'ضربة النار',
    waterSlash: 'ضربة الماء',
    earthSlash: 'ضربة الأرض',
    fireBall: 'كرة النار',
    waterBall: 'كرة الماء',
    earthBall: 'كرة الأرض',
    offensive: 'هجومي',
    defenders: 'المدافعون',
    defendersPlaceholder: 'هذا عرض تجريبي لقائمة المدافعين.',
    battleChooseSkill: 'اختر مهارة هجومية.',
    battleResultVictory: 'نصر',
    battleResultDefeat: 'لقد هُزمت',
    obtainedItem: 'لقد حصلت على {item}',
    obtainedNothing: 'لم تحصل على أي شيء',
    continueToGrid: 'متابعة',
    returnToMainMenu: 'العودة إلى القائمة الرئيسية',
    noItem: 'لا شيء',
    skillDamage: 'الضرر {percent}%',
    elementLabel: 'العنصر: {element}',
    nonElemental: 'غير عنصري',
    critical: 'ضربة حرجة!',
    resisted: 'تمت المقاومة!',
    npcGuide: 'مرشد القرية',
    dialogueTitle: 'حوار',
    dialogueTapToContinue: 'المس أو انقر للمتابعة.',
    dialogueSelectAnswer: 'اختر إجابة واحدة.',
    dialoguePlayerLabel: 'أنت',
    npcStoryQuestion: 'هل تريد أن تنطلق في مغامرة مع القصة؟',
    dialogueChoiceWithStory: 'مع القصة',
    dialogueChoiceWithoutStory: 'بدون القصة',
    npcStoryChoiceAccepted: 'ممتاز. سأرشدك عبر مسار القصة. خذ مفتاح القصة.',
    npcNoStoryChoiceAccepted: 'مفهوم. يمكنك المتابعة بحرية بدون مسار القصة. خذ مفتاح بدون قصة.',
    npcStoryModeFollowup: 'تم تثبيت مسار القصة الخاص بك. مفتاح القصة سيفتح طريقك لاحقًا.',
    npcNoStoryModeFollowup: 'تم تثبيت مسارك الحر. مفتاح بدون قصة يحدد طريقك.',
    npcStoryModeDoorSpawnedFollowup: 'لقد ظهرت البوابة. عندما تصبح جاهزًا، تابع التقدم عبر مسار القصة.',
    npcNoStoryModeDoorSpawnedFollowup: 'لقد ظهرت البوابة. أصبح المسار الحر مفتوحًا، لذا يمكنك التقدم متى أردت.',
    dir: 'rtl'
  }
};

function formatText(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}

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

function isGround(x, y, mapId = currentMapId) {
  const map = getMapDefinition(mapId);
  return isInsideGrid(x, y) && map.layout[y][x] === 0;
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
    skills: speciesDefinition.skills.map((skill) => ({ ...skill }))
  };
}

function createInitialEnemyStates(mapId = currentMapId) {
  const occupiedKeys = new Set();
  const enemyTemplates = getMapDefinition(mapId).enemies || [];

  return enemyTemplates.map((enemyTemplate) => createEnemyState(enemyTemplate, occupiedKeys, mapId));
}

function isValidNpcSpawn(x, y, enemyList) {
  if (!isGround(x, y) || (x === 0 && y === 0)) {
    return false;
  }

  return !enemyList.some((enemy) => enemy.x === x && enemy.y === y);
}

function createNpcState(enemyList, mapId = currentMapId) {
  const npcTemplate = (getMapDefinition(mapId).npcs || [])[0];
  if (!npcTemplate) {
    return null;
  }

  const desired = { x: npcTemplate.x, y: npcTemplate.y };

  if (isValidNpcSpawn(desired.x, desired.y, enemyList)) {
    return { ...npcTemplate, x: desired.x, y: desired.y };
  }

  for (let y = GRID_SIZE - 1; y >= 0; y -= 1) {
    for (let x = GRID_SIZE - 1; x >= 0; x -= 1) {
      if (isValidNpcSpawn(x, y, enemyList)) {
        return { ...npcTemplate, x, y };
      }
    }
  }

  return { ...npcTemplate, x: 0, y: 0 };
}

function getNpcAtTile(x, y) {
  if (!npcState) {
    return null;
  }

  return npcState.x === x && npcState.y === y ? npcState : null;
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

function isWalkable(x, y) {
  return isGround(x, y) && !isEnemyTile(x, y) && !isNpcTile(x, y);
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
      activePartyMemberIds: [],
      recruitedCompanionIds: []
    },
    inventory: {
      inventoryItems: [],
      equippedGear: {}
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

  if (!isGround(x, y, mapId)) {
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

  return {
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
      activePartyMemberIds: normalizeStringArray(slot?.party?.activePartyMemberIds),
      recruitedCompanionIds: normalizeStableIdArray(slot?.party?.recruitedCompanionIds, STABLE_ID_PATTERNS.companion)
    },
    inventory: {
      inventoryItems: normalizeStableIdArray(slot?.inventory?.inventoryItems, STABLE_ID_PATTERNS.item),
      equippedGear: normalizeStringValueRecord(slot?.inventory?.equippedGear)
    }
  };
}

function normalizeLegacySlot(slot, slotId) {
  const canonical = createCanonicalSlot(slotId);
  const position = normalizePosition(slot?.playerData, DEFAULT_MAP_ID);

  canonical.playerIdentity.chosenElement = normalizeStringEnum(slot?.element, ['fire', 'water', 'earth']);
  canonical.playerIdentity.chosenClass = normalizeStringEnum(slot?.class, ['warrior', 'mage']);
  canonical.playerWorldPosition.playerX = position.x;
  canonical.playerWorldPosition.playerY = position.y;
  canonical.worldProgress.defeatedEnemyIds = normalizeDefeatedEnemyIds(slot?.defeatedEnemyIds);
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
  localStorage.setItem(STORAGE_SAVE_KEY, JSON.stringify(slots));
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

  const lines = [
    formatText(locale.infoSlot, { slot: slot.metadata.slotId }),
    formatText(locale.infoElement, {
      element: slot.playerIdentity?.chosenElement ? locale[slot.playerIdentity.chosenElement] : locale.infoNone
    }),
    formatText(locale.infoClass, {
      className: slot.playerIdentity?.chosenClass ? locale[slot.playerIdentity.chosenClass] : locale.infoNone
    }),
    formatText(locale.infoCoordinates, { x: currentPos.x, y: currentPos.y })
  ];

  textNodes.infoDetails.textContent = lines.join('\n');
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

function getStarterGuideDialogueStartNodeId(slot) {
  const postDoorNodeId = STARTER_GUIDE_DIALOGUE_FLOW.postDoorNodeByStoryChoice[slot?.playerIdentity?.storyModeChoice];
  const doorState = getStarterDoorState(slot);

  if (doorState.spawned && postDoorNodeId) {
    return postDoorNodeId;
  }

  const storyChoiceMade = Boolean(slot?.npcStateFlags?.npc_starter_guide_story_choice_made);

  if (!storyChoiceMade) {
    return STARTER_GUIDE_DIALOGUE_FLOW.entryNodeId;
  }

  return STARTER_GUIDE_DIALOGUE_FLOW.repeatNodeByStoryChoice[slot?.playerIdentity?.storyModeChoice] || 'followup_story';
}

function getCurrentDialogueNode() {
  if (!dialogueState.nodeId) {
    return null;
  }

  return STARTER_GUIDE_DIALOGUE_NODES[dialogueState.nodeId] || null;
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
      ...(slot.npcStateFlags || {}),
      ...(effects.npcFlags || {})
    }
  });
}

function completeDialogueAndReturnToMap() {
  dialogueState.npcId = null;
  dialogueState.nodeId = null;
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

  const speakerName = line.speaker === 'player' ? locale.dialoguePlayerLabel : locale.npcGuide;
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
  if (!npc || npc.id !== 'npc_starter_guide' || !currentSlotId) {
    return;
  }

  const slot = getSlotById(currentSlotId);
  const startNodeId = getStarterGuideDialogueStartNodeId(slot);
  const startNode = STARTER_GUIDE_DIALOGUE_NODES[startNodeId];

  if (!startNode || !matchesDialogueConditions(startNode, slot)) {
    return;
  }

  dialogueState.npcId = npc.id;
  dialogueState.nodeId = startNodeId;
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
    skills: enemy.skills.map((skill) => ({ ...skill }))
  };
}

function getPlayerStatsByClass(className) {
  return PLAYER_CLASS_STATS[className] || PLAYER_CLASS_STATS.warrior;
}

function getPlayerOffensiveSkills(className, element) {
  const baseSkillByClass = {
    warrior: { nameKey: 'swordSlash', damageMultiplier: 1, elementType: 'none', category: 'offensive' },
    mage: { nameKey: 'stickBonk', damageMultiplier: 0.25, elementType: 'none', category: 'offensive' }
  };

  const elementalSkills = {
    warrior: {
      fire: { nameKey: 'fireSlash', damageMultiplier: 1, elementType: 'fire', category: 'offensive' },
      water: { nameKey: 'waterSlash', damageMultiplier: 1, elementType: 'water', category: 'offensive' },
      earth: { nameKey: 'earthSlash', damageMultiplier: 1, elementType: 'earth', category: 'offensive' }
    },
    mage: {
      fire: { nameKey: 'fireBall', damageMultiplier: 2, elementType: 'fire', category: 'offensive' },
      water: { nameKey: 'waterBall', damageMultiplier: 2, elementType: 'water', category: 'offensive' },
      earth: { nameKey: 'earthBall', damageMultiplier: 2, elementType: 'earth', category: 'offensive' }
    }
  };

  const baseSkill = baseSkillByClass[className];
  const elementalSkill = elementalSkills[className]?.[element];

  return [baseSkill, elementalSkill].filter(Boolean).map((skill) => ({ ...skill }));
}

function createPlayerBattleData(slot) {
  const chosenClass = slot.playerIdentity?.chosenClass || 'warrior';
  const chosenElement = slot.playerIdentity?.chosenElement || 'fire';
  const stats = getPlayerStatsByClass(chosenClass);

  return {
    class: chosenClass,
    element: chosenElement,
    maxHp: stats.hp,
    hp: stats.hp,
    attack: stats.attack,
    skills: getPlayerOffensiveSkills(chosenClass, chosenElement)
  };
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
  const dropResult = resolveDropMessage(battleState.enemy);

  if (battleState.enemyId) {
    enemyStates = enemyStates.filter((enemy) => enemy.id !== battleState.enemyId);
  }

  if (currentSlotId) {
    const defeatedEnemyIds = getDefeatedEnemyIdsFromCurrentState();
    synchronizeStarterDoorProgress(currentSlotId, defeatedEnemyIds);
  }

  battleState.resultMessageKey = dropResult.key;
  battleState.resultItemKey = dropResult.itemKey;
  battleState.menu = BATTLE_MENUS.ROOT;

  buildGrid();
  renderVictoryScreen();
  showScreen('victory');
}

function endBattleDefeat() {
  battleState.menu = BATTLE_MENUS.ROOT;
  renderDefeatScreen();
  showScreen('defeat');
}

function applyPlayerSkill(skillIndex) {
  const enemy = battleState.enemy;
  const player = battleState.player;
  const skill = player?.skills?.[skillIndex];

  if (!enemy || !player || !skill) {
    return;
  }

  battleState.feedbackKeys = [];

  const playerAttackResult = calculateDamageWithElement(player, skill, enemy);
  enemy.hp = clampHp(enemy.hp - playerAttackResult.damage);
  if (playerAttackResult.feedbackKey) {
    battleState.feedbackKeys.push(playerAttackResult.feedbackKey);
  }

  if (enemy.hp <= 0) {
    renderBattleUI();
    endBattleVictory();
    return;
  }

  const enemySkill = enemy.skills[0];
  const enemyAttackResult = calculateDamageWithElement(enemy, enemySkill, player);
  player.hp = clampHp(player.hp - enemyAttackResult.damage);
  if (enemyAttackResult.feedbackKey) {
    battleState.feedbackKeys.push(enemyAttackResult.feedbackKey);
  }

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

  if (!enemy || !player) {
    textNodes.battleEnemyName.textContent = '';
    textNodes.battleEnemyStats.textContent = '';
    textNodes.battleEnemyHp.textContent = '';
    textNodes.battlePlayerName.textContent = '';
    textNodes.battlePlayerStats.textContent = '';
    textNodes.battlePlayerHp.textContent = '';
    updateHpBar(textNodes.battleEnemyHpFill, 0, 1);
    updateHpBar(textNodes.battlePlayerHpFill, 0, 1);
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

  updateHpBar(textNodes.battleEnemyHpFill, enemy.hp, enemy.maxHp);
  updateHpBar(textNodes.battlePlayerHpFill, player.hp, player.maxHp);

  if (battleState.feedbackKeys.length > 0) {
    textNodes.battleSubtitle.textContent = battleState.feedbackKeys.map((key) => locale[key]).join(' • ');
  } else if (battleState.menu === BATTLE_MENUS.OFFENSIVE) {
    textNodes.battleSubtitle.textContent = locale.battleChooseSkill;
  } else if (battleState.menu === BATTLE_MENUS.DEFENDERS) {
    textNodes.battleSubtitle.textContent = locale.defendersPlaceholder;
  } else {
    textNodes.battleSubtitle.textContent = '';
  }

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

  textNodes.victoryTitle.textContent = locale.battleResultVictory;

  if (battleState.resultMessageKey === 'obtainedItem' && battleState.resultItemKey) {
    textNodes.victoryMessage.textContent = formatText(locale.obtainedItem, {
      item: locale[battleState.resultItemKey] || battleState.resultItemKey
    });
  } else {
    textNodes.victoryMessage.textContent = locale.obtainedNothing;
  }

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
  textNodes.menuBack.textContent = locale.back;
  textNodes.saveTitle.textContent = locale.saveTitle;
  textNodes.saveSubtitle.textContent = locale.saveSubtitle;
  textNodes.saveBack.textContent = locale.back;
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
  textNodes.gmInventory.textContent = locale.inventory;
  textNodes.gmInfo.textContent = locale.info;
  textNodes.gmSettings.textContent = locale.settings;
  textNodes.gmSave.textContent = locale.save;
  textNodes.gmSaveQuit.textContent = locale.saveQuit;
  textNodes.gmQuit.textContent = locale.quit;
  renderSettingsText();

  textNodes.inventoryTitle.textContent = locale.inventoryTitle;
  textNodes.inventoryHelper.textContent = locale.inventoryEmpty;
  textNodes.inventoryBack.textContent = locale.back;

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
  renderClassConfirmation();
  renderGameplayInfo();
  renderInfoDetails();
  renderBattleUI();
  renderVictoryScreen();
  renderDefeatScreen();
  renderDialogueUI();
}

function renderSaveSlots() {
  const locale = getLocale();
  const slots = loadSlots();

  saveSlotsList.innerHTML = '';

  slots.forEach((slot) => {
    const item = document.createElement('li');
    const slotRow = document.createElement('div');
    const button = document.createElement('button');
    const label = document.createElement('span');
    const value = document.createElement('span');
    const deleteButton = document.createElement('button');
    const filledSlot = hasExistingSave(slot);

    slotRow.className = 'save-slot-row';

    button.type = 'button';
    button.className = 'save-slot';
    button.dataset.slotId = String(slot.metadata.slotId);

    label.className = 'slot-name';
    label.textContent = formatText(locale.slotLabel, { number: slot.metadata.slotId });

    value.className = 'slot-value';
    value.textContent = filledSlot
      ? `${locale[slot.playerIdentity.chosenElement]} • ${locale[slot.playerIdentity.chosenClass]}`
      : locale.newGame;

    deleteButton.type = 'button';
    deleteButton.className = 'save-slot-delete';
    deleteButton.dataset.deleteSlotId = String(slot.metadata.slotId);
    deleteButton.textContent = locale.deleteSlot;
    deleteButton.disabled = !filledSlot;

    button.append(label, value);
    slotRow.append(button, deleteButton);
    item.append(slotRow);
    saveSlotsList.append(item);
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

function showScreen(screenName) {
  Object.entries(screens).forEach(([name, screen]) => {
    screen.hidden = name !== screenName;
  });
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
  npcState = createNpcState(enemyStates, currentMapId);
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
  const defeatedEnemyIds = slot.worldProgress?.defeatedEnemyIds || [];

  initializeMapState(map.id, defeatedEnemyIds);
  setPlayerPosition(spawn.x, spawn.y);
  buildGrid();

  updateSlot(currentSlotId, {
    playerWorldPosition: {
      currentMapId: map.id,
      playerX: spawn.x,
      playerY: spawn.y
    }
  });

  renderGameplayInfo();
  renderInfoDetails();
  return true;
}

function tryUseStarterDoor() {
  if (!currentSlotId || currentMapId !== DEFAULT_MAP_ID) {
    return false;
  }

  const slot = synchronizeStarterDoorProgress(currentSlotId) || getSlotById(currentSlotId);
  if (!slot || !getStarterDoorState(slot).spawned || !canUseStarterDoor(slot)) {
    return false;
  }

  return transitionToMap(SECOND_MAP_ID);
}

function beginNextStep() {
  if (playerState.path.length === 0) {
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
  showScreen('inventory');
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
  renderInfoDetails();
  return true;
}

function getDefeatedEnemyIdsFromCurrentState() {
  const mapEnemyTemplates = getCurrentMapDefinition().enemies || [];

  return mapEnemyTemplates
    .filter((enemyStart) => !enemyStates.some((enemy) => enemy.id === enemyStart.id))
    .map((enemy) => enemy.id);
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
  npcPiece.className = 'npc-piece';

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

function isValidDoorSpawn(x, y, enemyList, npc, playerPos) {
  if (!isGround(x, y)) {
    return false;
  }

  if ((x === 0 && y === 0) || (playerPos && x === playerPos.x && y === playerPos.y)) {
    return false;
  }

  if (npc && npc.x === x && npc.y === y) {
    return false;
  }

  return !enemyList.some((enemy) => enemy.x === x && enemy.y === y);
}

function getStarterDoorForMap() {
  if (!currentSlotId || currentMapId !== DEFAULT_MAP_ID) {
    return null;
  }

  const slot = getSlotById(currentSlotId);
  if (!slot || !getStarterDoorState(slot).spawned) {
    return null;
  }

  const playerPos = getCurrentTilePosition();

  if (isValidDoorSpawn(STARTER_DOOR.x, STARTER_DOOR.y, enemyStates, npcState, playerPos)) {
    return { ...STARTER_DOOR };
  }

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (isValidDoorSpawn(x, y, enemyStates, npcState, playerPos)) {
        return { ...STARTER_DOOR, x, y };
      }
    }
  }

  return null;
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

function buildGrid() {
  const fragment = document.createDocumentFragment();

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = `grid-tile ${isGround(x, y) ? 'tile-ground' : 'tile-wall'}`;
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
  const door = getStarterDoorForMap();
  const npcPiece = npcState ? [createNpcPiece(npcState)] : [];
  const doorPieces = door ? [createDoorPiece(door)] : [];
  gridBoard.append(fragment, ...doorPieces, playerPiece, ...enemyStates.map((enemy) => createEnemyPiece(enemy)), ...npcPiece);
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

  battleState.menu = BATTLE_MENUS.ROOT;
  battleState.enemyId = enemy.id;
  battleState.enemy = createEnemyForBattle(enemy);
  battleState.player = createPlayerBattleData(slot);
  battleState.feedbackKeys = [];

  renderBattleUI();
  showScreen('battle');
}

function getInteractableAtTile(x, y) {
  const door = getStarterDoorForMap();
  if (door && door.x === x && door.y === y) {
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
    tryUseStarterDoor();
    return true;
  }

  return true;
}

function runFromBattle() {
  battleState.menu = BATTLE_MENUS.ROOT;
  battleState.enemyId = null;
  battleState.enemy = null;
  battleState.player = null;
  battleState.feedbackKeys = [];
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
  battleState.feedbackKeys = [];
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

function animationStep(timestamp) {
  if (!screens.game.hidden && playerState.moving) {
    const dt = playerState.lastTimestamp ? (timestamp - playerState.lastTimestamp) / 1000 : 0;
    playerState.lastTimestamp = timestamp;
    playerState.stepElapsed += dt;

    if (playerState.stepElapsed >= TILE_STEP_DURATION) {
      playerState.tileX = playerState.stepToX;
      playerState.tileY = playerState.stepToY;
      beginNextStep();
      renderInfoDetails();
    }

    updatePlayerPiece();
  } else if (screens.game.hidden) {
    playerState.lastTimestamp = null;
  }

  requestAnimationFrame(animationStep);
}

gridBoard.addEventListener('click', (event) => {
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
});

document.addEventListener('keydown', (event) => {
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

  const direction = keyToDirection[event.key];
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
textNodes.saveBack.addEventListener('click', goToMenuScreen);
textNodes.elementBack.addEventListener('click', goToSaveScreen);
textNodes.classBack.addEventListener('click', () => {
  textNodes.classConfirmation.textContent = '';
  showScreen('element');
});
textNodes.openGameMenu.addEventListener('click', openGameMenu);
textNodes.gmBackToGame.addEventListener('click', goToGameScreen);
textNodes.gmInventory.addEventListener('click', openInventoryScreen);
textNodes.gmInfo.addEventListener('click', openInfoScreen);
textNodes.gmSettings.addEventListener('click', openSettingsScreen);
textNodes.gmSave.addEventListener('click', handleSaveOnly);
textNodes.gmSaveQuit.addEventListener('click', handleSaveAndQuit);
textNodes.gmQuit.addEventListener('click', handleQuitWithoutSaving);
textNodes.settingsToggleCoordinates.addEventListener('click', toggleShowCoordinates);
textNodes.settingsBack.addEventListener('click', returnToGameMenu);
textNodes.inventoryBack.addEventListener('click', returnToGameMenu);
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
        activePartyMemberIds: [],
        recruitedCompanionIds: []
      },
      inventory: {
        inventoryItems: [],
        equippedGear: {}
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

const savedLanguage = localStorage.getItem(STORAGE_LANGUAGE_KEY);
if (translations[savedLanguage]) {
  currentLanguage = savedLanguage;
}

showCoordinates = false;

buildGrid();
setDocumentLanguage();
renderStaticText();
goToLanguageScreen();
requestAnimationFrame(animationStep);
