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

  // The dev toolbar talks to Vite over a websocket. When the dev server is viewed
  // through a proxy (e.g. the in-IDE preview), that websocket can't connect, so the
  // toolbar throws a flood of "Cannot read properties of undefined (reading 'send')"
  // errors in the console. It's only a developer overlay, so turn it off.
  devToolbar: { enabled: false },

  // Vite-specific dev server settings live under `vite` (Astro's own top-level
  // `server` only covers host/port/etc.).
  vite: {
    server: {
      // Same root cause for hot-reload: the HMR websocket can't be upgraded through
      // the proxy, so it just spams "[vite] failed to connect to websocket". Disable
      // it by default and reload the page yourself after an edit. Running the server
      // directly (not proxied)? Use `HMR=on npm run dev` to get auto-reload back.
      hmr: process.env.HMR === 'on' ? undefined : false,
    },
  },
});
