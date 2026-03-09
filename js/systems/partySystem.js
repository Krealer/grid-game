import { MAIN_PARTY_MEMBER_ID } from '../utils/constants.js';

export function createBattlePartyData(slot, { normalizePartyMemberStates, createPlayerBattleData, createCompanionBattleData }) {
  const memberStates = normalizePartyMemberStates(slot.party?.memberStates, slot.playerIdentity);
  const activeIds = slot.party?.activePartyMemberIds?.length ? slot.party.activePartyMemberIds : [MAIN_PARTY_MEMBER_ID];
  const members = [];

  activeIds.forEach((memberId) => {
    if (memberId === MAIN_PARTY_MEMBER_ID) {
      members.push({ id: MAIN_PARTY_MEMBER_ID, kind: 'player', ...createPlayerBattleData(slot) });
      return;
    }

    const companionBattleData = createCompanionBattleData(memberId, memberStates[memberId], slot);
    if (companionBattleData) {
      members.push({ ...companionBattleData, kind: 'companion' });
    }
  });

  return members;
}

export function updatePartyBattleMemberHp(slotId, partyMembers, { getSlotById, updateSlot, normalizePartyMemberStates, getEffectiveMemberStats }) {
  const slot = getSlotById(slotId);
  if (!slot) {
    return;
  }

  const activePartyMemberIds = slot.party?.activePartyMemberIds?.length
    ? slot.party.activePartyMemberIds
    : [MAIN_PARTY_MEMBER_ID];
  const memberStates = normalizePartyMemberStates(slot.party?.memberStates, slot.playerIdentity);

  partyMembers.forEach((member) => {
    if (!member || !member.id || !memberStates[member.id]) {
      return;
    }

    const baseState = memberStates[member.id];
    const effectiveState = getEffectiveMemberStats ? getEffectiveMemberStats(baseState, slot) : baseState;
    const normalizedHp = Math.max(0, Math.min(effectiveState.maxHp, Math.floor(member.hp)));
    memberStates[member.id] = {
      ...baseState,
      currentHp: normalizedHp
    };
  });

  updateSlot(slotId, {
    party: {
      activePartyMemberIds,
      memberStates
    }
  });
}

export function getFirstActiveCompanionBattler(partyMembers = []) {
  return partyMembers.find((member) => member.kind === 'companion') || null;
}
