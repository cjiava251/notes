const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const port = 3000;
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const db = new sqlite3.Database('./db/users_db.sqlite3');
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (userName char(20), familyName char(20), name char(20), patronymic char(20), birthday date, email char(20), mobileNumber char(11), notesCount tinyint)');
  db.run('CREATE TABLE IF NOT EXISTS notes (noteName text, noteText text, user char(20), tags char(20), likes tinyint, tagsCount tinyint)');
});

let options={
  index: 'main.html',
  redirect: false
}

app.use('/css', express.static('static'));
app.use('/', express.static('html',options));

app.listen(port, () => console.log('example app listening on port ' + port));

app.post('/new_user.html', urlencodedParser, (req, res) => {
  if (req.body.userName && req.body.familyName && req.body.name && req.body.email) {
    db.run('INSERT INTO users VALUES (?,?,?,?,?,?,?,?)', req.body.userName, req.body.familyName, req.body.name, req.body.patronymic, req.body.birthday, req.body.email, req.body.mobileNumber, 0);
    res.send('Пользователь ' + req.body.userName + ' успешно зарегистрирован<br><a href="/">на главную</a>');
  }
  else res.redirect('back');
});

app.post('/new_note.html', urlencodedParser, (req, res) => {
  if (req.body.noteName && req.body.noteText) {
    db.run('INSERT INTO notes (noteName,noteText) VALUES (?,?)', req.body.noteName, req.body.noteText);
    res.send('Ваша заметка ' + req.body.noteName + ' успешно сохранена<br><a href="/my_notes.html">вернуться к моим заметкам</a>');
  }
  else
    res.redirect('/new_note.html');
});

