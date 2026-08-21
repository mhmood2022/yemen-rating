const CACHE_NAME = 'yr-cache-v1';
const ASSETS = [
  './',
  'index.html',
  'companies.html',
  'banks.html',
  'jobs.html',
  'register.html',
  'admin.html',
  'css/main.css',
  'css/yemen-rating.css',
  'js/db.js',
  'js/sb-sync.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
