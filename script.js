const languageScreen = document.getElementById('language-screen');
const menuScreen = document.getElementById('menu-screen');
const languageButtons = [...document.querySelectorAll('.language-option')];

const languageTitle = document.getElementById('language-title');
const languageSubtitle = document.getElementById('language-subtitle');

const menuTitle = document.getElementById('menu-title');
const menuInstruction = document.getElementById('menu-instruction');
const menuPlay = document.getElementById('menu-play');
const menuOptions = document.getElementById('menu-options');
const menuMedals = document.getElementById('menu-medals');
const menuCredits = document.getElementById('menu-credits');
const menuBack = document.getElementById('menu-back');

const STORAGE_KEY = 'preferredLanguage';

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
    dir: 'rtl'
  }
};

function applyLanguageScreen(language) {
  const locale = translations[language] || translations.en;
  document.documentElement.lang = language;
  document.documentElement.dir = locale.dir;
  languageTitle.textContent = locale.languageTitle;
  languageSubtitle.textContent = locale.languageSubtitle;
}

function showLanguageScreen(language) {
  applyLanguageScreen(language);
  languageScreen.hidden = false;
  menuScreen.hidden = true;
}

function showMenu(language) {
  const locale = translations[language];

  if (!locale) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, language);

  document.documentElement.lang = language;
  document.documentElement.dir = locale.dir;

  menuTitle.textContent = locale.menuTitle;
  menuInstruction.textContent = locale.menuInstruction;
  menuPlay.textContent = locale.play;
  menuOptions.textContent = locale.options;
  menuMedals.textContent = locale.medals;
  menuCredits.textContent = locale.credits;
  menuBack.textContent = locale.back;

  languageScreen.hidden = true;
  menuScreen.hidden = false;
}

languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showMenu(button.dataset.language);
  });
});

menuBack.addEventListener('click', () => {
  const savedLanguage = localStorage.getItem(STORAGE_KEY);
  const language = translations[savedLanguage] ? savedLanguage : 'en';
  showLanguageScreen(language);
});

const savedLanguage = localStorage.getItem(STORAGE_KEY);
const initialLanguage = translations[savedLanguage] ? savedLanguage : 'en';
showLanguageScreen(initialLanguage);
