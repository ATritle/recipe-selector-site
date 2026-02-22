const CACHE_NAME = "recipe-app-v3";

const BASE = self.location.pathname.replace("service-worker.js", "");

const CORE_ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "css/style.css",
  BASE + "meal-planner.html",
  BASE + "drinks.json",
  BASE + "dinner.json",
  BASE + "desserts.json",
  BASE + "breakfast.json",
  BASE + "miscellaneous.json",
  BASE + "apple-touch-icon.png",
  BASE + "favicon.png"
];

self.addEventListener("install", event => {
  self.skipWaiting(); // 🔥 Immediately activate new SW

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // 🔥 Take control immediately
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

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
