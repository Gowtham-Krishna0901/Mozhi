/* =========================================================
   MOZHI — Service worker
   Caches the app shell so pages still load with no
   connection. Deliberately does NOT touch Supabase traffic
   (auth, database, realtime) — that's handled separately by
   js/offline.js's message queue, not by this cache.

   Strategy: stale-while-revalidate for same-origin assets —
   serve instantly from cache if we have it, and refresh the
   cache in the background whenever the network is available,
   so the app stays fast AND stays reasonably up to date.
   ========================================================= */

const CACHE_NAME = "mozhi-cache-v1";

// Paths are relative (no leading slash) so this also works
// correctly if the app is hosted in a subfolder (e.g. GitHub
// Pages project sites like username.github.io/mozhi/).
const PRECACHE_URLS = [
  "./",
  "index.html",
  "patient-dashboard.html",
  "communicate.html",
  "category.html",
  "family-dashboard.html",
  "category-management.html",
  "css/style.css",
  "js/darkmode.js",
  "js/supabase-client.js",
  "js/offline.js",
  "js/auth.js",
  "js/patient.js",
  "js/communicate.js",
  "js/family.js",
  "js/category-management.js",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            // Don't let one failed resource (e.g. a CDN hiccup)
            // block the whole app shell from being cached.
            console.warn("Mozhi SW: failed to precache", url, err);
          })
        )
      )
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch (err) {
    return;
  }

  // Never intercept Supabase traffic (REST, auth, realtime
  // websockets) — that must always go straight to the network.
  // Offline handling for that is js/offline.js's job, not this
  // cache's job.
  if (url.hostname.endsWith("supabase.co")) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => cached);

      // Serve cache instantly if we have it (and refresh it in
      // the background); otherwise wait on the network.
      return cached || networkFetch;
    })
  );
});
