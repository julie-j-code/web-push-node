const PREFIX = "V1";

self.addEventListener('install', () => {
  self.skipWaiting();
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
