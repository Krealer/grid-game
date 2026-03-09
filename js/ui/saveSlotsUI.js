export function renderSaveSlotsUI({ saveSlotsList, slots, currentSlotId, getLocale, formatText, hasExistingSave, onDeleteRequest }) {
  const locale = getLocale();
  saveSlotsList.innerHTML = '';

  slots.forEach((slot) => {
    const item = document.createElement('li');
    const slotRow = document.createElement('div');
    const button = document.createElement('button');
    const label = document.createElement('span');
    const value = document.createElement('span');
    const deleteButton = document.createElement('button');
    const filledSlot = hasExistingSave(slot);

    slotRow.className = 'save-slot-row';

    button.type = 'button';
    button.className = 'save-slot';
    button.dataset.slotId = String(slot.metadata.slotId);
    if (slot.metadata.slotId === currentSlotId) {
      button.classList.add('selected');
    }

    label.className = 'slot-name';
    label.textContent = formatText(locale.slotLabel, { number: slot.metadata.slotId });

    value.className = 'slot-value';
    value.textContent = filledSlot
      ? `${locale[slot.playerIdentity.chosenElement]} • ${locale[slot.playerIdentity.chosenClass]}`
      : locale.newGame;

    deleteButton.type = 'button';
    deleteButton.className = 'save-slot-delete';
    deleteButton.dataset.deleteSlotId = String(slot.metadata.slotId);
    deleteButton.textContent = locale.deleteSlot;
    deleteButton.disabled = !filledSlot;
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      onDeleteRequest(slot.metadata.slotId);
    });

    button.append(label, value);
    slotRow.append(button, deleteButton);
    item.append(slotRow);
    saveSlotsList.append(item);
  });
}
