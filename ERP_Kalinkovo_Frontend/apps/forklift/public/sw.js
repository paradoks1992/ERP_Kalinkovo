/* простейший PWA SW: cache-first для статики + фон.синк "send-queue" */
const CACHE = 'kalinkovo-forklift-v1';
const ASSETS = [
  '/', '/index.html', '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Только GET кэшируем
  if (req.method === 'GET' && new URL(req.url).origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((res) => res || fetch(req).then((net) => {
        // кэшируем статику
        const copy = net.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return net;
      }))
    );
  }
});

// Фоновая отправка очереди
self.addEventListener('sync', (e) => {
  if (e.tag === 'send-queue') {
    e.waitUntil(self.clients.matchAll().then((clients) => {
      for (const client of clients) client.postMessage({ type: 'SYNC_QUEUE' });
    }));
  }
});
