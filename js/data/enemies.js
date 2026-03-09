export const STARTER_ENEMY_STARTS = [
  { id: 'enemy_fire_slime_01', x: 3, y: 0, species: 'slime', nameKey: 'fireSlime', element: 'fire', expReward: 5 },
  { id: 'enemy_earth_slime_01', x: 6, y: 2, species: 'slime', nameKey: 'earthSlime', element: 'earth', expReward: 5 },
  { id: 'enemy_water_slime_01', x: 9, y: 4, species: 'slime', nameKey: 'waterSlime', element: 'water', expReward: 5 }
];
export const SECOND_MAP_ENEMY_STARTS = [{ id: 'enemy_tree_monster_01', x: 4, y: 1, species: 'tree_monster', nameKey: 'treeMonster', element: 'earth', expReward: 8 }];
export const ENEMY_SPECIES_DEFINITIONS = {
  slime: { hp: 20, attack: 3, drops: { type: 'none', itemKey: null }, skills: [{ id: 'slime_attack', nameKey: 'slimeAttack', damageMultiplier: 1, elementType: 'none', category: 'offensive' }] },
  tree_monster: { fixedElement: 'earth', hp: 25, attack: 4, drops: { type: 'none', itemKey: null }, skills: [{ id: 'branch_strike', nameKey: 'branchStrike', damageMultiplier: 1, elementType: 'earth', category: 'offensive' }] }
};
