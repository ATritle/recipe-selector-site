const CACHE_NAME = "recipe-app-v2";

const BASE = self.location.pathname.replace("service-worker.js", "");

const CORE_ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "css/style.css",
  BASE + "recipes.json",
  BASE + "apple-touch-icon.png",
  BASE + "favicon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

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

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      return fetch(event.request).then(networkResponse => {
        if (
          event.request.url.endsWith(".pdf") ||
          event.request.url.startsWith(self.location.origin + BASE)
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
