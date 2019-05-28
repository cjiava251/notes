const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const port = 3000;
const path = require('path');
const html = path.join('/Users/lodoss/stagirovka/notes/');
//const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const db = new sqlite3.Database('/db/users_db.sqlite');
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS user (userName char(20), familyName char(20), name char(20), patronymic char(20), birthday date, email char(20), mobileNumber char(11), notesCount tinyint)');
  db.run('CREATE TABLE IF NOT EXISTS notes (noteName text, noteText text, user char(20), tags char(20), likes tinyint, tagsCount tinyint)');
});

/*
const main = fs.readFileSync('../html/main.html').toString();
const features = fs.readFileSync('../html/features.html').toString();
const news = fs.readFileSync('../html/news.html').toString();
const newUser = fs.readFileSync('../html/new_user.html').toString();
const myNotes = fs.readFileSync('../html/my_notes.html').toString();
const newNote = fs.readFileSync('../html/new_note.html').toString();
*/
app.render()
app.use('/css', express.static('/static'));
//pp.use('/htmls', express.static(html));
//app.get('/', (req, res) => res.sendFile(path.join(html,'html/main.html')));
app.listen(port, () => console.log('example app listening on port ' + port));

app.route('/new_user')
  .get((req, res) => res.send(newUser))
  .post(urlencodedParser, (req, res) => {
    if (req.body.userName && req.body.familyName && req.body.name && req.body.email) {
      db.run('INSERT INTO user VALUES (?,?,?,?,?,?,?,?)', req.body.userName, req.body.familyName, req.body.name, req.body.patronymic, req.body.birthday, req.body.email, req.body.mobileNumber, 0);
      res.send('Пользователь ' + req.body.userName + ' успешно зарегистрирован<br><a href="/">на главную</a>');
      db.close();
    }
    else res.redirect('back');
  });
app.get('/my_notes', (req, res) => res.send(myNotes));
app.get('/features', (req, res) => res.send(features));
app.get('/news', (req, res) => res.send(news));
app.route('/new_note')
  .get((req, res) => res.send(newNote))
  .post(urlencodedParser, (req, res) => {
    db.run('INSERT INTO notes (noteName,noteText) VALUES (?,?)', req.body.noteName, req.body.noteText);
    res.send('Ваша заметка #' + req.body.tagsCount + ': ' + req.body.noteName + ' успешно сохранена<br><a href="/my_notes">вернуться к моим заметкам</a>');
  });

