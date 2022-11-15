// Boilerplate borrowed from https://www.npmjs.com/package/web-push#using-vapid-key-for-applicationserverkey
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}



const publicVapidKey = 'BAMxFPdXCiBKTnxPBb08qqoBjKvLYwUILZWjQ_GNHBZLox4JBZHiOFeJzLEzlPm8ue4KAyV3G69-WJm4TdRp880';

const triggerPush = document.querySelector('.trigger-push');

async function triggerPushNotification() {
  // if ('serviceWorker' in navigator) {
  //   const register = await navigator.serviceWorker.register('/sw.js');


  console.log(navigator.serviceWorker.ready)

  const sw = await navigator.serviceWorker.ready

  console.log('waiting for acceptance');
  const subscription = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
  });
  console.log('acceptance complete');

  await fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-Type': 'application/json',
    },
  });

}


triggerPush.addEventListener('click', () => {
  triggerPushNotification().catch(error => console.error(error));
});