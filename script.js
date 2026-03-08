const GRID_SIZE = 12;
const TILE_SPEED_PER_SECOND = 2;
const TILE_STEP_DURATION = 1 / TILE_SPEED_PER_SECOND;

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

const STORAGE_LANGUAGE_KEY = 'preferredLanguage';
const STORAGE_SAVE_KEY = 'gridGameSaveSlots';
const SLOT_COUNT = 3;

let currentLanguage = 'en';
let currentSlotId = null;
let gameMenuStatusKey = '';

const playerState = {
  tileX: 0,
  tileY: 0,
  renderX: 0,
  renderY: 0,
  path: [],
  moving: false,
  stepFromX: 0,
  stepFromY: 0,
  stepToX: 0,
  stepToY: 0,
  stepElapsed: 0,
  lastTimestamp: null
};

const playerPiece = document.createElement('div');
playerPiece.className = 'player-piece';
gridBoard.append(playerPiece);

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
    gameplayHelper: 'Tap or click a reachable gray tile to move.',
    gameplaySlot: 'Slot {number}: {element} • {className}',
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
    infoCoordinates: 'Coordinates: ({x}, {y})',
    infoNone: 'None',
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
    infoCoordinates: '座標: ({x}, {y})',
    infoNone: 'なし',
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
    infoCoordinates: 'Координаты: ({x}, {y})',
    infoNone: 'Нет',
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
    gameplayHelper: 'انقر أو المس مربّعًا رماديًا يمكن الوصول إليه للتحرك.',
    gameplaySlot: 'الخانة {number}: {element} • {className}',
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
    infoCoordinates: 'الإحداثيات: ({x}, {y})',
    infoNone: 'لا يوجد',
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
  playerState.renderX = x;
  playerState.renderY = y;
  playerState.path = [];
  playerState.moving = false;
  playerState.stepFromX = x;
  playerState.stepFromY = y;
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
    playerState.renderX = playerState.tileX;
    playerState.renderY = playerState.tileY;
    return;
  }

  const nextTile = playerState.path.shift();
  playerState.stepFromX = playerState.tileX;
  playerState.stepFromY = playerState.tileY;
  playerState.stepToX = nextTile.x;
  playerState.stepToY = nextTile.y;
  playerState.stepElapsed = 0;
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
  const leftPercent = (playerState.renderX * tilePercent) + (tilePercent * 0.16);
  const topPercent = (playerState.renderY * tilePercent) + (tilePercent * 0.16);

  playerPiece.style.width = `${tokenSizePercent}%`;
  playerPiece.style.height = `${tokenSizePercent}%`;
  playerPiece.style.left = `${leftPercent}%`;
  playerPiece.style.top = `${topPercent}%`;
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
  gridBoard.append(fragment, playerPiece);
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
    .filter((point) => isGround(point.x, point.y));
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
  if (!isGround(targetX, targetY)) {
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

  playerState.renderX = playerState.tileX;
  playerState.renderY = playerState.tileY;
  playerState.path = path;
  playerState.moving = false;
  playerState.stepElapsed = 0;
  playerState.lastTimestamp = null;
  beginNextStep();
  updatePlayerPiece();
}

function animationStep(timestamp) {
  if (!screens.game.hidden && playerState.moving) {
    const dt = playerState.lastTimestamp ? (timestamp - playerState.lastTimestamp) / 1000 : 0;
    playerState.lastTimestamp = timestamp;
    playerState.stepElapsed += dt;

    const progress = Math.min(playerState.stepElapsed / TILE_STEP_DURATION, 1);
    playerState.renderX = playerState.stepFromX + ((playerState.stepToX - playerState.stepFromX) * progress);
    playerState.renderY = playerState.stepFromY + ((playerState.stepToY - playerState.stepFromY) * progress);

    if (progress >= 1) {
      playerState.tileX = playerState.stepToX;
      playerState.tileY = playerState.stepToY;
      playerState.renderX = playerState.tileX;
      playerState.renderY = playerState.tileY;
      beginNextStep();
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
