const languageScreen = document.getElementById('language-screen');
const menuScreen = document.getElementById('menu-screen');
const languageButtons = [...document.querySelectorAll('.language-option')];

const menuTitle = document.getElementById('menu-title');
const menuInstruction = document.getElementById('menu-instruction');
const menuPlay = document.getElementById('menu-play');
const menuOptions = document.getElementById('menu-options');
const menuMedals = document.getElementById('menu-medals');
const menuCredits = document.getElementById('menu-credits');

const STORAGE_KEY = 'preferredLanguage';

const translations = {
  en: {
    title: 'Home Menu',
    instruction: 'Select an option.',
    play: 'Play',
    options: 'Options',
    medals: 'Medals',
    credits: 'Credits',
    dir: 'ltr'
  },
  ja: {
    title: 'ホームメニュー',
    instruction: '項目を選んでください。',
    play: 'プレイ',
    options: 'オプション',
    medals: 'メダル',
    credits: 'クレジット',
    dir: 'ltr'
  },
  ru: {
    title: 'Главное меню',
    instruction: 'Выберите пункт.',
    play: 'Играть',
    options: 'Настройки',
    medals: 'Медали',
    credits: 'Титры',
    dir: 'ltr'
  },
  ar: {
    title: 'القائمة الرئيسية',
    instruction: 'اختر خيارًا.',
    play: 'لعب',
    options: 'الخيارات',
    medals: 'الأوسمة',
    credits: 'الاعتمادات',
    dir: 'rtl'
  }
};

function showMenu(language) {
  const locale = translations[language];

  if (!locale) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, language);

  document.documentElement.lang = language;
  document.documentElement.dir = locale.dir;

  menuTitle.textContent = locale.title;
  menuInstruction.textContent = locale.instruction;
  menuPlay.textContent = locale.play;
  menuOptions.textContent = locale.options;
  menuMedals.textContent = locale.medals;
  menuCredits.textContent = locale.credits;

  languageScreen.hidden = true;
  menuScreen.hidden = false;
}

languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showMenu(button.dataset.language);
  });
});

const savedLanguage = localStorage.getItem(STORAGE_KEY);
if (savedLanguage) {
  showMenu(savedLanguage);
}
