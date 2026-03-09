import { SECOND_MAP_ID } from '../utils/constants.js';

export const STARTER_NPC_TEMPLATE = { id: 'npc_starter_guide', type: 'npc', x: 11, y: 11, nameKey: 'npcGuide' };
export const RECRUITABLE_NPC_TEMPLATE = { id: 'npc_recruit_01', type: 'recruitable_npc', x: 9, y: 1, nameKey: 'npcRecruitRowan', companionId: 'companion_rowan_01', originMapId: SECOND_MAP_ID, originX: 9, originY: 1, recruitmentStateFlag: 'npc_recruit_01_recruited' };

const STARTER_GUIDE_DIALOGUE_NODES = {
  intro_question: { id: 'intro_question', speaker: 'npc', textKey: 'npcStoryQuestion', choices: [
    { id: 'with_story', textKey: 'dialogueChoiceWithStory', nextNodeId: 'story_selected', effects: { setStoryModeChoice: 'story', grantKeyId: 'key_story', removeKeyIds: ['key_no_story'], npcFlags: { npc_starter_guide_intro_seen: true, npc_starter_guide_story_choice_made: true }, eventFlags: { event_starter_guide_story_choice_made: true } } },
    { id: 'without_story', textKey: 'dialogueChoiceWithoutStory', nextNodeId: 'no_story_selected', effects: { setStoryModeChoice: 'no_story', grantKeyId: 'key_no_story', removeKeyIds: ['key_story'], npcFlags: { npc_starter_guide_intro_seen: true, npc_starter_guide_story_choice_made: true }, eventFlags: { event_starter_guide_story_choice_made: true } } }
  ] },
  story_selected: { id: 'story_selected', speaker: 'npc', textKey: 'npcStoryChoiceAccepted', nextNodeId: null, effects: { npcFlags: { npc_starter_guide_followup_seen: true } } },
  no_story_selected: { id: 'no_story_selected', speaker: 'npc', textKey: 'npcNoStoryChoiceAccepted', nextNodeId: null, effects: { npcFlags: { npc_starter_guide_followup_seen: true } } },
  followup_story: { id: 'followup_story', speaker: 'npc', textKey: 'npcStoryModeFollowup', nextNodeId: null, conditions: { storyModeChoice: 'story' } },
  followup_no_story: { id: 'followup_no_story', speaker: 'npc', textKey: 'npcNoStoryModeFollowup', nextNodeId: null, conditions: { storyModeChoice: 'no_story' } },
  post_door_story: { id: 'post_door_story', speaker: 'npc', textKey: 'npcStoryModeDoorSpawnedFollowup', nextNodeId: null, conditions: { storyModeChoice: 'story' } },
  post_door_no_story: { id: 'post_door_no_story', speaker: 'npc', textKey: 'npcNoStoryModeDoorSpawnedFollowup', nextNodeId: null, conditions: { storyModeChoice: 'no_story' } }
};

const STARTER_GUIDE_DIALOGUE_FLOW = { entryNodeId: 'intro_question', postDoorNodeByStoryChoice: { story: 'post_door_story', no_story: 'post_door_no_story' }, repeatNodeByStoryChoice: { story: 'followup_story', no_story: 'followup_no_story' } };
const RECRUIT_ROWAN_DIALOGUE_NODES = {
  intro: { id: 'intro', speaker: 'npc', textKey: 'npcRecruitRowanIntro', nextNodeId: 'ask_join' },
  ask_join: { id: 'ask_join', speaker: 'npc', textKey: 'npcRecruitRowanPrompt', choices: [{ id: 'yes', textKey: 'yes', nextNodeId: 'joined', effects: { recruitCompanionId: 'companion_rowan_01', recruitNpcId: 'npc_recruit_01', recruitNpcFlag: 'npc_recruit_01_recruited' } }, { id: 'no', textKey: 'no', nextNodeId: 'declined' }] },
  joined: { id: 'joined', speaker: 'npc', textKey: 'npcRecruitRowanJoined', nextNodeId: null },
  declined: { id: 'declined', speaker: 'npc', textKey: 'npcRecruitRowanDeclined', nextNodeId: null },
  recruited_inactive: { id: 'recruited_inactive', speaker: 'npc', textKey: 'npcRecruitRowanReturned', nextNodeId: null }
};

const getStarterGuideDialogueStartNodeIdForSlot = (slot) => {
  const storyChoiceMade = Boolean(slot?.npcStateFlags?.npc_starter_guide_story_choice_made);
  const storyModeChoice = slot?.playerIdentity?.storyModeChoice || 'story';
  const doorSpawned = Boolean(slot?.worldProgress?.triggeredEventFlags?.event_starter_door_spawned);
  if (!storyChoiceMade) return STARTER_GUIDE_DIALOGUE_FLOW.entryNodeId;
  if (doorSpawned) return STARTER_GUIDE_DIALOGUE_FLOW.postDoorNodeByStoryChoice[storyModeChoice] || STARTER_GUIDE_DIALOGUE_FLOW.postDoorNodeByStoryChoice.story;
  return STARTER_GUIDE_DIALOGUE_FLOW.repeatNodeByStoryChoice[storyModeChoice] || STARTER_GUIDE_DIALOGUE_FLOW.repeatNodeByStoryChoice.story;
};

const getRecruitRowanStartNodeIdForSlot = (slot) => {
  const companionId = 'companion_rowan_01';
  const recruitedIds = new Set(slot?.party?.recruitedCompanionIds || []);

  if (!recruitedIds.has(companionId)) {
    return 'intro';
  }

  const activeIds = new Set(slot?.party?.activePartyMemberIds || []);
  if (activeIds.has(companionId)) {
    return 'joined';
  }

  return 'recruited_inactive';
};

export const DIALOGUE_DEFINITIONS_BY_NPC_ID = {
  npc_starter_guide: { nodes: STARTER_GUIDE_DIALOGUE_NODES, getStartNodeId: getStarterGuideDialogueStartNodeIdForSlot },
  npc_recruit_01: { nodes: RECRUIT_ROWAN_DIALOGUE_NODES, getStartNodeId: getRecruitRowanStartNodeIdForSlot }
};
