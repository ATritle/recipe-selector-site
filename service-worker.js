const CACHE_NAME = "recipe-app-v1";

const CORE_ASSETS = [
  "/recipe-selector-site/",
  "/recipe-selector-site/index.html",
  "/recipe-selector-site/css/style.css",
  "/recipe-selector-site/recipes.json",
  "/recipe-selector-site/apple-touch-icon.png",
  "/recipe-selector-site/favicon.png"
];

// Install: cache core files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// Activate: cleanup old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// Fetch: serve cache first, then network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      return fetch(event.request).then(networkResponse => {
        // Cache PDFs and pages when fetched
        if (
          event.request.url.endsWith(".pdf") ||
          event.request.url.includes("/recipe-selector-site/")
        ) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }

        return networkResponse;
      });
    })
  );
});
