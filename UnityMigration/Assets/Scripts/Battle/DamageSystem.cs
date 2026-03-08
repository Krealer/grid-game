using UnityEngine;

namespace GridGame.Migration.Battle
{
    public static class DamageSystem
    {
        public static int ComputeDamage(int attack, float multiplier, string attackElement, string targetElement)
        {
            var baseDamage = attack * multiplier;
            var elementBonus = ElementSystem.GetModifier(attackElement, targetElement);
            return Mathf.Max(1, Mathf.RoundToInt(baseDamage * elementBonus));
        }
    }
}
