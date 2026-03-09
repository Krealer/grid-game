# Regression Checklist

Use this quick manual pass after gameplay/state changes.

- [ ] Load existing slot -> move across several tiles -> save -> reload -> verify map, position, HP, level/EXP, gear, and debug overlay values match.
- [ ] Map transition through a door -> verify `currentMapId`, spawn position, rendered map/entities -> save -> reload -> verify unchanged.
- [ ] Defeat an enemy -> leave/return map and/or transition maps -> verify enemy stays defeated -> save -> reload -> verify persistence.
- [ ] Recruit companion -> open Party and verify active + recruited lists -> remove from active -> verify companion returns to world -> save -> reload -> rejoin companion -> verify they disappear from world and reappear in active party.
- [ ] Open Party screen from Game Menu -> back navigation -> verify return to Game Menu and no stuck input/screen state.
- [ ] Toggle showCoordinates on/off in Settings -> save -> reload -> verify setting and grid coordinate rendering persist.
- [ ] Enter battle -> verify pre-battle position/map context -> win/lose/run -> verify HP updates, party state, enemy removal/progression, and post-battle world state.
- [ ] With debug overlay enabled, validate: screen, mapId, playerTile, moving/target, activePartyIds, recruitedCompanionIds, saveSlotId, showCoordinates, HP/EXP, companion world state flags.
