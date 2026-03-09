export function loadRawSlots(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function persistSlots(storageKey, slots) {
  localStorage.setItem(storageKey, JSON.stringify(slots));
}
