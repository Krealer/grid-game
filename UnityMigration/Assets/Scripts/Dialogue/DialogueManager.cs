using System.Collections.Generic;
using UnityEngine;

namespace GridGame.Migration.Dialogue
{
    public class DialogueManager : MonoBehaviour
    {
        public List<string> Lines = new();
        private int _index;

        public string CurrentLine => _index < Lines.Count ? Lines[_index] : string.Empty;

        public bool Advance()
        {
            _index++;
            return _index < Lines.Count;
        }

        public void ResetDialogue()
        {
            _index = 0;
        }
    }
}
