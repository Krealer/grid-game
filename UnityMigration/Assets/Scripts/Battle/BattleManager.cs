using UnityEngine;
using GridGame.Migration.Player;
using GridGame.Migration.Enemy;

namespace GridGame.Migration.Battle
{
    public class BattleManager : MonoBehaviour
    {
        public PlayerStats Player;
        public EnemyData Enemy;

        public int EnemyCurrentHp;

        private void Start()
        {
            if (Enemy != null) EnemyCurrentHp = Enemy.Hp;
        }

        public void PlayerAttack(float multiplier, string attackElement)
        {
            EnemyCurrentHp -= DamageSystem.ComputeDamage(Player.Attack, multiplier, attackElement, Enemy.Element);
            EnemyCurrentHp = Mathf.Max(0, EnemyCurrentHp);
        }

        public void EnemyAttack()
        {
            Player.CurrentHp -= DamageSystem.ComputeDamage(Enemy.Attack, 1f, Enemy.Element, Player.Element);
            Player.CurrentHp = Mathf.Max(0, Player.CurrentHp);
        }
    }
}
