# Project Structure

## Root
- `index.html`: Static app shell and screen markup.
- `css/style.css`: Shared styles and responsive behavior.
- `PROJECT_RULES.md`: Permanent project constraints.
- `SAVE_DATA_SCHEMA.md`: Canonical save schema.

## JavaScript
- `js/main.js`: Main browser entry module; wires systems, screens, and gameplay flow.

### `js/data/`
Static game definitions.
- `maps.js`: Map ids, layouts, spawns, doors, healing tiles.
- `characters.js`: Playable class stats and companion templates.
- `enemies.js`: Enemy templates and per-map enemy seeds.
- `skills.js`: Canonical skill definitions and ids.
- `dialogue.js`: Dialogue nodes, choice flow, recruit foundations.
- `npcs.js`: Centralized NPC templates/index.
- `items.js`: Stable item/key catalog foundations.
- `medals.js`: Medal catalog foundations.
- `localization.js`: Translations for all supported languages.

### `js/state/`
Mutable runtime and persistence helpers.
- `gameState.js`: Runtime state containers for active session.
- `saveSystem.js`: Storage read/write helpers and save schema ownership point.
- `settingsState.js`: Runtime settings state foundation.

### `js/systems/`
Gameplay systems namespace for future growth.
- `mapSystem.js`, `movementSystem.js`, `battleSystem.js`, `elementSystem.js`, `interactionSystem.js`, `recruitmentSystem.js`, `partySystem.js`, `dialogueSystem.js`, `renderSystem.js`.

### `js/ui/`
UI/screen modules namespace for future extraction.
- `screenRouter.js`: Screen switching helper.
- `saveSlotsUI.js`: Save slot list rendering helper.
- `menuUI.js`, `battleUI.js`, `dialogueUI.js`, `partyUI.js`, `settingsUI.js`: dedicated UI module anchors for ongoing extraction.

### `js/utils/`
Cross-cutting constants/helpers.
- `constants.js`: Stable ids, schema constants, and shared enums.
- `helpers.js`: Reusable formatting/helpers.
- `ids.js`: Grouped stable identifier namespaces.

## Guidance for future tasks
- Add new static content in `js/data/*`.
- Add mutable session state in `js/state/*`.
- Add gameplay mechanics in `js/systems/*`.
- Add rendering/event logic in `js/ui/*`.
- Keep `js/main.js` as composition/wiring layer, and move feature-specific logic outward over time.
