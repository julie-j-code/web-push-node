const BASE = location.protocol + "//" + location.host;
const PREFIX = "V4";
const CACHED_FILES = [
  `${BASE}/main2.js`,`${BASE}/style.css`, `${BASE}/index.html`, `${BASE}/img/node.png`
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

// self.addEventListener("install", (installEvt) => {
//   installEvt.waitUntil(
//     caches
//       .open(PREFIX)
//       .then((cache) => {
//         cache.addAll(CACHED_FILES);
//       })
//       .then(self.skipWaiting())
//       .catch((e) => {
//         console.log(e);
//       })
//   );
// });



//  la méthode waitUntil sur le service worker attend la fin de l'action, puis vérifie si les actifs que nous essayons d'effacer sont les actifs de notre application actuelle avant de les supprimer.

self.addEventListener("activate", (event) => {
  clients.claim();
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (!key.includes(PREFIX)) {
            return caches.delete(key);
          }
        })
      );
    })()
  );
  console.log(`${PREFIX} Active`);
});



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

// event.respondWith(
//   fetch(event.request).catch(() => {
//     return caches.open(PREFIX).then((cache) => {
//       return cache.match(event.request);
//     });
//   })
// );

})

