using UnityEngine;

namespace GridGame.Migration.Player
{
    [System.Serializable]
    public class PlayerStats
    {
        public string ClassName;
        public string Element;
        public int MaxHp;
        public int CurrentHp;
        public int Attack;
    }
}
