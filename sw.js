/**
 * Maktabah Maftoohah Al-Quran - Service Worker (sw.js)
 * Enables offline caching and PWA installation.
 */

const CACHE_NAME = 'maktabah-quran-v15';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/app.js',
  './js/router.js',
  './js/store.js',
  './js/audio.js',
  './js/search.js',
  './js/jawi.js',
  './js/card-generator.js',
  './js/mushaf.js',
  './js/storage-db.js',
  './js/wake-lock.js',
  './js/backup.js',
  './js/search-worker.js',
  './js/i18n.js',
  './data/icon.svg',
  './assets/logo-mark.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/logo.svg',
  './data/surahs.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip audio files from external CDNs (they are large streams)
  if (url.hostname.includes('everyayah.com') || url.hostname.includes('audio.qurancdn.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback to cache if offline
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
