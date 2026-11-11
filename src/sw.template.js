/* Sketchbook Coach service worker. Generated at build time: see vite.config.ts. */
const VERSION = '__VERSION__';
const PRECACHE = '__PRECACHE__';
const PREFIX = 'sketchbook-coach-';
const CACHE = PREFIX + VERSION;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const shell = new URL('./index.html', self.registration.scope).href;
      if (request.mode === 'navigate') {
        return (await cache.match(shell, { ignoreVary: true })) ?? fetch(request);
      }
      // Static files: the same bytes whatever the request headers, so ignore Vary.
      const hit = await cache.match(request, { ignoreSearch: true, ignoreVary: true });
      if (hit) return hit;
      try {
        return await fetch(request);
      } catch {
        return Response.error();
      }
    })(),
  );
});
