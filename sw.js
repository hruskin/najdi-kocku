// Najdi kočku – service worker (offline podpora)
const VERSION = 'najdi-kocku-v25';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './scenes/mesto.js',
  './scenes/louka.js',
  './scenes/knihovna.js',
  './scenes/muzeum.js',
  './scenes/kavarna.js',
  './scenes/plaz.js',
  './scenes/hradcany.js',
  './fonts/patrick-hand-latin-400-normal.woff2',
  './fonts/patrick-hand-latin-ext-400-normal.woff2',
  './fonts/OFL.txt',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  // Stránka a skripty scén: nejdřív síť (nová stránka nesmí dostat staré scény), offline z cache.
  if (req.mode === 'navigate' || req.destination === 'script') {
    const key = req.mode === 'navigate' ? './index.html' : req;
    // skripty vždy ověřit u serveru (no-cache), jinak je prohlížeč může podat ze své HTTP cache ve staré verzi
    e.respondWith(
      (req.mode === 'navigate' ? fetch(req) : fetch(req, { cache: 'no-cache' }))
        .then(res => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(key, copy)); } return res; })
        .catch(() => caches.match(key))
    );
    return;
  }
  // Ostatní soubory (fonty, ikony): nejdřív cache.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
