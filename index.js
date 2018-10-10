const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const serviceAccount = require('./curriculm-web-firebase-admin.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const clss = require("./json/class.json");
const topics = require("./json/topics.json");
const subTopics = require("./json/subtopics.json");
const SubmitLesson = require("./classes/submitLesson.js");

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.all('/', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/get-tags', function(req, res){
  db.collection("tags").doc("tagsList").get().then(doc => {
    res.send(doc.data().list);
  });
});

app.post('/submit-lesson', function (req, res) {
  const submitLesson = new SubmitLesson(clss, topics, subTopics, req, res, db);
});

app.listen(3000, () => console.log('app listening on port 3000!'));
