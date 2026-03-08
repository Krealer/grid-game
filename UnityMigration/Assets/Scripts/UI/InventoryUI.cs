using UnityEngine;
using UnityEngine.UI;

namespace GridGame.Migration.UI
{
    public class InventoryUI : MonoBehaviour
    {
        public Text InventoryText;

        public void SetEmptyState(string message)
        {
            if (InventoryText != null) InventoryText.text = message;
        }
    }
}
