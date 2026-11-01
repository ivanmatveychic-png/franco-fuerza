/* Service worker de Fitness — cachea la app para que abra sin conexión.
   Subí la versión (CACHE) cada vez que cambie el HTML para forzar actualización. */
const CACHE = 'franco-rutina3d-v1';
const ASSETS = [
  'index.html',
  'manifest.json',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // las fuentes de Google se toman de la red y se cachean al pasar
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        // cachear respuestas propias (mismo origen) para offline
        try {
          const url = new URL(req.url);
          if (url.origin === self.location.origin) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
        } catch (_) {}
        return res;
      }).catch(() => caches.match('index.html'));
    })
  );
});
