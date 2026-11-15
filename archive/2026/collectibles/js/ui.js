import { habitatItems, moments, tutorialSteps, visitors } from "./content.js";
import { buyItem, checkMoments, getItemStatus, togglePlacedItem } from "./progression.js";
import { saveState, resetState } from "./storage.js";
import { getPlacedTraits, getVisibleVisitors, runOfflineSimulation } from "./simulation.js";
import { getCurrentEnvironment } from "./weather.js";

const navItems = [
  { id: "garden", label: "Garden", icon: "◇" },
  { id: "journal", label: "Journal", icon: "▤" },
  { id: "items", label: "Items", icon: "▦" },
];

const itemPositions = [
  [16, 68],
  [30, 76],
  [45, 68],
  [62, 76],
  [78, 66],
  [20, 52],
  [38, 54],
  [56, 50],
  [74, 52],
  [88, 78],
  [10, 82],
  [50, 83],
  [66, 62],
  [33, 88],
  [84, 46],
  [14, 42],
  [48, 40],
  [70, 88],
  [26, 35],
  [58, 32],
];

const visitorPositions = [
  [23, 61],
  [42, 59],
  [60, 65],
  [76, 58],
];

export function createApp(root, initialState) {
  let state = initialState;
  let activeView = "garden";
  let tutorialIndex = 0;
  let tutorialOpen = !state.tutorialDone;
  const toasts = [];

  const offline = runOfflineSimulation(state);
  const momentUnlocks = checkMoments(state);
  saveState(state);

  if (offline.petals > 0) {
    queueToast(`While away: ${offline.petals} petals, ${offline.discoveries.length} new visitors.`);
  }

  for (const moment of momentUnlocks) {
    queueToast(`Moment: ${moment.title}`);
  }

  function render() {
    const environment = getCurrentEnvironment();

    root.innerHTML = `
      <header class="topbar">
        <div class="brand">
          <h1>Pocket Habitat</h1>
          <p>${environment.weather.description}</p>
        </div>
        <div class="stat-row" aria-label="Garden stats">
          <span class="pill">${state.petals} petals</span>
          <span class="pill">${environment.label}</span>
        </div>
      </header>
      <main class="layout">
        <section class="view view-${activeView}">
          ${renderActiveView(environment)}
        </section>
        <aside class="grid">
          ${renderLog()}
        </aside>
      </main>
      ${renderNav()}
      ${tutorialOpen ? renderTutorial() : ""}
      <div class="toast-stack" aria-live="assertive">
        ${toasts.map((toast) => `<div class="toast">${escapeHtml(toast)}</div>`).join("")}
      </div>
    `;

    bindEvents(root);
  }

  function renderActiveView(environment) {
    if (activeView === "journal") {
      return renderJournal();
    }

    if (activeView === "items") {
      return renderItems();
    }

    return renderGarden(environment);
  }

  function renderGarden(environment) {
    const visibleVisitors = getVisibleVisitors(state);
    const placedItems = state.placedItemIds
      .map((id) => habitatItems.find((item) => item.id === id))
      .filter(Boolean);
    const traits = getPlacedTraits(state);

    return `
      <div class="garden-wrap">
        <div class="garden-actions">
          <div>
            <h2>Garden</h2>
            <p class="small-note">${placedItems.length} items placed · ${Object.keys(traits).length} traits active</p>
          </div>
          <button data-action="collect">Check paths</button>
        </div>
        <div class="garden-scene panel" data-weather="${environment.weather.id}" data-period="${environment.period.id}" aria-label="Habitat scene">
          <div class="sky-mark"></div>
          <div class="ground-lines"></div>
          <div class="habitat-layer">
            ${placedItems
              .map((item, index) => renderHabitatPiece(item, itemPositions[index % itemPositions.length]))
              .join("")}
          </div>
          <div class="visitor-layer">
            ${visibleVisitors
              .map((visitor, index) =>
                renderVisitor(visitor, visitorPositions[index % visitorPositions.length]),
              )
              .join("")}
          </div>
          ${
            visibleVisitors.length === 0
              ? `<div class="scene-empty">Place more habitat items. Visitors appear when food, water, shelter, weather, and time match their rules.</div>`
              : ""
          }
        </div>
        <div class="notice">Local save active. Offline time uses device clock since last visit.</div>
      </div>
    `;
  }

  function renderItems() {
    return `
      <div class="view-header">
        <div>
          <h2>Items</h2>
          <p class="small-note">Buy with petals. Tap owned items to place or store.</p>
        </div>
        <div class="garden-actions">
          <button data-action="show-tutorial">Help</button>
          <button data-action="reset">Reset</button>
        </div>
      </div>
      <div class="cards">
        ${habitatItems.map((item) => renderItemCard(item)).join("")}
      </div>
    `;
  }

  function renderJournal() {
    return `
      <div class="view-header">
        <div>
          <h2>Journal</h2>
          <p class="small-note">${state.discoveredVisitorIds.length}/15 visitors · ${state.seenMomentIds.length}/5 moments</p>
        </div>
      </div>
      <div class="cards">
        ${visitors.map((visitor) => renderVisitorCard(visitor)).join("")}
      </div>
      <div class="view-header" style="margin-top: 1rem">
        <h2>Moments</h2>
      </div>
      <div class="cards">
        ${moments.map((moment) => renderMomentCard(moment)).join("")}
      </div>
    `;
  }

  function renderLog() {
    const recent = state.visitLog.slice(0, 5);

    return `
      <section class="panel card">
        <div class="card-top">
          <h2>Recent</h2>
          <span class="pill">${state.ownedItemIds.length}/20 items</span>
        </div>
        ${
          recent.length === 0
            ? `<p>No logged visits yet. Check paths or return later.</p>`
            : recent
                .map((entry) => {
                  const visitor = visitors.find((candidate) => candidate.id === entry.visitorId);
                  return `<p><strong>${visitor?.name ?? "Visitor"}</strong> left ${entry.petals} petals · ${formatTime(entry.at)}</p>`;
                })
                .join("")
        }
      </section>
    `;
  }

  function renderNav() {
    return `
      <nav class="bottom-nav" aria-label="Primary">
        ${navItems
          .map(
            (item) => `
              <button class="nav-button" data-view="${item.id}" aria-current="${activeView === item.id ? "page" : "false"}">
                <span class="nav-icon" aria-hidden="true">${item.icon}</span>
                <span>${item.label}</span>
              </button>
            `,
          )
          .join("")}
      </nav>
    `;
  }

  function renderTutorial() {
    const step = tutorialSteps[tutorialIndex];

    return `
      <section class="tutorial" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
        <div class="tutorial-card">
          <div class="tutorial-art" aria-hidden="true"></div>
          <p class="pill">Step ${tutorialIndex + 1} of ${tutorialSteps.length}</p>
          <h2 id="tutorial-title">${step.title}</h2>
          <p>${step.text}</p>
          <div class="garden-actions">
            <button data-action="skip-tutorial">Skip</button>
            <button data-action="next-tutorial">${tutorialIndex === tutorialSteps.length - 1 ? "Start" : "Next"}</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderItemCard(item) {
    const status = getItemStatus(state, item);
    const buttonLabel =
      status === "placed"
        ? "Store"
        : status === "stored"
          ? "Place"
          : status === "available"
            ? `Buy ${item.cost}`
            : `${item.cost} petals`;

    return `
      <article class="card item-card">
        <div class="item-art" aria-hidden="true">${renderHabitatPiece(item, [50, 50])}</div>
        <div class="grid">
          <div class="card-top">
            <h3>${item.name}</h3>
            <span class="pill">${status}</span>
          </div>
          <p>${item.description}</p>
          <div class="tag-row">
            ${Object.entries(item.traits)
              .map(([trait, amount]) => `<span class="tag">${trait} +${amount}</span>`)
              .join("")}
          </div>
          <button data-action="${state.ownedItemIds.includes(item.id) ? "toggle-item" : "buy-item"}" data-item-id="${item.id}" ${status === "locked" ? "disabled" : ""}>${buttonLabel}</button>
        </div>
      </article>
    `;
  }

  function renderVisitorCard(visitor) {
    const discovered = state.discoveredVisitorIds.includes(visitor.id);

    return `
      <article class="card journal-card ${discovered ? "" : "locked"}">
        <div class="card-top">
          <h3>${discovered ? visitor.name : "Unknown visitor"}</h3>
          <span class="pill">${discovered ? visitor.title : "hidden"}</span>
        </div>
        <p>${discovered ? visitor.note : "Match habitat rules to learn this visitor's name."}</p>
      </article>
    `;
  }

  function renderMomentCard(moment) {
    const seen = state.seenMomentIds.includes(moment.id);

    return `
      <article class="card moment-card ${seen ? "" : "locked"}">
        <h3>${seen ? moment.title : "Undiscovered moment"}</h3>
        <p>${seen ? moment.text : "A quiet scene waits for the right garden conditions."}</p>
      </article>
    `;
  }

  function bindEvents(container) {
    container.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => {
        activeView = button.dataset.view;
        render();
      });
    });

    container.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => handleAction(button));
    });
  }

  function handleAction(button) {
    const action = button.dataset.action;
    const itemId = button.dataset.itemId;

    if (action === "buy-item") {
      const result = buyItem(state, itemId);

      if (result.ok) {
        queueToast(`${result.item.name} added.`);
        afterStateChange();
      }
      return;
    }

    if (action === "toggle-item") {
      togglePlacedItem(state, itemId);
      afterStateChange();
      return;
    }

    if (action === "collect") {
      state.lastSeenAt -= 16 * 60 * 1000;
      const result = runOfflineSimulation(state);
      queueToast(result.petals ? `Paths checked: ${result.petals} petals.` : "Paths quiet for now.");
      afterStateChange();
      return;
    }

    if (action === "reset") {
      if (window.confirm("Reset Pocket Habitat save?")) {
        state = resetState();
        activeView = "garden";
        tutorialIndex = 0;
        tutorialOpen = true;
        queueToast("Save reset.");
        render();
      }
      return;
    }

    if (action === "show-tutorial") {
      tutorialIndex = 0;
      tutorialOpen = true;
      render();
      return;
    }

    if (action === "skip-tutorial") {
      state.tutorialDone = true;
      tutorialOpen = false;
      afterStateChange();
      return;
    }

    if (action === "next-tutorial") {
      if (tutorialIndex >= tutorialSteps.length - 1) {
        state.tutorialDone = true;
        tutorialOpen = false;
        afterStateChange();
      } else {
        tutorialIndex += 1;
        render();
      }
    }
  }

  function afterStateChange() {
    for (const moment of checkMoments(state)) {
      queueToast(`Moment: ${moment.title}`);
    }

    saveState(state);
    render();
  }

  function queueToast(message) {
    toasts.push(message);
    window.setTimeout(() => {
      toasts.shift();
      render();
    }, 3600);
  }

  render();
}

function renderHabitatPiece(item, [left, top]) {
  const spriteAttribute = item.sprite ? "data-sprite" : "";
  const spriteStyle = renderSpriteStyle(item.sprite);

  return `<span class="habitat-piece ${item.art}" title="${item.name}" ${spriteAttribute} style="left:${left}%;top:${top}%;${spriteStyle}"></span>`;
}

function renderVisitor(visitor, [left, top]) {
  const spriteAttribute = visitor.sprite ? "data-sprite" : "";
  const spriteStyle = renderSpriteStyle(visitor.sprite);

  return `
    <span class="visitor" style="left:${left}%;top:${top}%;--visitor-color:${visitor.color}">
      <span class="visitor-shape" aria-hidden="true" ${spriteAttribute} style="${spriteStyle}"></span>
      <span class="visitor-name">${visitor.name}</span>
    </span>
  `;
}

function renderSpriteStyle(sprite) {
  if (!sprite) {
    return "";
  }

  const xPercent = getSpritePositionPercent(sprite.column, sprite.columns);
  const yPercent = getSpritePositionPercent(sprite.row, sprite.rows);

  return [
    `--sprite-image:url('${sprite.src}')`,
    `--sprite-size-x:${sprite.columns * 100}%`,
    `--sprite-size-y:${sprite.rows * 100}%`,
    `--sprite-x:${xPercent}%`,
    `--sprite-y:${yPercent}%`,
  ].join(";");
}

function getSpritePositionPercent(index, count) {
  if (count <= 1) {
    return 0;
  }

  return (index / (count - 1)) * 100;
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
