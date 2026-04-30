/**
 * Service worker — offline shell + stale-while-revalidate runtime cache.
 *
 * Lives at site root so it can claim scope '/' and intercept every request.
 * Bump CACHE_VERSION whenever the precache manifest changes; old caches are
 * deleted in `activate`.
 */

const CACHE_VERSION = 'gymbros-v1';

/** App shell — the minimum bytes required to boot offline. */
const SHELL = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/manifest.json',
  '/icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(handleRequest(req));
});

/** Cache-first with background refresh. Falls back to shell when offline + uncached. */
async function handleRequest(req) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(req);
  if (cached) {
    refreshInBackground(cache, req);
    return cached;
  }
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return offlineFallback(cache, req);
  }
}

function refreshInBackground(cache, req) {
  fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); }).catch(() => {});
}

function offlineFallback(cache, req) {
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    return cache.match('/index.html');
  }
  return new Response('', { status: 504, statusText: 'offline' });
}
