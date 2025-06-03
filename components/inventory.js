// Store the player's inventory in a local array
let inventory = [];

/**
 * Add an item to the inventory and refresh the UI
 * @param {string} item - The name of the item to add
 */
export function addItem(item) {
  inventory[item] = (inventory[item] || 0) + 1;
  renderInventory();
}


/**
 * Render the inventory items inside the #inventory element
 */
function renderInventory() {
  const container = document.getElementById('inventory');
  container.innerHTML = '<h3>Inventory</h3>';
  const entries = Object.entries(inventory);

  if (entries.length === 0) {
    container.innerHTML += '<p>(Empty)</p>';
  } else {
    const list = document.createElement('ul');
    for (const [item, count] of entries) {
      const li = document.createElement('li');
      li.textContent = count > 1 ? `${item} ×${count}` : item;
      list.appendChild(li);
    }
    container.appendChild(list);
  }
}

/**
 * Optional: Get all inventory items (useful for saving later)
 */
export function getInventory() {
  return [...inventory]; // return a copy
}

/**
 * Optional: Clear the inventory (for testing/reset)
 */
export function resetInventory() {
  inventory = [];
  renderInventory();
}
