using UnityEngine;
using UnityEngine.Tilemaps;

namespace GridGame.Migration.World
{
    public class GridManager : MonoBehaviour
    {
        public Tilemap GroundTilemap;

        public bool IsWalkable(Vector2Int cell)
        {
            return GroundTilemap != null && GroundTilemap.HasTile((Vector3Int)cell);
        }
    }
}
