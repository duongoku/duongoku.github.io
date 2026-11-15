# Pocket Habitat

Static cozy collecting game for `archive/2026/collectibles/`.

## Run

Use any static server from the repo root:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080/archive/2026/collectibles/`.

No backend, build step, external API, fonts, or image assets are required.

## Architecture

- `index.html` loads CSS and `js/main.js`.
- `styles.css` contains responsive layout, CSS/geometric art, animations, and reduced-motion support.
- `js/content.js` contains all visitor, item, weather, time period, moment, and tutorial content.
- `js/storage.js` owns versioned `localStorage` save, migration-by-reset, and reset.
- `js/weather.js` derives weather and time period from the device clock.
- `js/simulation.js` runs data-driven visitor matching and offline elapsed-time simulation.
- `js/progression.js` handles buying, placing, and moment unlock checks.
- `js/ui.js` renders the three bottom-nav views and binds actions.

## Adding Content

Add habitat items in `js/content.js` under `habitatItems`. Each item needs:

- `id`
- `name`
- `cost`
- `art` CSS class
- `traits`
- `description`

Add visitors in `visitors`. Visitor rules stay data-driven:

```js
rules: {
  minItems: 3,
  traits: { water: 2, shelter: 1 },
  weather: ["mist"],
  periods: ["dawn", "dusk"],
  items: ["flat-pond"]
}
```

All rule keys are optional. The simulation reads rules without visitor-specific code.

Add moments in `moments` with `rule` objects using the same matcher plus `ownedItems` and `discoveredVisitors`.

## Testing Checklist

- Start static server and load `/archive/2026/collectibles/`.
- Complete or skip tutorial in under one minute.
- Use bottom nav: Garden, Journal, Items.
- Buy an affordable item, place/store an owned item, then reload and confirm save persists.
- Use Items > Reset and confirm versioned save returns to starter state.
- Set system clock forward or leave tab closed, reload, and confirm offline petals/log entries can appear.
- Check console for critical errors.
- Test narrow portrait viewport around 360px wide.
- Test desktop viewport around 1280px wide.
- Enable reduced motion in browser/OS and confirm animations stop.
