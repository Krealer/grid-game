import { GEAR_ITEM_DEFINITIONS, DEFAULT_EQUIPPED_GEAR, EQUIPMENT_SLOT_ORDER } from '../data/gear.js';

export function normalizeOwnedGearItemIds(itemIds) {
  if (!Array.isArray(itemIds)) {
    return [];
  }

  return [...new Set(itemIds.filter((itemId) => Boolean(GEAR_ITEM_DEFINITIONS[itemId])))];
}

export function normalizeEquippedGear(equippedGear) {
  const normalized = { ...DEFAULT_EQUIPPED_GEAR };

  EQUIPMENT_SLOT_ORDER.forEach((slotType) => {
    const itemId = equippedGear?.[slotType];
    normalized[slotType] = GEAR_ITEM_DEFINITIONS[itemId] ? itemId : null;
  });

  return normalized;
}

export function normalizeEquippedGearByMember(equippedGearByMember, validMemberIds = []) {
  const validSet = new Set(validMemberIds.filter((memberId) => typeof memberId === 'string'));
  const source = equippedGearByMember && typeof equippedGearByMember === 'object' && !Array.isArray(equippedGearByMember)
    ? equippedGearByMember
    : {};

  const normalized = {};
  validSet.forEach((memberId) => {
    normalized[memberId] = normalizeEquippedGear(source[memberId]);
  });

  return normalized;
}

export function canClassEquipItem(className, itemDefinition) {
  if (!className || !itemDefinition) {
    return false;
  }

  return itemDefinition.allowedClasses.includes(className);
}

export function canEquipItemForSlot({ className, slotType, itemId, ownedGearItemIds }) {
  const definition = GEAR_ITEM_DEFINITIONS[itemId];
  if (!definition || definition.slotType !== slotType || !canClassEquipItem(className, definition)) {
    return false;
  }

  return normalizeOwnedGearItemIds(ownedGearItemIds).includes(itemId);
}

export function calculateEquipmentBonuses(equippedGear, className) {
  const normalizedGear = normalizeEquippedGear(equippedGear);

  return EQUIPMENT_SLOT_ORDER.reduce((result, slotType) => {
    const itemId = normalizedGear[slotType];
    const item = GEAR_ITEM_DEFINITIONS[itemId];
    if (!item || !canClassEquipItem(className, item)) {
      return result;
    }

    result.hpBonus += item.hpBonus || 0;
    result.attackBonus += item.attackBonus || 0;
    result.movementSpeedBonus += item.movementSpeedBonus || 0;
    (item.traversalTagsGranted || []).forEach((tag) => result.traversalTagsGranted.add(tag));
    return result;
  }, {
    hpBonus: 0,
    attackBonus: 0,
    movementSpeedBonus: 0,
    traversalTagsGranted: new Set()
  });
}

export function createStarterGearInventoryForClass(className) {
  return normalizeOwnedGearItemIds(Object.keys(GEAR_ITEM_DEFINITIONS).filter((itemId) => {
    const item = GEAR_ITEM_DEFINITIONS[itemId];
    return item.allowedClasses.includes(className);
  }));
}

export function enforceUniqueEquippedItems(equippedGearByMember, preferredOwnerOrder = []) {
  const normalized = {};
  const seenItems = new Set();
  const orderedMemberIds = [
    ...preferredOwnerOrder,
    ...Object.keys(equippedGearByMember).filter((memberId) => !preferredOwnerOrder.includes(memberId))
  ];

  orderedMemberIds.forEach((memberId) => {
    const equippedGear = normalizeEquippedGear(equippedGearByMember[memberId]);
    normalized[memberId] = { ...equippedGear };

    EQUIPMENT_SLOT_ORDER.forEach((slotType) => {
      const itemId = equippedGear[slotType];
      if (!itemId || seenItems.has(itemId)) {
        normalized[memberId][slotType] = null;
        return;
      }
      seenItems.add(itemId);
    });
  });

  return normalized;
}
