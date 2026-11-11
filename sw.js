// Helm shell v9. Cache name is derived from SW_VERSION so a new worker
// version is a new cache; activate deletes every older cache. The
// client (index.html) reloads an already-open page ONCE, guarded by a
// sessionStorage flag, when a new worker takes control (controllerchange).
// An old shell therefore survives only as an already-open page, never as
// a silent fresh load.
const SW_VERSION = 'v10';
const CACHE = 'helm-shell-' + SW_VERSION;
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png', './icons/icon.svg'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Snapshot JSON is never cached by the service worker: the app fetches it
  // with cache:'no-store' and keeps its own last-good copy in localStorage.
  if (e.request.url.endsWith('.json')) return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match('./index.html'))));
});
