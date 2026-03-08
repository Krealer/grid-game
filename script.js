const GRID_SIZE = 12;
const TILE_SPEED_PER_SECOND = 2;
const TILE_STEP_DURATION = 1 / TILE_SPEED_PER_SECOND;

const ENEMY_START = { x: 3, y: 0 };

const MAP_LAYOUT = [
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

const screens = {
  language: document.getElementById('language-screen'),
  menu: document.getElementById('menu-screen'),
  save: document.getElementById('save-screen'),
  element: document.getElementById('element-screen'),
  class: document.getElementById('class-screen'),
  game: document.getElementById('game-screen'),
  battle: document.getElementById('battle-screen'),
  victory: document.getElementById('victory-screen'),
  defeat: document.getElementById('defeat-screen'),
  gameMenu: document.getElementById('game-menu-screen'),
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
  gmSave: document.getElementById('gm-save'),
  gmSaveQuit: document.getElementById('gm-save-quit'),
  gmQuit: document.getElementById('gm-quit'),
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

const STORAGE_LANGUAGE_KEY = 'preferredLanguage';
const STORAGE_SAVE_KEY = 'gridGameSaveSlots';
const SLOT_COUNT = 3;

let currentLanguage = 'en';
let currentSlotId = null;
let gameMenuStatusKey = '';

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

const enemyState = createInitialEnemyState();

const playerPiece = document.createElement('div');
playerPiece.className = 'player-piece';
const enemyPiece = document.createElement('div');
enemyPiece.className = 'enemy-piece';
gridBoard.append(playerPiece, enemyPiece);

const BATTLE_MENUS = {
  ROOT: 'root',
  FIGHT_CATEGORIES: 'fightCategories',
  OFFENSIVE: 'offensive',
  DEFENDERS: 'defenders'
};

const FIRE_SLIME_TEMPLATE = {
  nameKey: 'fireSlime',
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
};

const battleState = {
  menu: BATTLE_MENUS.ROOT,
  enemy: null,
  player: null,
  resultMessageKey: 'obtainedNothing',
  resultItemKey: null
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
    elementQuestion: 'What element do you want to choose?',
    fire: 'Fire',
    water: 'Water',
    earth: 'Earth',
    classQuestion: 'What class are you?',
    warrior: 'Warrior',
    mage: 'Mage',
    classSaved: 'Selection saved for Slot {number}.',
    gameplayTitle: 'Grid Movement',
    gameplayHelper: 'Tap or click a reachable gray tile to move. Tap the red enemy while next to it to battle.',
    gameplaySlot: 'Slot {number}: {element} • {className}',
    battleTitle: 'Battle',
    battleStatusPlayer: 'Player',
    fight: 'Fight',
    run: 'Run',
    gameMenu: 'Game Menu',
    backToGame: 'Back to Game',
    inventory: 'Inventory',
    info: 'Info',
    save: 'Save',
    saveQuit: 'Save & Quit',
    quit: 'Quit',
    inventoryTitle: 'Inventory',
    inventoryPlaceholder: 'Inventory screen placeholder.',
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
    slimeAttack: 'Slime Attack',
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
    elementQuestion: 'どの属性を選びますか？',
    fire: '火',
    water: '水',
    earth: '土',
    classQuestion: 'あなたのクラスは？',
    warrior: '戦士',
    mage: '魔法使い',
    classSaved: 'スロット {number} に選択を保存しました。',
    gameplayTitle: 'グリッド移動',
    gameplayHelper: '到達できる灰色タイルをタップまたはクリックして移動します。',
    gameplaySlot: 'スロット {number}: {element} • {className}',
    battleTitle: 'バトル',
    battleStatusPlayer: 'プレイヤー',
    fight: 'たたかう',
    run: 'にげる',
    gameMenu: 'ゲームメニュー',
    backToGame: 'ゲームに戻る',
    inventory: 'インベントリ',
    info: '情報',
    save: 'セーブ',
    saveQuit: 'セーブして終了',
    quit: '終了',
    inventoryTitle: 'インベントリ',
    inventoryPlaceholder: 'インベントリ画面のプレースホルダーです。',
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
    slimeAttack: 'スライムアタック',
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
    elementQuestion: 'Какой элемент вы хотите выбрать?',
    fire: 'Огонь',
    water: 'Вода',
    earth: 'Земля',
    classQuestion: 'Какой вы класс?',
    warrior: 'Воин',
    mage: 'Маг',
    classSaved: 'Выбор сохранён для слота {number}.',
    gameplayTitle: 'Движение по сетке',
    gameplayHelper: 'Нажмите на достижимую серую клетку, чтобы переместиться.',
    gameplaySlot: 'Слот {number}: {element} • {className}',
    battleTitle: 'Бой',
    battleStatusPlayer: 'Игрок',
    fight: 'Биться',
    run: 'Бежать',
    gameMenu: 'Меню игры',
    backToGame: 'Вернуться в игру',
    inventory: 'Инвентарь',
    info: 'Инфо',
    save: 'Сохранить',
    saveQuit: 'Сохранить и выйти',
    quit: 'Выйти',
    inventoryTitle: 'Инвентарь',
    inventoryPlaceholder: 'Экран инвентаря (заглушка).',
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
    slimeAttack: 'Атака слизня',
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
    elementQuestion: 'ما العنصر الذي تريد اختياره؟',
    fire: 'النار',
    water: 'الماء',
    earth: 'الأرض',
    classQuestion: 'ما فئتك؟',
    warrior: 'محارب',
    mage: 'ساحر',
    classSaved: 'تم حفظ الاختيار في الخانة {number}.',
    gameplayTitle: 'الحركة على الشبكة',
    gameplayHelper: 'انقر أو المس مربّعًا رماديًا يمكن الوصول إليه للتحرك. المس العدو الأحمر المجاور لبدء المعركة.',
    gameplaySlot: 'الخانة {number}: {element} • {className}',
    battleTitle: 'معركة',
    battleStatusPlayer: 'اللاعب',
    fight: 'قتال',
    run: 'هرب',
    gameMenu: 'قائمة اللعبة',
    backToGame: 'العودة إلى اللعبة',
    inventory: 'المخزون',
    info: 'معلومات',
    save: 'حفظ',
    saveQuit: 'حفظ وإنهاء',
    quit: 'إنهاء',
    inventoryTitle: 'المخزون',
    inventoryPlaceholder: 'هذه شاشة المخزون التجريبية.',
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
    slimeAttack: 'هجوم السلايم',
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

function isGround(x, y) {
  return isInsideGrid(x, y) && MAP_LAYOUT[y][x] === 0;
}

function createInitialEnemyState() {
  if (isGround(ENEMY_START.x, ENEMY_START.y) && !(ENEMY_START.x === 0 && ENEMY_START.y === 0)) {
    return { x: ENEMY_START.x, y: ENEMY_START.y };
  }

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (isGround(x, y) && !(x === 0 && y === 0)) {
        return { x, y };
      }
    }
  }

  return { x: 1, y: 0 };
}

function isEnemyTile(x, y) {
  return enemyState.x === x && enemyState.y === y;
}

function isWalkable(x, y) {
  return isGround(x, y) && !isEnemyTile(x, y);
}

function getDefaultSlots() {
  return Array.from({ length: SLOT_COUNT }, (_, index) => ({
    slotId: index + 1,
    element: null,
    class: null,
    playerData: {
      x: 0,
      y: 0
    }
  }));
}

function normalizePosition(playerData) {
  const x = Number.isInteger(playerData?.x) ? playerData.x : 0;
  const y = Number.isInteger(playerData?.y) ? playerData.y : 0;

  if (!isGround(x, y)) {
    return { x: 0, y: 0 };
  }

  return { x, y };
}

function loadSlots() {
  const raw = localStorage.getItem(STORAGE_SAVE_KEY);

  if (!raw) {
    return getDefaultSlots();
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length !== SLOT_COUNT) {
      return getDefaultSlots();
    }

    return parsed.map((slot, index) => ({
      slotId: index + 1,
      element: typeof slot.element === 'string' ? slot.element : null,
      class: typeof slot.class === 'string' ? slot.class : null,
      playerData: normalizePosition(slot.playerData)
    }));
  } catch (_error) {
    return getDefaultSlots();
  }
}

