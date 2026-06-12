/* Lili's Story World — service worker (offline + installable). */
const VERSION = 'lili-v4';
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const PAGE_CACHE = `${VERSION}-pages`;
const STORY_CACHE = `${VERSION}-stories`;

const scopeUrl = new URL(self.registration.scope);
const BASE_PATH = scopeUrl.pathname;
const SHELL_URLS = [
  '',
  'manifest.webmanifest',
  'favicon.svg',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
].map((rel) => new URL(rel, scopeUrl).toString());

function cacheKey(request) {
  return new Request(request.url, { method: 'GET' });
}

function isLocal(url) {
  return url.origin === self.location.origin && url.pathname.startsWith(BASE_PATH);
}

function relativePath(url) {
  return url.pathname.slice(BASE_PATH.length).replace(/^\/+/, '');
}

function isAssetPath(rel) {
  return rel.startsWith('art/') || rel.startsWith('audio/') || rel.startsWith('fonts/');
}

function isHtmlLike(request, rel) {
  return request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html') || rel === '' || rel.endsWith('.html');
}

function isCodeLike(request, rel) {
  return request.destination === 'script'
    || request.destination === 'style'
    || rel.endsWith('.js')
    || rel.endsWith('.css')
    || rel.startsWith('_astro/');
}

async function cachePut(cacheName, request, response) {
  if (!response || response.status !== 200) return;
  const cache = await caches.open(cacheName);
  await cache.put(cacheKey(request), response.clone());
}

async function fromAnyCache(request) {
  return caches.match(cacheKey(request));
}

async function staleWhileRevalidate(request, cacheName, fallbackRequest, event) {
  const cached = await fromAnyCache(request);
  const update = fetch(request)
    .then(async (response) => {
      await cachePut(cacheName, request, response);
      return response;
    });
  if (cached) {
    event?.waitUntil(update.catch(() => {}));
    return cached;
  }
  try {
    return await update;
  } catch {
    return fallbackRequest ? (await fromAnyCache(fallbackRequest)) || Response.error() : Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await fromAnyCache(request);
  if (cached) return cached;
  const response = await fetch(request);
  await cachePut(cacheName, request, response);
  return response;
}

async function rangeFromCache(request) {
  const cached = await fromAnyCache(request);
  if (!cached) {
    try { return await fetch(request); } catch { return Response.error(); }
  }
  const range = request.headers.get('range');
  if (!range) return cached;
  const match = /bytes=(\d+)-(\d*)/.exec(range);
  if (!match) return cached;
  const buffer = await cached.arrayBuffer();
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : buffer.byteLength - 1;
  const chunk = buffer.slice(start, end + 1);
  const headers = new Headers(cached.headers);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Length', String(chunk.byteLength));
  headers.set('Content-Range', `bytes ${start}-${end}/${buffer.byteLength}`);
  return new Response(chunk, { status: 206, statusText: 'Partial Content', headers });
}

async function cacheStoryUrls(urls) {
  const cache = await caches.open(STORY_CACHE);
  const unique = Array.from(new Set((urls || []).map((value) => new URL(value, scopeUrl).toString())));
  let stored = 0;
  for (const urlString of unique) {
    const url = new URL(urlString);
    if (!isLocal(url)) continue;
    const request = new Request(url.toString(), { method: 'GET', credentials: 'same-origin' });
    const response = await fetch(request);
    if (response.status !== 200) throw new Error(`Could not cache ${url.pathname}`);
    await cache.put(cacheKey(request), response.clone());
    stored++;
  }
  return stored;
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(SHELL_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_STORY') return;
  event.waitUntil((async () => {
    try {
      const count = await cacheStoryUrls(event.data.urls || []);
      event.ports[0]?.postMessage({ ok: true, count });
    } catch (error) {
      event.ports[0]?.postMessage({ ok: false, error: error?.message || 'Offline save failed.' });
    }
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!isLocal(url)) return;

  const rel = relativePath(url);

  if (request.headers.get('range') && rel.startsWith('audio/')) {
    event.respondWith(rangeFromCache(request));
    return;
  }

  if (isAssetPath(rel)) {
    event.respondWith(cacheFirst(request, rel.startsWith('audio/') ? STORY_CACHE : ASSET_CACHE).catch(async () => (await fromAnyCache(request)) || Response.error()));
    return;
  }

  if (isHtmlLike(request, rel)) {
    event.respondWith(staleWhileRevalidate(request, PAGE_CACHE, new Request(scopeUrl.toString()), event));
    return;
  }

  if (isCodeLike(request, rel)) {
    event.respondWith(staleWhileRevalidate(request, PAGE_CACHE, null, event));
    return;
  }
});
