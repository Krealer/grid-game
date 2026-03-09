export const STORY_ROUTE_CHOICES = {
  STORY: 'story',
  NO_STORY: 'no_story'
};

export const STORY_CONDITIONED_DOOR_EVENT_DEFINITIONS = {
  door_second_to_fire_01: {
    id: 'event_second_to_fire_gate',
    firstSeenFlag: 'event_second_to_fire_gate_seen',
    firstCompletedFlag: 'event_second_to_fire_gate_completed',
    firstTimeTextKeysByRoute: {
      story: [
        'eventSecondToFireStoryIntro',
        'eventSecondToFireStoryLore',
        'eventSecondToFireStoryProceed'
      ],
      no_story: [
        'eventSecondToFireNoStoryIntro'
      ]
    },
    repeatTextKeysByRoute: {
      story: ['eventSecondToFireStoryRepeat'],
      no_story: ['eventSecondToFireNoStoryRepeat']
    }
  }
};

export function resolveStoryConditionedRoute(slot) {
  const keyIds = new Set(slot?.worldProgress?.obtainedKeyIds || []);
  if (keyIds.has('key_story')) {
    return STORY_ROUTE_CHOICES.STORY;
  }

  if (keyIds.has('key_no_story')) {
    return STORY_ROUTE_CHOICES.NO_STORY;
  }

  return slot?.playerIdentity?.storyModeChoice === STORY_ROUTE_CHOICES.NO_STORY
    ? STORY_ROUTE_CHOICES.NO_STORY
    : STORY_ROUTE_CHOICES.STORY;
}
