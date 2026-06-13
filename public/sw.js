/* Lili's Story World — service worker (offline + installable).
   Pages: network-first (so updates show), fall back to cache, then start page.
   Art images: stale-while-revalidate (instant from cache, but always refetched
     in the background → a re-uploaded image shows on the next visit, no version
     bump needed). This is what fixes "still seeing the old picture".
   Other assets (audio/css/js/fonts): cache-first (cached on first use → offline).
   Bump VERSION on any release to wipe the old cache immediately. */
const VERSION = 'lili-v4';
const CACHE = VERSION + '-cache';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // only our own files

  // Only full (200) responses can be stored. Range requests — used for audio —
  // come back as 206 Partial Content, which the Cache API refuses; caching is
  // also fire-and-forget so a put() rejection can never surface as an error.
  const cachePut = (request, response) => {
    if (!response || response.status !== 200) return;
    const copy = response.clone();
    caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
  };

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        cachePut(req, fresh);
        return fresh;
      } catch {
        return (await caches.match(req)) || (await caches.match(self.registration.scope)) || Response.error();
      }
    })());
    return;
  }

  // Art images: stale-while-revalidate. Return the cached copy immediately for
  // speed, but kick off a network fetch in the background to refresh the cache,
  // so a re-uploaded image (same filename) appears on the next load.
  if (url.pathname.startsWith('/art/')) {
    e.respondWith((async () => {
      const cached = await caches.match(req);
      const network = fetch(req).then((fresh) => { cachePut(req, fresh); return fresh; }).catch(() => null);
      return cached || (await network) || Response.error();
    })());
    return;
  }

  // Everything else (audio/css/js/fonts): cache-first.
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      cachePut(req, fresh);
      return fresh;
    } catch {
      return cached || Response.error();
    }
  })());
});
