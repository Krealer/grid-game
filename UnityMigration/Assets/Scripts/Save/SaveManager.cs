using System;
using System.Collections.Generic;
using UnityEngine;

namespace GridGame.Migration.Save
{
    [Serializable]
    public class SaveSlotData
    {
        public int slotId;
        public string playerClass;
        public string playerElement;
        public int playerX;
        public int playerY;
        public List<string> defeatedEnemies = new();
        public bool showCoordinates;
    }

    public class SaveManager : MonoBehaviour
    {
        private const string SavePrefix = "gridGameSaveSlot_";

        public void SaveSlot(SaveSlotData slot)
        {
            var json = JsonUtility.ToJson(slot);
            PlayerPrefs.SetString(SavePrefix + slot.slotId, json);
            PlayerPrefs.Save();
        }

        public SaveSlotData LoadSlot(int slotId)
        {
            var key = SavePrefix + slotId;
            if (!PlayerPrefs.HasKey(key)) return null;
            return JsonUtility.FromJson<SaveSlotData>(PlayerPrefs.GetString(key));
        }
    }
}
