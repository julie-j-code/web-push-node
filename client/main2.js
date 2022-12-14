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
const appServerKeyToStock = urlBase64ToUint8Array(publicVapidKey)
console.log(appServerKeyToStock);

const triggerPush = document.querySelector('.trigger-push');

const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission()
  console.log("permission", permission);

  const sw = await navigator.serviceWorker.ready
  if (permission == 'granted') {
    console.log(sw);
    let subscription = await sw.pushManager.getSubscription();

    if (!subscription) {

      subscription = await sw.pushManager.subscribe(
        {
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        }
      )

      console.log('acceptance complete, on enregistre', subscription);
      // ici, on devrait pouvoir enregistrer subscription, ici dans localStorage, plus tard dans sqlite...
      localStorage.setItem('subscriptionStockagePWA',
        JSON.stringify(subscription)
      )

      await fetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
        }
      });

    }


    else if (subscription) {
      // si subscription existante 
      triggerPush.textContent = "Vous êtes déjà abonné "
      console.log("L'utilisateur est déjà abonné");
      // on doit sûrement ici pouvoir faire une distinction, selon qu'on se trouve online ou offline
      // 1 - offline
      if (!window.navigator.onLine) {
        // alert("vous êtes déconnecté")
        triggerPush.textContent = "Vous êtes déjà abonné, mais actuellement hors ligne "
        let offlineSubscription = JSON.parse(localStorage.getItem("subscriptionStockagePWA"))
        console.log("offlineSubscription", offlineSubscription)
        // await fetch('/subscribe', {
        //   method: 'POST',
        //   body: JSON.stringify(offlineSubscription),
        //   headers: {
        //     'Content-Type': 'application/json',
        //   }
        // })
      }
      // si - online, on change rien
      // else {
        await fetch('/subscribe', {
          method: 'POST',
          body: JSON.stringify(subscription),
          headers: {
            'Content-Type': 'application/json',
          }
        });

      }

    // }

  }

}

triggerPush.addEventListener('click', () => {
  requestNotificationPermission().catch(error => console.error(error));
});


// On va tenter de déléguer à ce fichier la tâche de servir ou non du contenu, en fonction de l'état de la connexion
window.addEventListener("online", load());
function load() {

  let result = "";
  fetch("http://localhost:5000/blogs")
    .then((res) => res.json())
    .then((data) => {
      // Je récupère la data pour l'injecter dans .container
      (Object.values(data)).forEach((table) => {
        table.forEach(row => {
          result += `
         <div class="card">
              <img class="card-avatar" src="${row.avatar}"/>
              <h1 class="card-title">${row.title}</h1>
              <p class="intro">${row.intro}</p>
              <a class="card-link" href="#">Read</a>
          </div>
         `;
        })

        // Je profite d'avoir du jus et accès à data pour faire une sauvegarde dans localStorage
        localStorage.setItem('blogStockagePWA', JSON.stringify(table))

      });

      document.querySelector(".container").innerHTML = result;
    })
    .catch((e) => {
      console.log(e);
    });
}

// pour le cas du offline
window.addEventListener("offline", renderOffline());

function renderOffline() {
  console.log("Vous êtes actuellement Hors Ligne");
  let resultOffline = ""
  let dataOffline = JSON.parse(localStorage.getItem('blogStockagePWA')) || [];
  console.log(dataOffline);
  // on peut maintenant boucler sur resultOffline presque à l'identique du result online
  dataOffline.forEach((row) => {
    resultOffline += ` <div class="card">
  <img class="card-avatar" src="${row.avatar}"/>
  <h1 class="card-title">${row.title}</h1>
  <p class="intro">${row.intro}</p>
  <a class="card-link" href="#">Read</a>
</div>  `

  })

  document.querySelector(".container").innerHTML = resultOffline;

}

// pour la création d'un cache dédié dans localStorage (pourquoi )
// window.addEventListener("load", localStorage.setItem('blogs', []))