function saveSlots(slots) {
  localStorage.setItem(STORAGE_SAVE_KEY, JSON.stringify(slots));
}

function getSlotById(slotId) {
  return loadSlots().find((slot) => slot.slotId === slotId) || null;
}

function updateSlot(slotId, data) {
  const slots = loadSlots();
  const slotIndex = slots.findIndex((slot) => slot.slotId === slotId);

  if (slotIndex === -1) {
    return;
  }

  slots[slotIndex] = {
    ...slots[slotIndex],
    ...data,
    playerData: normalizePosition({
      ...slots[slotIndex].playerData,
      ...(data.playerData || {})
    })
  };

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
  return Boolean(slot && slot.element && slot.class);
}

function renderGameplayInfo() {
  const locale = getLocale();
  textNodes.gameTitle.textContent = locale.gameplayTitle;
  textNodes.gameHelper.textContent = locale.gameplayHelper;

  const slot = currentSlotId ? getSlotById(currentSlotId) : null;
  if (slot && slot.element && slot.class) {
    textNodes.gameSlot.textContent = formatText(locale.gameplaySlot, {
      number: slot.slotId,
      element: locale[slot.element],
      className: locale[slot.class]
    });
  } else {
    textNodes.gameSlot.textContent = '';
  }
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
    formatText(locale.infoSlot, { slot: slot.slotId }),
    formatText(locale.infoElement, { element: slot.element ? locale[slot.element] : locale.infoNone }),
    formatText(locale.infoClass, { className: slot.class ? locale[slot.class] : locale.infoNone }),
    formatText(locale.infoCoordinates, { x: currentPos.x, y: currentPos.y })
  ];

  textNodes.infoDetails.textContent = lines.join('\n');
}


