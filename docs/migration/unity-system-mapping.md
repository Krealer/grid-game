# Unity System Mapping Plan

## Browser → Unity Mapping
- HTML screen sections → Unity Scenes + Canvas Panels
- CSS card/layout system → Unity `VerticalLayoutGroup`, `GridLayoutGroup`, anchors, theme ScriptableObjects
- JS game loop (`animationStep`) → Unity `Update()` / coroutine-driven tile stepping
- JS object literals (player/enemy state) → C# data classes + MonoBehaviours
- `localStorage` save slots → `SaveManager` JSON + WebGL JS interop bridge (`Application.ExternalEval`/`.jslib` bridge pattern)

## Direct Subsystem Mapping
- `findPath` (A*) → `Assets/Scripts/World/Pathfinding.cs`
- Grid render/build (`buildGrid`) → `Assets/Scripts/World/GridManager.cs` (Tilemap)
- Player move state + step interpolation → `Assets/Scripts/Player/PlayerController.cs`
- Enemy runtime state and spawn logic → `Assets/Scripts/Enemy/EnemyController.cs` + `Assets/Scripts/World/EnemySpawner.cs`
- Battle menu + turns + damage → `Assets/Scripts/Battle/BattleManager.cs`
- Elemental outcome rules → `Assets/Scripts/Battle/ElementSystem.cs`
- Damage calculation → `Assets/Scripts/Battle/DamageSystem.cs`
- Dialogue lines and progression → `Assets/Scripts/Dialogue/DialogueManager.cs`
- Screen flow (`showScreen`) → `Assets/Scripts/Core/SceneController.cs` + per-scene canvases
- Save slots and settings → `Assets/Scripts/Save/SaveManager.cs`

## Unity Scene Responsibilities
- **BootScene**: initialize managers, load saved settings/language, route to Main Menu
- **MainMenuScene**: language/menu/save/creation front-end flow
- **GameplayScene**: tilemap navigation, NPC/enemy interaction triggers, in-game menu entry
- **BattleScene**: battle HUD, turn loop, victory/defeat result handling
- **DialogueScene**: focused dialogue presentation (or additive overlay equivalent)

## Vertical Slice Definition
1. Select slot, class, element
2. Spawn in grid map
3. Move with tile click using A*
4. Trigger one enemy battle
5. Resolve victory/defeat and return flow
6. Save progress to slot JSON
