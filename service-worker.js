const CACHE_NAME = "tritle-kitchen-v" + Date.now();

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./meal-planner.html",
  "./css/style.css",
  "./apple-touch-icon.png",
  "./favicon.png"
];

// INSTALL
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
    ])
  );
});

// ===============================
// SAFE FETCH (Network First)
// ===============================

self.addEventListener("fetch", event => {

  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {

        // Optionally cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );

});
