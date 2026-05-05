This is a Lit web component package for `duongoku-gh-page`, built with open-wc tooling and PostHog browser instrumentation.

Keep this file small: repo-wide facts only. Put task-specific or language-specific guidance in linked docs or nested `AGENTS.md` files.

Use npm. `package-lock.json` is authoritative.

Useful commands:

- `npm start` runs TypeScript watch mode plus local web dev server.
- `npm run build` compiles TypeScript and regenerates `custom-elements.json`.
- `npm run lint` checks ESLint and Prettier.
- `npm run format` fixes lint and formatting issues.

Treat `dist/` and `custom-elements.json` as generated build output. Prefer editing source under `src/`.

Vite bundles root `index.html`. GitHub Pages deploys on `master` pushes and manual dispatch.
