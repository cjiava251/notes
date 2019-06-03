const express = require('express');
const app = express();
const passport=require('passport');
const localStrategy=require('passport-local').Strategy;
const sqlite3 = require('sqlite3').verbose();
const redis=require('redis');
const port = 3000;
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const db = new sqlite3.Database('./db/users_db.sqlite3');
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (userName char(20), password char(20), familyName char(20), name char(20), patronymic char(20), birthday date, email char(20), mobileNumber char(11), notesCount tinyint)');
  db.run('CREATE TABLE IF NOT EXISTS notes (noteName text, noteText text, user char(20), tags char(20), likes tinyint, tagsCount tinyint)');
});

let options={
  index: 'main.html',
  redirect: false
}
/*
passport.use(new localStrategy(
  (userName,password,done) => {
    findUser(userName,(err,user) => {
      if (err) return done(err);
      if (!user) return done(null,false);
      if (password!==user.password) return done(null,false);
      return done(null,user);
    });
  }
));
*/
app.use('/css', express.static('static'));
app.use('/', express.static('html',options));

app.listen(port, () => console.log('example app listening on port ' + port));

app.post('/new_user.html', urlencodedParser, (req, res) => {
    db.run('INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?)', req.body.userName, req.body.password, req.body.familyName, req.body.name, req.body.patronymic, req.body.birthday, req.body.email, req.body.mobileNumber, 0);
    res.send('Пользователь ' + req.body.userName + ' успешно зарегистрирован<br><a href="/">на главную</a>');
});

app.post('/new_note.html', urlencodedParser, (req, res) => {
    db.run('INSERT INTO notes (noteName,noteText,likes,tagsCount) VALUES (?,?,?,?)', req.body.noteName, req.body.noteText,0,0);
    res.send('Ваша заметка ' + req.body.noteName + ' успешно сохранена<br><a href="/my_notes.html">вернуться к моим заметкам</a>');
});

app.post('/login.html',urlencodedParser,(req,res) => {
  db.each('SELECT userName,password FROM users', (err,user) => {
    if (err) res.status(404).send('что то пошло не так...');
    else {
    if ((req.body.userName===user.userName) && (req.body.password===user.password))
      res.send('Welcome, '+user.userName+'<br><a href="/">на главную</a>');
    else 
      res.send('Такого пользователя не существует. <div><a href="/login.html">назад</a></div><div><a href="/">на главную</a></div>');
    }
  });
});
/*
app.get('/new_page', (req,res) => {
  let data=[];
  db.all('SELECT * FROM notes', function(err,notes) {
    if (err) throw err;
    else {
      data=notes;
      res.send('Заметка '+data[0].noteName+': <br>'+data[0].noteText);
    }
  });
});
*/
