// Peace & Conflict 24 — Service Worker v2 (cache-busting)
const CACHE_NAME = 'pc24-v2';

self.addEventListener('install', event => {
  self.skipWaiting(); // Force immediate activation
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k))) // Clear ALL old caches
    ).then(() => self.clients.claim())
  );
});

// Network-first: always fetch fresh content
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
