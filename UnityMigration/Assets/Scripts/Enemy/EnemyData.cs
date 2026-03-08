using System.Collections.Generic;
using UnityEngine;
using GridGame.Migration.Data;

namespace GridGame.Migration.Enemy
{
    [CreateAssetMenu(fileName = "EnemyData", menuName = "GridGame/Enemy Data")]
    public class EnemyData : ScriptableObject
    {
        public string EnemyId;
        public string DisplayName;
        public string Element;
        public int Hp = 20;
        public int Attack = 3;
        public List<SkillData> Skills;
    }
}
