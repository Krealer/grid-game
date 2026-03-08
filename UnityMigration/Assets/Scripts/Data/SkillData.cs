using UnityEngine;

namespace GridGame.Migration.Data
{
    [CreateAssetMenu(fileName = "SkillData", menuName = "GridGame/Skill Data")]
    public class SkillData : ScriptableObject
    {
        public string SkillName;
        public float DamageMultiplier = 1f;
        public string Element;
        public string Type;
    }
}
