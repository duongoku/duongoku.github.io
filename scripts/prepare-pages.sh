#!/usr/bin/env bash
set -euo pipefail

npx vite build

mkdir -p _site/archive _site/assets
cp -R archive/. _site/archive/

if [[ -d assets ]]; then
  cp -R assets/. _site/assets/
fi

node scripts/generate-profile.mjs

touch _site/.nojekyll
