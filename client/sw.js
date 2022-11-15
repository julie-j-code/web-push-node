const BASE = location.protocol + "//" + location.host;
const PREFIX = "V3";
const CACHED_FILES = [
  `${BASE}/main.js`,`${BASE}/style.css`, `${BASE}/index.html`
];


self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PREFIX);
      await cache.addAll([...CACHED_FILES, "/offline.html"]);
    })()
  );
  console.log(`${PREFIX} Install`);
});

self.addEventListener("activate", () => {
  clients.claim()
  console.log(PREFIX)

})


self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: 'OK. Cela fonctionne ! ',
  });
});

self.addEventListener('fetch', event=>{
  // bonne pratique : 
  console.log(
    `${PREFIX} Fetching : ${event.request.url}, Mode : ${event.request.mode}`
  );
  
  if (event.request.mode === "navigate") {
  event.respondWith(
    (async () => {
      try {
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }

        return await fetch(event.request);
      } catch (e) {
        const cache = await caches.open(PREFIX);
        return await cache.match("/offline.html");
      }
    })()
  )
} else if (CACHED_FILES.includes(event.request.url)) {
  event.respondWith(caches.match(event.request))}

})

