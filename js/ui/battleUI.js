import { formatText } from '../utils/helpers.js';

export function buildBattleSubtitle({ locale, feedbackEntries, menu, companionCount, battleMenus }) {
  if (feedbackEntries.length > 0) {
    return feedbackEntries
      .map((entry) => {
        const template = locale[entry.key];
        return template ? formatText(template, entry.params || {}) : '';
      })
      .filter(Boolean)
      .join('\n');
  }

  if (menu === battleMenus.OFFENSIVE) {
    return locale.battleChooseSkill;
  }

  if (menu === battleMenus.DEFENDERS) {
    return locale.defendersPlaceholder;
  }

  if (companionCount > 0) {
    return formatText(locale.battleCompanionReady, { count: companionCount });
  }

  return '';
}
