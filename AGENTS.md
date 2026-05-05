This is a Lit web component package for `duongoku-gh-page`, built with open-wc tooling and PostHog browser instrumentation.

Vite bundles the root `index.html` for GitHub Pages deployment.

Use npm. `package-lock.json` is authoritative.

Useful commands:

- `npm start` runs TypeScript watch mode plus local web dev server.
- `npm run build` compiles TypeScript and regenerates `custom-elements.json`.
- `npm run lint` checks ESLint and Prettier.
- `npm run format` fixes lint and formatting issues.

Treat `dist/` and `custom-elements.json` as generated build output. Prefer editing source under `src/`.

GitHub Pages deploys from `.github/workflows/deploy-pages.yml` on `master` pushes and manual dispatch. The workflow runs `npm ci`, `npm run build`, `npx vite build`, copies static `archive/` and `assets/` into `_site/`, and uploads that artifact.

After significant project changes, update this file so future agents inherit current constraints, commands, and generated-output rules.
