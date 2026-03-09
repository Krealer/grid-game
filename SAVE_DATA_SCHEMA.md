# SAVE_DATA_SCHEMA

This document defines the **canonical save schema** for this project.

- Storage key: `gridGameSaveSlots`
- Format: JSON array with 3 slot objects
- Version: `1`

## Canonical save slot object

```json
{
  "metadata": {
    "slotId": 1,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "version": 1
  },
  "playerIdentity": {
    "chosenClass": "warrior",
    "chosenElement": "fire",
    "storyModeChoice": "story"
  },
  "playerWorldPosition": {
    "currentMapId": "map_starter_field",
    "playerX": 0,
    "playerY": 0
  },
  "worldProgress": {
    "defeatedEnemyIds": ["enemy_fire_slime_01"],
    "openedDoorIds": ["door_starter_exit"],
    "triggeredEventFlags": {
      "event_intro_seen": true
    },
    "obtainedKeyIds": ["key_story"]
  },
  "npcStateFlags": {
    "npc_intro_seen": true,
    "npc_story_choice_made": false
  },
  "settings": {
    "showCoordinates": false
  },
  "medals": [
    {
      "medalId": "medal_first_enemy",
      "unlockedAt": "2026-01-01T00:10:00.000Z"
    }
  ],
  "party": {
    "activePartyMemberIds": [],
    "recruitedCompanionIds": []
  },
  "inventory": {
    "inventoryItems": [],
    "equippedGear": {}
  }
}
```

## Field meanings

- `metadata`: save bookkeeping data per slot.
  - `slotId`: fixed slot index (1..3).
  - `createdAt`: first creation timestamp.
  - `updatedAt`: most recent write timestamp.
  - `version`: schema version for future migrations.
- `playerIdentity`: player profile and branching-story choice foundations.
  - `chosenClass`: `warrior` or `mage`.
  - `chosenElement`: `fire`, `water`, or `earth`.
  - `storyModeChoice`: `story` or `no_story`.
- `playerWorldPosition`: current world placement.
  - `currentMapId`: stable map id.
  - `playerX`, `playerY`: tile coordinates in the game grid coordinate system.
- `worldProgress`: persistent world-level progression.
  - `defeatedEnemyIds`: stable enemy ids removed from map after load.
  - `openedDoorIds`: persistent door state ids.
  - `triggeredEventFlags`: boolean map of event flags.
  - `obtainedKeyIds`: stable key ids.
- `npcStateFlags`: boolean map of NPC/dialogue flags.
- `settings`: save-bound user options.
  - `showCoordinates`: coordinate visibility toggle.
- `medals`: medal unlock records with timestamps.
- `party`: future party system foundations.
- `inventory`: future inventory/gear foundations.

## Stable ID conventions

Persistent ids are stable, deterministic string ids. They must not be randomized per session.

Convention:
- lowercase snake_case
- category prefix + semantic name + optional numeric suffix

Examples:
- map ids: `map_starter_field`
- enemy ids: `enemy_fire_slime_01`
- npc ids: `npc_starter_guide`
- door ids: `door_starter_exit`
- key ids: `key_story`, `key_no_story`
- medal ids: `medal_first_enemy`
- companion ids: `companion_future_01`
- item ids: `item_potion_small`

Validation rule summary:
- `map_...` ids are required for `currentMapId`
- `door_...` ids are required for `openedDoorIds`
- `key_...` ids are required for `obtainedKeyIds`
- `medal_...` ids are required for `medals[].medalId`
- `companion_...` ids are required for `party.recruitedCompanionIds`
- `item_...` ids are required for `inventory.inventoryItems`

## Already in active use

- `map_starter_field`
- `enemy_fire_slime_01`
- `enemy_earth_slime_01`
- `enemy_water_slime_01`
- `npc_starter_guide`

## Reserved for future systems

The following structures already exist in the canonical schema and are reserved for future tasks:

- story branching foundations:
  - `playerIdentity.storyModeChoice`
  - `worldProgress.obtainedKeyIds`
  - `worldProgress.triggeredEventFlags`
- multi-map progression foundation:
  - `playerWorldPosition.currentMapId`
- map interaction persistence:
  - `worldProgress.openedDoorIds`
- dialogue progression:
  - `npcStateFlags`
- medals:
  - `medals[]`
- party systems:
  - `party.activePartyMemberIds`
  - `party.recruitedCompanionIds`
- inventory and gear:
  - `inventory.inventoryItems`
  - `inventory.equippedGear`

## Empty slot rule

A slot is treated as "New Game" when either `chosenClass` or `chosenElement` is `null`.

## Backward compatibility

The loader migrates legacy slot shapes into this canonical object during read and automatically re-persists normalized canonical slots.
