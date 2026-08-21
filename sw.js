const CACHE_NAME = 'yr-cache-v2';
const ASSETS = [
  './',
  'index.html',
  'companies.html',
  'company.html',
  'banks.html',
  'bank.html',
  'entities.html',
  'entity.html',
  'jobs.html',
  'register.html',
  'admin.html',
  'owner.html',
  'css/main.css',
  'css/yemen-rating.css',
  'js/db.js',
  'js/sb-sync.js',
  'js/ads-loader.js'
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
