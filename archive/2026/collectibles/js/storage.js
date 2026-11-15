export const STORAGE_KEY = "pocket-habitat-save";
export const SAVE_VERSION = 1;

export function createDefaultState(now = Date.now()) {
  return {
    version: SAVE_VERSION,
    createdAt: now,
    lastSeenAt: now,
    petals: 12,
    ownedItemIds: ["seed-tray", "moss-stone"],
    placedItemIds: ["seed-tray", "moss-stone"],
    discoveredVisitorIds: [],
    seenMomentIds: [],
    visitLog: [],
    tutorialDone: false,
  };
}

export function loadState(now = Date.now()) {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return createDefaultState(now);
  }

  try {
    const parsed = JSON.parse(raw);

    if (parsed.version !== SAVE_VERSION) {
      return createDefaultState(now);
    }

    return {
      ...createDefaultState(now),
      ...parsed,
      ownedItemIds: uniqueStrings(parsed.ownedItemIds),
      placedItemIds: uniqueStrings(parsed.placedItemIds),
      discoveredVisitorIds: uniqueStrings(parsed.discoveredVisitorIds),
      seenMomentIds: uniqueStrings(parsed.seenMomentIds),
      visitLog: Array.isArray(parsed.visitLog) ? parsed.visitLog.slice(0, 40) : [],
      lastSeenAt: Number.isFinite(parsed.lastSeenAt) ? parsed.lastSeenAt : now,
    };
  } catch {
    return createDefaultState(now);
  }
}

export function saveState(state) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      version: SAVE_VERSION,
      savedAt: Date.now(),
    }),
  );
}

export function resetState(now = Date.now()) {
  const state = createDefaultState(now);
  saveState(state);
  return state;
}

function uniqueStrings(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((item) => typeof item === "string"))];
}
