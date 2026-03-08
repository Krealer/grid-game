import { createGame } from './js/game.js';

const languageScreen = document.querySelector('.language-screen');
const gameShell = document.querySelector('.game-shell');
const languageStatus = document.getElementById('language-status');
const languageOptions = [...document.querySelectorAll('.language-option')];

const LANGUAGE_LABELS = {
  en: 'English',
  ja: '日本語',
  ru: 'Русский',
  ar: 'العربية'
};

let selectedLanguage = localStorage.getItem('preferredLanguage') || '';
let gameStarted = false;

const setSelectedLanguage = (languageCode) => {
  selectedLanguage = languageCode;
  localStorage.setItem('preferredLanguage', languageCode);

  languageOptions.forEach((option) => {
    const isSelected = option.dataset.language === languageCode;
    option.classList.toggle('is-selected', isSelected);
    option.setAttribute('aria-pressed', String(isSelected));
  });

  const languageLabel = LANGUAGE_LABELS[languageCode] || languageCode;
  languageStatus.textContent = `Selected language: ${languageLabel}`;
};

const startGame = () => {
  if (gameStarted) {
    return;
  }

  gameStarted = true;
  languageScreen.hidden = true;
  gameShell.hidden = false;

  const game = createGame({
    canvas: document.getElementById('game'),
    scoreEl: document.getElementById('score'),
    livesEl: document.getElementById('lives'),
    statusEl: document.getElementById('status'),
    controls: document.querySelector('.controls')
  });

  game.start();
};

if (selectedLanguage) {
  setSelectedLanguage(selectedLanguage);
}

languageOptions.forEach((option) => {
  option.addEventListener('click', () => {
    setSelectedLanguage(option.dataset.language);
    startGame();
  });
});
