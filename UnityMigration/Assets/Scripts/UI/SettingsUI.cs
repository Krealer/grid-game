using UnityEngine;

namespace GridGame.Migration.UI
{
    public class SettingsUI : MonoBehaviour
    {
        public bool ShowCoordinates;

        public void ToggleCoordinates()
        {
            ShowCoordinates = !ShowCoordinates;
        }
    }
}
