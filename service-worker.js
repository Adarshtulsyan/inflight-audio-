self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("silent-flight").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/app.js",
        "/audio.mp3"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
