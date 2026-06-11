/* Lili's Story World — service worker (offline + installable).
   Pages: network-first (so updates show), fall back to cache, then start page.
   Assets (art/audio/css/js/fonts): cache-first (cached on first use → offline). */
const VERSION = 'lili-v3';
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
