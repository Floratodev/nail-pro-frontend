const CACHE_NAME = 'nail-pro-v20260321-3';
const urlsToCache = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // Nunca cachear: peticiones POST/PUT/PATCH/DELETE, ni llamadas a la API
  if (req.method !== 'GET') return;
  if (req.url.includes('/api/')) return;
  if (req.url.includes('onrender.com')) return;

  // Assets con hash: siempre red primero
  if (req.url.includes('/assets/')) {
    event.respondWith(fetch(req));
    return;
  }

  // Para el resto: red primero, caché como fallback offline
  event.respondWith(
    fetch(req)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        return response;
      })
      .catch(() => caches.match(req))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

