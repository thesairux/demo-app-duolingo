// Plantilla del service worker. Al compilar, vite.config.ts reemplaza __VERSION__ y __ARCHIVOS__.
const CACHE = 'numi-mates-__VERSION__';
const ARCHIVOS = __ARCHIVOS__;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const pedido = e.request;
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== location.origin) return;
  // Las páginas usan siempre la app guardada; el resto, lo guardado o internet.
  if (pedido.mode === 'navigate') {
    e.respondWith(caches.match('./').then((r) => r || fetch(pedido)));
    return;
  }
  e.respondWith(caches.match(pedido).then((r) => r || fetch(pedido)));
});
