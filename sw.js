const CACHE_NAME = 'arbitres-hb-v0.3.5';
const FILES = [
  './',
  './index.html',
  './styles.css',
  './logo.png',
  './manifest.json',
  './theme-init.js',
  './js/main.js',
  './js/state.js',
  './js/observations.js',
  './js/timer.js',
  './js/score.js',
  './js/synthesis.js',
  './js/pdf.js',
  './js/ui.js',
  './js/match.js',
  './js/storage.js',
  './js/logger.js',
  './js/utils.js',
  './js/version.js'
];

/* CDN jsPDF — pré-cachés séparément (ne bloquent pas l'install si offline) */
const CDN_FILES = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(FILES))
      .then(() => {
        /* Tenter de pré-cacher les CDN (non bloquant si offline) */
        return caches.open(CACHE_NAME).then(c =>
          Promise.allSettled(CDN_FILES.map(url =>
            fetch(url).then(r => { if (r.ok) c.put(url, r); })
          ))
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Réseau d'abord pour les fichiers de l'app, fallback sur le cache
  if (e.request.url.includes('cdnjs.cloudflare.com')) {
    // CDN : cache d'abord
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return resp;
      }))
    );
  } else {
    // App files : réseau d'abord
    e.respondWith(
      fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return resp;
      }).catch(() => caches.match(e.request))
    );
  }
});
