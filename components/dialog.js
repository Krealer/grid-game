const greetings = [
  "Hello there, traveler!",
  "Stay awhile and listen.",
  "The weather's nice today, isn't it?",
  "Watch out for the red tiles...",
  "I've seen things you wouldn't believe.",
  "Do you seek wisdom or gold?",
  "Every chest hides a mystery.",
  "The caves are deeper than you think.",
  "Doors lead both in and out.",
  "Not all walls are what they seem..."
];

/**
 * Display a message in the dialog box.
 * If no message is given, shows a random NPC greeting.
 * @param {string} [text] - Optional message to display
 */
export function showDialog(text) {
  const box = document.getElementById('dialog-box');
  const message = text ?? greetings[Math.floor(Math.random() * greetings.length)];
  box.innerHTML = `<strong>NPC:</strong> ${message}`;
}

/**
 * Clear the dialog box (e.g., after moving away)
 */
export function clearDialog() {
  const box = document.getElementById('dialog-box');
  box.innerHTML = '';
}
