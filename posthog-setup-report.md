<wizard-report>
# PostHog post-wizard report

PostHog analytics integration for the `duongoku-gh-page` Lit web component.

## Summary of changes

- **`src/DuongokuGhPage.ts`** — Uses a `connectedCallback` lifecycle hook that initialises `posthog-js` on first mount using `window.__POSTHOG_KEY__` and `window.__POSTHOG_HOST__` globals provided by the consuming application. Exception autocapture is enabled via `startExceptionAutocapture()`. A `component_connected` event is captured on each mount with component identity only. All PostHog calls are wrapped in a try/catch that reports errors via `captureException`.

- **`.env`** — Created with `POSTHOG_API_KEY` and `POSTHOG_HOST` (gitignored). These document the environment variable names that the consuming application should use when setting the window globals.

- No keys are hardcoded in source. The consuming application sets `window.__POSTHOG_KEY__` and `window.__POSTHOG_HOST__` before loading the component (e.g. from its own build-time environment variables).

## Events instrumented

| Event name | Description | File |
|---|---|---|
| `component_connected` | Fired when the DuongokuGhPage web component is connected to the DOM. Includes the `component` property. | `src/DuongokuGhPage.ts` |

## Next steps

Dashboard and insight links from the setup:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/46619/dashboard/1545006
- **Component connections over time** (daily line chart): https://us.posthog.com/project/46619/insights/ByQG23f6
- **Unique visitors per day** (DAU line chart): https://us.posthog.com/project/46619/insights/w8p5sqCV
- **Total component connections — last 30 days** (bold number): https://us.posthog.com/project/46619/insights/CLD7K4yl
- **Weekly active users** (bar chart): https://us.posthog.com/project/46619/insights/bMhcekrk
- **User lifecycle — new, returning, and churned** (lifecycle stacked chart): https://us.posthog.com/project/46619/insights/xaA4f6qS

### Activating PostHog in a consuming application

In the HTML page that loads this component, set the window globals before the component script runs:

```html
<script>
  window.__POSTHOG_KEY__ = process.env.POSTHOG_API_KEY;   // your PostHog project API key
  window.__POSTHOG_HOST__ = process.env.POSTHOG_HOST;     // your PostHog host (see .env)
</script>
```

</wizard-report>
