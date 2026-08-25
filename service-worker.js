const CACHE_NAME = "wattwise-cache-v3";

const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./pouch-ui.css",
  "./scripts.js",
  "./manifest.json",
  "./assets/simplewattlogo.png",
  "./assets/pwa/icon-192.png",
  "./assets/pwa/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(APP_FILES);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function (cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request);
      })
  );
});
