// Force complete cache clear and unregister
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ includeUncontrolled: true }))
      .then(clients => clients.forEach(c => c.navigate(c.url)))
  );
});
self.addEventListener('fetch', (e) => {
  // Pass everything through - no caching
  e.respondWith(fetch(e.request));
});
