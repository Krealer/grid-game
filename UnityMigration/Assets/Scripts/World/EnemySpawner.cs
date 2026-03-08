using UnityEngine;
using GridGame.Migration.Enemy;

namespace GridGame.Migration.World
{
    public class EnemySpawner : MonoBehaviour
    {
        public EnemyController EnemyPrefab;

        public EnemyController Spawn(EnemyData data, Vector2Int gridPosition)
        {
            var enemy = Instantiate(EnemyPrefab, new Vector3(gridPosition.x, gridPosition.y, 0f), Quaternion.identity);
            enemy.Data = data;
            enemy.GridPosition = gridPosition;
            return enemy;
        }
    }
}
