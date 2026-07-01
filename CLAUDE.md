# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal GitHub Pages site (duongoku.github.io) built as a single Lit web component (`duongoku-gh-page`). Tooling is open-wc + TypeScript, Vite for the site bundle, PostHog for analytics. See `AGENTS.md` for concise agent conventions — keep both files small.

## Commands

- `npm start` — TypeScript watch + `@web/dev-server`, opens `/demo/` (add `--hmr` for hot reload)
- `npm run build` — `tsc` compile, then regenerate `custom-elements.json`
- `npm run pages:build` — full site build via Vite → `_site/` plus `scripts/prepare-pages.sh` (copies `archive/`, generates `/profile/`). Run before pushing to `master`; the pre-push hook enforces it.
- `npm run lint` — ESLint (`.ts,.html`) + Prettier check
- `npm run format` — ESLint `--fix` + Prettier `--write`
- `npm run analyze` — `cem analyze --litelement`

No test runner is configured. Husky: pre-commit runs lint-staged; pre-push runs `npm run pages:build`.

## Architecture

- **Component**: `src/DuongokuGhPage.ts` is the LitElement (PostHog init in `connectedCallback`). `src/duongoku-gh-page.ts` registers the element; `src/index.ts` re-exports. Root `index.html` mounts it via `./dist/src/duongoku-gh-page.js`.
- **Build pipeline**: TypeScript (strict, NodeNext, decorators) compiles to `dist/` → Vite bundles `index.html` into `_site/` → `prepare-pages.sh` copies `archive/`, runs `generate-profile.mjs`, and touches `.nojekyll`.
- **Profile generation**: `scripts/generate-profile.mjs` fetches a LaTeX CV from the external repo `duongoku/my.cv` (override with `PROFILE_CV_TEX_URL`) and renders `_site/profile/index.html`.
- **Routing**: static, path-based (`/profile/`, `/archive/`). `archive/` holds year folders (2019–2026) of static HTML.
- **Analytics**: PostHog reads `window.__POSTHOG_KEY__` / `__POSTHOG_HOST__`; values come from a gitignored `.env`.
- **Deploy**: `.github/workflows/deploy-pages.yml` runs on push to `master`, a daily cron, and manual dispatch (Node 24, `npm ci`, `npm run pages:build`, deploys `_site`).

## Conventions

- Use npm; `package-lock.json` is authoritative.
- Edit only `src/`. Treat `dist/`, `_site/`, and `custom-elements.json` as generated — never hand-edit.
- ESLint extends `@open-wc` + `prettier` with `import/extensions: always`. Prettier uses single quotes and avoids arrow parens.
