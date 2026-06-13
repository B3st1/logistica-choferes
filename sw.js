// Service worker mínimo: cachea el shell de la app para que abra rápido / offline.
// Los datos (Firestore) se siguen sincronizando por internet cuando hay conexión.

const CACHE_NAME = 'monarca-cache-v1';
const ASSETS = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first para que siempre tomen la última versión si hay internet;
  // si falla (sin conexión), usa lo cacheado.
  event.respondWith(
    fetch(event.request)
      .then(resp => {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});
