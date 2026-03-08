# Browser Game System Audit (HTML/CSS/JS)

## Scope
Audit source files:
- `index.html`
- `script.js`
- `style.css`

This game is a single-page browser RPG prototype with grid movement, combat, dialogue, save slots, localization, and in-game menu subsystems.

---

## 1) Game Screens
1. Language Select (`language-screen`)
2. Main Menu (`menu-screen`)
3. Save Slots (`save-screen`)
4. Delete Confirmation (`delete-confirm-screen`)
5. Element Selection (`element-screen`)
6. Class Selection (`class-screen`)
7. Gameplay Grid (`game-screen`)
8. Battle (`battle-screen`)
9. Dialogue (`dialogue-screen`)
10. Victory (`victory-screen`)
11. Defeat (`defeat-screen`)
12. In-Game Menu (`game-menu-screen`)
13. Settings (`settings-screen`)
14. Inventory (`inventory-screen`)
15. Character Info (`info-screen`)

---

## 2) Gameplay Systems
- 12x12 tile grid world with blocked tiles from `MAP_LAYOUT`
- Click/tap movement to reachable tiles
- A* pathfinding (`findPath`)
- Time-based tile stepping (`animationStep`, `TILE_SPEED_PER_SECOND`)
- Enemy population and spawn fallback logic
- NPC placement and interaction
- Interaction gating by orthogonal adjacency
- Battle system:
  - player and enemy turn exchange
  - class-based base stats (`warrior`, `mage`)
  - offensive skill lists by class/element
  - elemental advantage and resistance
  - HP bars and battle feedback messages
  - run action
- Dialogue progression through scripted lines
- Victory/defeat routing
- Pause-like game menu flow (save, quit, settings, inventory/info)

---

## 3) Input Systems
- Mouse/touch click on UI buttons
- Mouse/touch click on grid tiles
- Mouse/touch click on dialogue card to advance dialogue
- Keyboard support for dialogue progression (focusable dialogue area)

---

## 4) Game Entities
- Player entity (position, movement state, class, element)
- Enemy entities:
  - Fire Slime
  - Earth Slime
  - Water Slime
- NPC entity:
  - Village Guide (`npc-guide`)
- Battle-only runtime combatants (player/enemy battle snapshots)

---

## 5) UI Components
- Screen container system (`showScreen`)
- Menu option button lists
- Save slot list rendering with delete actions
- Grid board tile render and overlays
- Battle option list dynamic renderer
- HP bars (track + fill)
- Dialogue stage + portraits + bubbles
- Back buttons
- Settings toggle for coordinates
- Info and inventory status text blocks

---

## 6) Save Data
Storage keys:
- `preferredLanguage`
- `gridGameSaveSlots`
- `gridGameShowCoordinates`

Per-slot data model:
- `id`
- `element`
- `className`
- `playerPosition` (`x`, `y`)
- `defeatedEnemyIds` (`string[]`)

Runtime-derived but persisted behaviorally:
- language preference
- coordinate overlay setting

---

## 7) Assets
- No external art pipeline; visuals are mostly CSS-authored
- Character/slime/NPC visuals via semantic HTML + CSS classes
- Localized text data embedded in JS translation tables (`en`, `ja`, `ru`, `ar`)
- No audio assets in current version

---

## 8) Dependencies
- Browser DOM APIs
- `localStorage`
- No third-party JS libraries or package manager dependencies

---

## Prioritization for Unity Migration

### CORE SYSTEMS (first playable)
- Boot + menu → save slot → element/class onboarding flow
- Gameplay grid map
- Player movement using A*
- Enemy spawning and one enemy encounter
- Battle loop (attack exchange, HP, elemental modifiers)
- Dialogue interaction with one NPC
- Save/load (slot-based JSON persisted in browser storage in WebGL)
- Basic settings toggle for coordinate overlay/debug

### SECONDARY SYSTEMS
- Full multilingual localization parity (`en/ja/ru/ar` + RTL handling)
- Inventory screen with item acquisition outcomes
- Character info panel with live coordinate and stat snapshots
- Expanded battle menu hierarchy (defenders submenu)
- Refined battle/avatar presentation and transitions

### OPTIONAL SYSTEMS
- Additional classes/elements/skills beyond current minimal sets
- Enhanced VFX/audio
- Accessibility enrichments beyond baseline parity
- Cloud save sync (non-local browser storage)

---

## Migration Risks and Notes
- Existing visuals are CSS-heavy; Unity UI should target style parity, not HTML/CSS implementation parity.
- Translation table is currently code-embedded and should be externalized for scalable Unity localization.
- Current save format is permissive; Unity should formalize versioned save schema for forward compatibility.
