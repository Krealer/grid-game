using UnityEngine;

namespace GridGame.Migration.UI
{
    public class MenuController : MonoBehaviour
    {
        public GameObject[] Panels;

        public void ShowPanel(GameObject panel)
        {
            foreach (var p in Panels) p.SetActive(p == panel);
        }
    }
}
