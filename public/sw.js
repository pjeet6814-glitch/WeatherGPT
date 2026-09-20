/* WeatherGPT Service Worker (PWA Offline Resilience) */
const CACHE_NAME = "weathergpt-v1";
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./assistant.html",
  "./forecast.html",
  "./alerts.html",
  "./climate.html",
  "./safety.html",
  "./about.html",
  "./assets/style.css",
  "./assets/app.js",
  "./assets/i18n.js",
  "./manifest.json"
];

// Install: cache App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("WeatherGPT SW: Precache partial warning", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: runtime caching
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== "GET") return;

  // Weather & Alerts API requests: Network first, cache fallback
  if (url.pathname.includes("/api/weather") || url.pathname.includes("/api/alerts") || url.pathname.includes("/api/climate")) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(req).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return new Response(
              JSON.stringify({ offline: true, detail: "You are currently offline. Please reconnect to get live updates." }),
              { headers: { "Content-Type": "application/json" }, status: 200 }
            );
          });
        })
    );
    return;
  }

  // HTML page navigations: Network first, fallback to cached HTML
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(req).then((cachedResponse) => {
            return cachedResponse || caches.match("./index.html");
          });
        })
    );
    return;
  }

  // Static Assets (CSS, JS, Fonts, Images): Cache first with network fallback
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch update in background (stale-while-revalidate)
        fetch(req).then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(req).then((networkResponse) => {
        if (networkResponse.ok && (url.origin === location.origin || url.hostname.includes("fonts.g"))) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return networkResponse;
      });
    })
  );
});
