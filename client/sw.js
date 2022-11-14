self.addEventListener('install', (event) => {
  self.skipWaiting();
});


self.addEventListener('push', event => {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: 'OK. Cela fonctionne ! ',
  });
});
