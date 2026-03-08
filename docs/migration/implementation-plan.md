# Browser-to-Unity Migration Implementation Plan

## Phase 1 — Audit
Completed in `system-audit.md`.

## Phase 2 — Unity Project Structure
Scaffold created under `UnityMigration/Assets/` with required folders and script stubs.

## Phase 3 — System Mapping
Completed in `unity-system-mapping.md`.

## Phase 4 — Core Vertical Slice Build Order
1. Grid Tilemap + blocked collision map
2. Player click-to-move pathing
3. One enemy spawn and encounter trigger
4. Battle scene with attack exchange, HP, element modifiers
5. Basic HUD/menu navigation

## Phase 5 — Data Systems
- `EnemyData` and `SkillData` ScriptableObject templates included
- Runtime stats in `PlayerStats`

## Phase 6 — Save System
- JSON save slot schema in `SaveManager`
- WebGL target: map persistence to browser storage via Unity WebGL bridge

## Phase 7 — WebGL Export
Detailed in `webgl-pwa-pipeline.md`.

## Phase 8/9 — PWA + Offline
Template provided under `webgl-pwa-template/game/`:
- `manifest.json`
- `service-worker.js`
- installable app metadata and cache-first strategy

## Phase 10 — Deployment Structure
Template already mirrors:
- `/game/index.html`
- `/game/manifest.json`
- `/game/service-worker.js`
- `/game/icons/*`
- `/game/Build/*`
