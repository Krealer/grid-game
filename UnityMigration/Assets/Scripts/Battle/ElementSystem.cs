namespace GridGame.Migration.Battle
{
    public static class ElementSystem
    {
        public static float GetModifier(string attackElement, string targetElement)
        {
            if (string.IsNullOrEmpty(attackElement) || attackElement == "none") return 1f;
            if (attackElement == "fire" && targetElement == "earth") return 1.5f;
            if (attackElement == "earth" && targetElement == "water") return 1.5f;
            if (attackElement == "water" && targetElement == "fire") return 1.5f;
            if (attackElement == targetElement) return 0.75f;
            return 1f;
        }
    }
}
