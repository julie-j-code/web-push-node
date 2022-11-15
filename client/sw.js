// const BASE = location.protocol + "//" + location.host;
const PREFIX = "V3";
const CACHED_FILES = [
  `/main.js`,`/style.css`,
];


self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PREFIX);
      await cache.addAll(CACHED_FILES);
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
