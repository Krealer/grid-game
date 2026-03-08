using System.Collections.Generic;
using UnityEngine;

namespace GridGame.Migration.World
{
    public class Pathfinding : MonoBehaviour
    {
        public GridManager gridManager;

        public List<Vector2Int> FindPath(Vector2Int start, Vector2Int goal)
        {
            var queue = new Queue<Vector2Int>();
            var visited = new HashSet<Vector2Int>();
            var parent = new Dictionary<Vector2Int, Vector2Int>();

            queue.Enqueue(start);
            visited.Add(start);

            var dirs = new[] { Vector2Int.up, Vector2Int.down, Vector2Int.left, Vector2Int.right };

            while (queue.Count > 0)
            {
                var current = queue.Dequeue();
                if (current == goal) break;

                foreach (var d in dirs)
                {
                    var n = current + d;
                    if (visited.Contains(n) || !gridManager.IsWalkable(n)) continue;
                    visited.Add(n);
                    parent[n] = current;
                    queue.Enqueue(n);
                }
            }

            if (!visited.Contains(goal)) return new List<Vector2Int>();

            var path = new List<Vector2Int>();
            var step = goal;
            while (step != start)
            {
                path.Add(step);
                step = parent[step];
            }
            path.Reverse();
            return path;
        }
    }
}
