import { defineConfig } from 'astro/config';

// When GitHub Actions builds a *project* page (served at
// https://USER.github.io/REPO/), it sets BASE_PATH=/REPO/ for us.
// Locally, and for a user page / custom domain, the base is just "/".
const base = process.env.BASE_PATH || '/';

// Final URL origin (used for absolute share-image / OG links).
const site = process.env.SITE_URL || 'https://victorsaly.github.io';

export default defineConfig({
  base,
  site,
  // Plain static site — perfect for GitHub Pages.
  output: 'static',
  // Keep CSS as an external file so the @font-face path (relative to /_astro/)
  // resolves correctly on deep routes and under a "/repo/" base path.
  build: { inlineStylesheets: 'never' },
});
