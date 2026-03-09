export function createScreenRouter(screens) {
  return {
    showScreen(screenName) {
      Object.entries(screens).forEach(([name, screen]) => {
        if (!screen) return;
        screen.hidden = name !== screenName;
      });
    }
  };
}
