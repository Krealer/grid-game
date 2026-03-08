using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using GridGame.Migration.World;

namespace GridGame.Migration.Player
{
    public class PlayerController : MonoBehaviour
    {
        public float tilesPerSecond = 2f;
        public Vector2Int CurrentGridPosition;

        private bool _moving;

        public void MoveAlongPath(List<Vector2Int> path)
        {
            if (_moving || path == null || path.Count == 0) return;
            StartCoroutine(StepPath(path));
        }

        private IEnumerator StepPath(List<Vector2Int> path)
        {
            _moving = true;
            foreach (var tile in path)
            {
                var start = transform.position;
                var end = new Vector3(tile.x, tile.y, 0f);
                var duration = 1f / tilesPerSecond;
                var elapsed = 0f;

                while (elapsed < duration)
                {
                    elapsed += Time.deltaTime;
                    transform.position = Vector3.Lerp(start, end, Mathf.Clamp01(elapsed / duration));
                    yield return null;
                }

                CurrentGridPosition = tile;
            }

            _moving = false;
        }
    }
}
