import { habitatItems, visitors } from "./content.js";
import { getCurrentEnvironment } from "./weather.js";

const VISIT_INTERVAL_MS = 15 * 60 * 1000;
const MAX_OFFLINE_STEPS = 192;

export function runOfflineSimulation(state, now = Date.now()) {
  const elapsedMs = Math.max(0, now - state.lastSeenAt);
  const steps = Math.min(MAX_OFFLINE_STEPS, Math.floor(elapsedMs / VISIT_INTERVAL_MS));
  const discoveries = [];
  let petals = 0;

  for (let step = 1; step <= steps; step += 1) {
    const stepTime = state.lastSeenAt + step * VISIT_INTERVAL_MS;
    const environment = getCurrentEnvironment(stepTime);
    const eligible = getEligibleVisitors(state, environment);

    if (eligible.length === 0) {
      continue;
    }

    const rng = seededRandom(`${stepTime}:${state.placedItemIds.join(",")}`);
    const chance = Math.min(0.62, 0.18 + state.placedItemIds.length * 0.018);

    if (rng() > chance) {
      continue;
    }

    const visitor = eligible[Math.floor(rng() * eligible.length)];
    const reward = 1 + Math.floor(rng() * 4);

    petals += reward;
    addVisitLog(state, visitor.id, stepTime, reward);

    if (!state.discoveredVisitorIds.includes(visitor.id)) {
      state.discoveredVisitorIds.push(visitor.id);
      discoveries.push(visitor);
    }
  }

  state.petals += petals;
  state.lastSeenAt = now;

  return {
    elapsedMs,
    steps,
    petals,
    discoveries,
  };
}

export function getVisibleVisitors(state, now = Date.now()) {
  const environment = getCurrentEnvironment(now);
  const eligible = getEligibleVisitors(state, environment);

  if (eligible.length === 0) {
    return [];
  }

  return eligible
    .map((visitor) => ({
      visitor,
      rank: seededRandom(`${visitor.id}:${Math.floor(now / VISIT_INTERVAL_MS)}`)(),
    }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, Math.min(4, Math.max(1, Math.ceil(state.placedItemIds.length / 4))))
    .map((entry) => entry.visitor);
}

export function getEligibleVisitors(state, environment = getCurrentEnvironment()) {
  const traits = getPlacedTraits(state);

  return visitors.filter((visitor) =>
    ruleMatches(visitor.rules, {
      state,
      traits,
      environment,
    }),
  );
}

export function getPlacedTraits(state) {
  const traits = {};

  for (const itemId of state.placedItemIds) {
    const item = habitatItems.find((candidate) => candidate.id === itemId);

    if (!item) {
      continue;
    }

    for (const [trait, amount] of Object.entries(item.traits)) {
      traits[trait] = (traits[trait] ?? 0) + amount;
    }
  }

  return traits;
}

export function ruleMatches(rule, context) {
  if (!rule) {
    return true;
  }

  const { state, traits, environment } = context;

  if (rule.minItems && state.placedItemIds.length < rule.minItems) {
    return false;
  }

  if (rule.ownedItems && state.ownedItemIds.length < rule.ownedItems) {
    return false;
  }

  if (
    rule.discoveredVisitors &&
    state.discoveredVisitorIds.length < rule.discoveredVisitors
  ) {
    return false;
  }

  if (rule.items?.some((itemId) => !state.placedItemIds.includes(itemId))) {
    return false;
  }

  if (
    rule.weather &&
    environment &&
    !rule.weather.includes(environment.weather.id)
  ) {
    return false;
  }

  if (
    rule.periods &&
    environment &&
    !rule.periods.includes(environment.period.id)
  ) {
    return false;
  }

  if (rule.traits) {
    for (const [trait, amount] of Object.entries(rule.traits)) {
      if ((traits[trait] ?? 0) < amount) {
        return false;
      }
    }
  }

  return true;
}

export function seededRandom(seed) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return function random() {
    hash += hash << 13;
    hash ^= hash >>> 7;
    hash += hash << 3;
    hash ^= hash >>> 17;
    hash += hash << 5;

    return ((hash >>> 0) % 100000) / 100000;
  };
}

function addVisitLog(state, visitorId, at, petals) {
  state.visitLog.unshift({ visitorId, at, petals });
  state.visitLog = state.visitLog.slice(0, 40);
}