function createEnemyForBattle() {
  return {
    nameKey: FIRE_SLIME_TEMPLATE.nameKey,
    maxHp: FIRE_SLIME_TEMPLATE.hp,
    hp: FIRE_SLIME_TEMPLATE.hp,
    attack: FIRE_SLIME_TEMPLATE.attack,
    drops: { ...FIRE_SLIME_TEMPLATE.drops },
    skills: FIRE_SLIME_TEMPLATE.skills.map((skill) => ({ ...skill }))
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
  const stats = getPlayerStatsByClass(slot.class);

  return {
    class: slot.class,
    element: slot.element,
    maxHp: stats.hp,
    hp: stats.hp,
    attack: stats.attack,
    skills: getPlayerOffensiveSkills(slot.class, slot.element)
  };
}

function clampHp(value) {
  return Math.max(0, value);
}

function calculateSkillDamage(attack, multiplier) {
  return Math.floor(attack * multiplier);
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

  battleState.resultMessageKey = dropResult.key;
  battleState.resultItemKey = dropResult.itemKey;
  battleState.menu = BATTLE_MENUS.ROOT;

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

  const playerDamage = calculateSkillDamage(player.attack, skill.damageMultiplier);
  enemy.hp = clampHp(enemy.hp - playerDamage);

  if (enemy.hp <= 0) {
    renderBattleUI();
    endBattleVictory();
    return;
  }

  const enemySkill = enemy.skills[0];
  const enemyDamage = calculateSkillDamage(enemy.attack, enemySkill.damageMultiplier);
  player.hp = clampHp(player.hp - enemyDamage);

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
    return;
  }

  textNodes.battleEnemyName.textContent = locale[enemy.nameKey];
  textNodes.battleEnemyStats.textContent = `${locale.attack}: ${enemy.attack}`;
  textNodes.battleEnemyHp.textContent = `${locale.hp}: ${enemy.hp} / ${enemy.maxHp}`;
  textNodes.battlePlayerName.textContent = locale.battleStatusPlayer;
  textNodes.battlePlayerStats.textContent = `${locale.classLabel}: ${locale[player.class]} • ${locale.attack}: ${player.attack}`;
  textNodes.battlePlayerHp.textContent = `${locale.hp}: ${player.hp} / ${player.maxHp}`;

  updateHpBar(textNodes.battleEnemyHpFill, enemy.hp, enemy.maxHp);
  updateHpBar(textNodes.battlePlayerHpFill, player.hp, player.maxHp);

  if (battleState.menu === BATTLE_MENUS.OFFENSIVE) {
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
  textNodes.gmSave.textContent = locale.save;
  textNodes.gmSaveQuit.textContent = locale.saveQuit;
  textNodes.gmQuit.textContent = locale.quit;

  textNodes.inventoryTitle.textContent = locale.inventoryTitle;
  textNodes.inventoryHelper.textContent = locale.inventoryPlaceholder;
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
}

function renderSaveSlots() {
  const locale = getLocale();
  const slots = loadSlots();

  saveSlotsList.innerHTML = '';

  slots.forEach((slot) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    const label = document.createElement('span');
    const value = document.createElement('span');

    button.type = 'button';
    button.className = 'save-slot';
    button.dataset.slotId = String(slot.slotId);

    label.className = 'slot-name';
    label.textContent = formatText(locale.slotLabel, { number: slot.slotId });

    value.className = 'slot-value';
    value.textContent = hasExistingSave(slot)
      ? `${locale[slot.element]} • ${locale[slot.class]}`
      : locale.newGame;

    button.append(label, value);
    item.append(button);
    saveSlotsList.append(item);
  });
}

