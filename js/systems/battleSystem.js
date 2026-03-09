export function getDefaultCompanionSkill(companion) {
  return companion?.skills?.find((skill) => skill.category === 'offensive') || companion?.skills?.[0] || null;
}

export function resolveCompanionAction({ companion, enemy, locale, calculateDamageWithElement, addBattleFeedbackEntry, getPartyMemberDisplayName }) {
  if (!companion) {
    return;
  }

  if (companion.hp <= 0) {
    addBattleFeedbackEntry('battleCompanionUnableToAct', {
      companion: getPartyMemberDisplayName(companion.id, locale)
    });
    return;
  }

  const companionSkill = getDefaultCompanionSkill(companion);
  if (!companionSkill) {
    return;
  }

  const companionAttackResult = calculateDamageWithElement(companion, companionSkill, enemy);
  enemy.hp = Math.max(0, enemy.hp - companionAttackResult.damage);
  addBattleFeedbackEntry('battleActionLine', {
    actor: getPartyMemberDisplayName(companion.id, locale),
    skill: locale[companionSkill.nameKey] || companionSkill.id,
    target: locale[enemy.nameKey] || enemy.nameKey,
    damage: companionAttackResult.damage
  });

  if (companionAttackResult.feedbackKey) {
    addBattleFeedbackEntry(companionAttackResult.feedbackKey);
  }
}

export function resolveEnemyActionAgainstPlayer({ enemy, enemySkill, player, locale, calculateDamageWithElement, addBattleFeedbackEntry }) {
  const enemyAttackResult = calculateDamageWithElement(enemy, enemySkill, player);
  player.hp = Math.max(0, player.hp - enemyAttackResult.damage);
  addBattleFeedbackEntry('battleActionLine', {
    actor: locale[enemy.nameKey] || enemy.nameKey,
    skill: locale[enemySkill.nameKey] || enemySkill.id,
    target: locale.battleStatusPlayer,
    damage: enemyAttackResult.damage
  });

  if (enemyAttackResult.feedbackKey) {
    addBattleFeedbackEntry(enemyAttackResult.feedbackKey);
  }
}
