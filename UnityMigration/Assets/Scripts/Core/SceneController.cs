using UnityEngine;
using UnityEngine.SceneManagement;

namespace GridGame.Migration.Core
{
    public class SceneController : MonoBehaviour
    {
        public void LoadScene(string sceneName)
        {
            SceneManager.LoadScene(sceneName);
        }
    }
}