function renderClassConfirmation() {
  const locale = getLocale();
  const slot = currentSlotId ? getSlotById(currentSlotId) : null;

  if (!slot || !slot.class) {
    textNodes.classConfirmation.textContent = '';
    return;
  }

  textNodes.classConfirmation.textContent = formatText(locale.classSaved, { number: slot.slotId });
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

function returnToGameMenu() {
  renderInfoDetails();
  showScreen('gameMenu');
}

function writeCurrentGameToSlot() {
  if (!currentSlotId) {
    return false;
  }

  const slot = getSlotById(currentSlotId);
  if (!slot || !slot.element || !slot.class) {
    return false;
  }

  const pos = getCurrentTilePosition();
  updateSlot(currentSlotId, {
    slotId: currentSlotId,
    element: slot.element,
    class: slot.class,
    playerData: {
      x: pos.x,
      y: pos.y
    }
  });

  renderSaveSlots();
  renderInfoDetails();
  return true;
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

function updateEnemyPiece() {
  const tilePercent = 100 / GRID_SIZE;
  const tokenSizePercent = tilePercent * 0.68;
  const leftPercent = (enemyState.x * tilePercent) + (tilePercent * 0.16);
  const topPercent = (enemyState.y * tilePercent) + (tilePercent * 0.16);

  enemyPiece.style.width = `${tokenSizePercent}%`;
  enemyPiece.style.height = `${tokenSizePercent}%`;
  enemyPiece.style.left = `${leftPercent}%`;
  enemyPiece.style.top = `${topPercent}%`;
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
      tile.setAttribute('aria-label', `Tile ${x + 1}, ${y + 1}`);
      fragment.append(tile);
    }
  }

  gridBoard.innerHTML = '';
  gridBoard.append(fragment, playerPiece, enemyPiece);
  updatePlayerPiece();
  updateEnemyPiece();
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


function isOrthogonallyAdjacentToEnemy() {
  const distance = Math.abs(playerState.tileX - enemyState.x) + Math.abs(playerState.tileY - enemyState.y);
  return distance === 1;
}

function enterBattleMode() {
  const slot = currentSlotId ? getSlotById(currentSlotId) : null;

  if (!slot || !slot.class || !slot.element) {
    return;
  }

  battleState.menu = BATTLE_MENUS.ROOT;
  battleState.enemy = createEnemyForBattle();
  battleState.player = createPlayerBattleData(slot);

  renderBattleUI();
  showScreen('battle');
}

function tryInteractWithEnemy(tileX, tileY) {
  if (!isEnemyTile(tileX, tileY)) {
    return false;
  }

  if (!isOrthogonallyAdjacentToEnemy()) {
    return true;
  }

  enterBattleMode();
  return true;
}

function runFromBattle() {
  battleState.menu = BATTLE_MENUS.ROOT;
  battleState.enemy = null;
  battleState.player = null;
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
  battleState.enemy = null;
  battleState.player = null;
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

  if (tryInteractWithEnemy(x, y)) {
    return;
  }

  moveToTile(x, y);
});

document.addEventListener('keydown', (event) => {
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
textNodes.gmSave.addEventListener('click', handleSaveOnly);
textNodes.gmSaveQuit.addEventListener('click', handleSaveAndQuit);
textNodes.gmQuit.addEventListener('click', handleQuitWithoutSaving);
textNodes.inventoryBack.addEventListener('click', returnToGameMenu);
textNodes.infoBack.addEventListener('click', returnToGameMenu);
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
    updateSlot(slotId, { element: null, class: null, playerData: { x: 0, y: 0 } });
    goToElementScreen(slotId);
    return;
  }

  currentSlotId = slotId;
  const savedPos = normalizePosition(slot.playerData);
  setPlayerPosition(savedPos.x, savedPos.y);
  goToGameScreen();
});

elementButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!currentSlotId) {
      return;
    }

    updateSlot(currentSlotId, { element: button.dataset.element, class: null, playerData: { x: 0, y: 0 } });
    goToClassScreen();
  });
});

classButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!currentSlotId) {
      return;
    }

    updateSlot(currentSlotId, {
      class: button.dataset.class,
      playerData: { x: 0, y: 0 }
    });

    const slot = getSlotById(currentSlotId);
    const start = normalizePosition(slot?.playerData);
    setPlayerPosition(start.x, start.y);

    renderClassConfirmation();
    renderSaveSlots();
    goToGameScreen();
  });
});

const savedLanguage = localStorage.getItem(STORAGE_LANGUAGE_KEY);
if (translations[savedLanguage]) {
  currentLanguage = savedLanguage;
}

buildGrid();
setDocumentLanguage();
renderStaticText();
goToLanguageScreen();
requestAnimationFrame(animationStep);
