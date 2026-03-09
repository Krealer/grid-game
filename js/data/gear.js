export const EQUIPMENT_SLOT_TYPES = {
  HEAD_OR_ARMOR: 'headOrArmorSlot',
  WEAPON: 'weaponSlot',
  MOBILITY: 'mobilitySlot'
};

export const EQUIPMENT_SLOT_ORDER = [
  EQUIPMENT_SLOT_TYPES.HEAD_OR_ARMOR,
  EQUIPMENT_SLOT_TYPES.WEAPON,
  EQUIPMENT_SLOT_TYPES.MOBILITY
];

export const DEFAULT_EQUIPPED_GEAR = {
  [EQUIPMENT_SLOT_TYPES.HEAD_OR_ARMOR]: null,
  [EQUIPMENT_SLOT_TYPES.WEAPON]: null,
  [EQUIPMENT_SLOT_TYPES.MOBILITY]: null
};

export const GEAR_ITEM_DEFINITIONS = {
  item_rusted_armour: {
    itemId: 'item_rusted_armour',
    nameKey: 'gearRustedArmour',
    slotType: EQUIPMENT_SLOT_TYPES.HEAD_OR_ARMOR,
    allowedClasses: ['warrior'],
    hpBonus: 5,
    attackBonus: 0,
    movementSpeedBonus: 0,
    traversalTagsGranted: []
  },
  item_worn_hat: {
    itemId: 'item_worn_hat',
    nameKey: 'gearWornHat',
    slotType: EQUIPMENT_SLOT_TYPES.HEAD_OR_ARMOR,
    allowedClasses: ['mage'],
    hpBonus: 3,
    attackBonus: 0,
    movementSpeedBonus: 0,
    traversalTagsGranted: []
  },
  item_rusted_sword: {
    itemId: 'item_rusted_sword',
    nameKey: 'gearRustedSword',
    slotType: EQUIPMENT_SLOT_TYPES.WEAPON,
    allowedClasses: ['warrior'],
    hpBonus: 0,
    attackBonus: 1,
    movementSpeedBonus: 0,
    traversalTagsGranted: []
  },
  item_old_staff: {
    itemId: 'item_old_staff',
    nameKey: 'gearOldStaff',
    slotType: EQUIPMENT_SLOT_TYPES.WEAPON,
    allowedClasses: ['mage'],
    hpBonus: 0,
    attackBonus: 2,
    movementSpeedBonus: 0,
    traversalTagsGranted: []
  },
  item_worn_boots: {
    itemId: 'item_worn_boots',
    nameKey: 'gearWornBoots',
    slotType: EQUIPMENT_SLOT_TYPES.MOBILITY,
    allowedClasses: ['warrior'],
    hpBonus: 0,
    attackBonus: 0,
    movementSpeedBonus: 0.5,
    traversalTagsGranted: []
  },
  item_worn_cape: {
    itemId: 'item_worn_cape',
    nameKey: 'gearWornCape',
    slotType: EQUIPMENT_SLOT_TYPES.MOBILITY,
    allowedClasses: ['mage'],
    hpBonus: 0,
    attackBonus: 0,
    movementSpeedBonus: 0.5,
    traversalTagsGranted: []
  }
};
