import { habitatItems, moments } from "./content.js";
import { getPlacedTraits, ruleMatches } from "./simulation.js";
import { getCurrentEnvironment } from "./weather.js";

export function buyItem(state, itemId) {
  const item = habitatItems.find((candidate) => candidate.id === itemId);

  if (!item || state.ownedItemIds.includes(itemId) || state.petals < item.cost) {
    return { ok: false, reason: "unavailable" };
  }

  state.petals -= item.cost;
  state.ownedItemIds.push(itemId);
  state.placedItemIds.push(itemId);

  return { ok: true, item };
}

export function togglePlacedItem(state, itemId) {
  if (!state.ownedItemIds.includes(itemId)) {
    return false;
  }

  if (state.placedItemIds.includes(itemId)) {
    if (state.placedItemIds.length <= 1) {
      return false;
    }

    state.placedItemIds = state.placedItemIds.filter((candidate) => candidate !== itemId);
    return true;
  }

  state.placedItemIds.push(itemId);
  return true;
}

export function checkMoments(state, now = Date.now()) {
  const environment = getCurrentEnvironment(now);
  const traits = getPlacedTraits(state);
  const unlocked = [];

  for (const moment of moments) {
    if (state.seenMomentIds.includes(moment.id)) {
      continue;
    }

    if (ruleMatches(moment.rule, { state, traits, environment })) {
      state.seenMomentIds.push(moment.id);
      unlocked.push(moment);
    }
  }

  return unlocked;
}

export function getItemStatus(state, item) {
  if (state.ownedItemIds.includes(item.id)) {
    return state.placedItemIds.includes(item.id) ? "placed" : "stored";
  }

  if (state.petals >= item.cost) {
    return "available";
  }

  return "locked";
}
