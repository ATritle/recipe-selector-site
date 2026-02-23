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

// FETCH
self.addEventListener("fetch", event => {

  const request = event.request;

  // 🔥 Network-first for HTML & JSON
  if (
    request.destination === "document" ||
    request.url.endsWith(".json")
  ) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 🔥 Cache-first for everything else (images, css, etc.)
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).then(networkResponse => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return networkResponse;
      });
    })
  );
});
