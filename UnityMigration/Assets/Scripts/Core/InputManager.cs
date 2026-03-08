using UnityEngine;

namespace GridGame.Migration.Core
{
    public class InputManager : MonoBehaviour
    {
        public bool TryGetGridClick(out Vector3 worldPoint)
        {
            worldPoint = Vector3.zero;
            if (!Input.GetMouseButtonDown(0)) return false;
            worldPoint = Camera.main.ScreenToWorldPoint(Input.mousePosition);
            return true;
        }
    }
}
