require('dotenv').config({ path: 'variables.env' });

const express = require('express');
const webPush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3');

const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client')));

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webPush.setVapidDetails('mailto:jeannet.julie@gmail.com', publicVapidKey, privateVapidKey);

// Subscribe route
app.post('/subscribe', (req, res) => {
  console.log(req.body);
  const subscription = req.body

  res.status(201).json({});

  // create payload
  const payload = JSON.stringify({
    title: 'Push notifications avec Service Workers',
  });

  webPush.sendNotification(subscription, payload)
    .catch(error => console.error(error));
});



// --------------

// Gestion db
const db = new sqlite3.Database("db.sqlite", (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
  }
});

//  liste de blogs que nous allons stocker dans la base de données pour l'exemple et rendre plus tard côté client avec l'extrait de code ci-dessous :
let blogs = [
  {
    id: "1",
    title: "How To Build A RESTAPI With Javascript",
    avatar: "img/node.png",
    intro: "iste odio beatae voluptas dolor praesentium illo facere optio nobis magni, aspernatur quas."
  },
  {
    id: "2",
    title: "How to Build an Offline-First Application with Node.js",
    avatar: "img/node.png",
    intro: "iste odio beatae voluptas dolor praesentium illo facere optio nobis magni, aspernatur quas."
  },
  {
    id: "3",
    title: "Building a Trello Clone with React DnD",
    avatar: "img/node.png",
    intro: "iste odio beatae voluptas dolor praesentium illo facere optio nobis magni, aspernatur quas."
  },
];

// La méthode db.run prend une requête SQL comme paramètre, puis nous parcourons notre tableau de blogs et les insérons dans la table des blogs que nous venons de créer à l'aide de la fonction js map.

db.run(
  `CREATE TABLE blog (id INTEGER PRIMARY KEY AUTOINCREMENT, title text,avatar text,intro text)`,
  (err) => {
    if (err) {
      // console.log(err)
      // Table already created
    } else {
      // Table just created, creating some rows
      var insert = "INSERT INTO blogs (title, avatar, intro) VALUES (?,?,?)";
      blogs.map((blog) => {
        db.run(insert, [
          `${blog.title}`,
          `${blog.avatar}`,
          `${blog.intro}`,
        ]);
      });
      console.log("Insertion OK.");
    }
  }
);



// nous enverrons une requête get au point de terminaison du blog pour obtenir les blogs de notre backend
app.get("/blogs", (req, res) => {
  res.status(200).json({
    blogs,
  });
});




// ----------------

app.set('port', process.env.PORT || 5000);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
