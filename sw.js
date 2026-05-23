// Peace & Conflict 24 — Service Worker v4 (force refresh)
const CACHE_NAME = 'pc24-v4';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Always network first, no caching
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request, {cache: 'no-store'}).catch(() => caches.match(event.request))
  );
});
