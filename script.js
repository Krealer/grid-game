const GRID_SIZE = 12;
const TILE_SPEED_PER_SECOND = 2;

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
  game: document.getElementById('game-screen')
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
  menuOptions: document.getElementById('menu-options'),
  menuMedals: document.getElementById('menu-medals'),
  menuCredits: document.getElementById('menu-credits'),
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
  gameHelper: document.getElementById('game-helper')
};

const saveSlotsList = document.getElementById('save-slots');

const STORAGE_LANGUAGE_KEY = 'preferredLanguage';
const STORAGE_SAVE_KEY = 'gridGameSaveSlots';
const SLOT_COUNT = 3;

let currentLanguage = 'en';
let currentSlotId = null;

const playerState = {
  tileX: 0,
  tileY: 0,
  renderX: 0,
  renderY: 0,
  path: [],
  moving: false,
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
    options: 'Options',
    medals: 'Medals',
    credits: 'Credits',
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
    dir: 'ltr'
  },
  ja: {
    languageTitle: '言語を選択',
    languageSubtitle: '続行する言語を選んでください。',
    menuTitle: 'メインメニュー',
    menuInstruction: '項目を選んでください。',
    play: 'プレイ',
    options: 'オプション',
    medals: 'メダル',
    credits: 'クレジット',
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
    dir: 'ltr'
  },
  ru: {
    languageTitle: 'Выберите язык',
    languageSubtitle: 'Выберите язык, чтобы продолжить.',
    menuTitle: 'Главное меню',
    menuInstruction: 'Выберите пункт.',
    play: 'Играть',
    options: 'Опции',
    medals: 'Медали',
    credits: 'Титры',
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
    dir: 'ltr'
  },
  ar: {
    languageTitle: 'اختر اللغة',
    languageSubtitle: 'اختر لغة واحدة للمتابعة.',
    menuTitle: 'القائمة الرئيسية',
    menuInstruction: 'اختر خيارًا.',
    play: 'لعب',
    options: 'خيارات',
    medals: 'ميداليات',
    credits: 'اعتمادات',
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
    playerData: {}
  }));
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
      playerData: slot.playerData && typeof slot.playerData === 'object' ? slot.playerData : {}
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
    playerData: {
      ...slots[slotIndex].playerData,
      ...(data.playerData || {})
    }
  };

  saveSlots(slots);
}

function setDocumentLanguage() {
  const locale = getLocale();
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = locale.dir;
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

function renderStaticText() {
  const locale = getLocale();

  textNodes.languageTitle.textContent = locale.languageTitle;
  textNodes.languageSubtitle.textContent = locale.languageSubtitle;

  textNodes.menuTitle.textContent = locale.menuTitle;
  textNodes.menuInstruction.textContent = locale.menuInstruction;
  textNodes.menuPlay.textContent = locale.play;
  textNodes.menuOptions.textContent = locale.options;
  textNodes.menuMedals.textContent = locale.medals;
  textNodes.menuCredits.textContent = locale.credits;
  textNodes.menuBack.textContent = locale.back;

  textNodes.saveTitle.textContent = locale.saveTitle;
  textNodes.saveSubtitle.textContent = locale.saveSubtitle;
  textNodes.saveBack.textContent = locale.back;

  textNodes.elementTitle.textContent = locale.elementQuestion;
  textNodes.elementBack.textContent = locale.back;

  textNodes.classTitle.textContent = locale.classQuestion;
  textNodes.classBack.textContent = locale.back;

  elementButtons.forEach((button) => {
    button.textContent = locale[button.dataset.element];
  });

  classButtons.forEach((button) => {
    button.textContent = locale[button.dataset.class];
  });

  renderSaveSlots();
  renderClassConfirmation();
  renderGameplayInfo();
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
    value.textContent = slot.element && slot.class
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
  showScreen('language');
}

function goToMenuScreen() {
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

function resetPlayerPosition() {
  playerState.tileX = 0;
  playerState.tileY = 0;
  playerState.renderX = 0;
  playerState.renderY = 0;
  playerState.path = [];
  playerState.moving = false;
  playerState.lastTimestamp = null;
  updatePlayerPiece();
}

function goToGameScreen() {
  resetPlayerPosition();
  renderGameplayInfo();
  showScreen('game');
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

function getPathStartTile() {
  if (!playerState.moving || playerState.path.length === 0) {
    return { x: playerState.tileX, y: playerState.tileY };
  }

  const next = playerState.path[0];
  const traveled = Math.abs(playerState.renderX - playerState.tileX) + Math.abs(playerState.renderY - playerState.tileY);

  if (traveled >= 0.5) {
    playerState.renderX = next.x;
    playerState.renderY = next.y;
    return { x: next.x, y: next.y };
  }

  playerState.renderX = playerState.tileX;
  playerState.renderY = playerState.tileY;
  return { x: playerState.tileX, y: playerState.tileY };
}

function moveToTile(targetX, targetY) {
  if (!isGround(targetX, targetY)) {
    return;
  }

  const start = getPathStartTile();

  if (targetX === start.x && targetY === start.y) {
    return;
  }

  const path = findPath(start, { x: targetX, y: targetY });

  if (!path || path.length === 0) {
    return;
  }

  playerState.tileX = start.x;
  playerState.tileY = start.y;
  playerState.path = path;
  playerState.moving = true;
  playerState.lastTimestamp = null;
  updatePlayerPiece();
}

function animationStep(timestamp) {
  if (playerState.moving && playerState.path.length > 0) {
    const dt = playerState.lastTimestamp ? (timestamp - playerState.lastTimestamp) / 1000 : 0;
    playerState.lastTimestamp = timestamp;

    const target = playerState.path[0];
    const dx = target.x - playerState.renderX;
    const dy = target.y - playerState.renderY;
    const distance = Math.abs(dx) + Math.abs(dy);

    if (distance === 0) {
      playerState.tileX = target.x;
      playerState.tileY = target.y;
      playerState.path.shift();
    } else {
      const step = TILE_SPEED_PER_SECOND * dt;
      if (step >= distance) {
        playerState.renderX = target.x;
        playerState.renderY = target.y;
        playerState.tileX = target.x;
        playerState.tileY = target.y;
        playerState.path.shift();
      } else {
        playerState.renderX += Math.sign(dx) * step;
        playerState.renderY += Math.sign(dy) * step;
      }
    }

    if (playerState.path.length === 0) {
      playerState.moving = false;
      playerState.lastTimestamp = null;
    }

    updatePlayerPiece();
  }

  requestAnimationFrame(animationStep);
}

gridBoard.addEventListener('click', (event) => {
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
  const base = getPathStartTile();
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

  if (!slot.element || !slot.class) {
    updateSlot(slotId, { element: null, class: null });
  }

  goToElementScreen(slotId);
});

elementButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!currentSlotId) {
      return;
    }

    updateSlot(currentSlotId, { element: button.dataset.element, class: null });
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
      playerData: {
        spawnX: 1,
        spawnY: 1
      }
    });

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
