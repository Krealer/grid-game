export const PLAYER_CLASS_STATS = { mage: { hp: 20, attack: 10 }, warrior: { hp: 40, attack: 5 } };
export const LEVEL_GROWTH_BY_CLASS = {
  warrior: { hp: 5, attack: 1 },
  mage: { hp: 3, attack: 2 }
};
export const COMPANION_DEFINITIONS = {
  companion_rowan_01: {
    id: 'companion_rowan_01',
    npcId: 'npc_recruit_01',
    nameKey: 'npcRecruitRowan',
    role: 'vanguard',
    className: 'warrior',
    element: 'earth',
    combatStyle: 'frontline_offense',
    skillIds: ['earth_slash'],
    originMapId: 'map_second_field',
    originX: 9,
    originY: 1
  }
};
