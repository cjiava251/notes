const express = require('express');
const app = express();
const pug = require('pug');
app.set('views', './pages');
app.set('view engine', 'pug');
const port = 3000;
const urlencodedParser = require('body-parser').urlencoded({ extended: false });
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './db/users_db.sqlite3'
  },
  useNullAsDefault: true
});

knex.schema.hasTable('users')
  .then((exists) => {
    if (!exists)
      return knex.schema.createTable('users', (table) => {
        table.string('userName', 20);
        table.string('password', 20);
        table.string('familyName', 20);
        table.string('name', 20);
        table.string('patronymic', 20);
        table.date('birthday');
        table.string('email', 20);
        table.string('mobileNumber', 12);
        table.integer('notesCount', 10);
      });
  });

knex.schema.hasTable('notes')
  .then((exists) => {
    if (!exists)
      return knex.schema.createTable('notes', (table) => {
        table.string('noteName', 40);
        table.text('noteText');
        table.string('user', 20);
        table.enu('tags', []);
        table.integer('likes', 10);
        table.integer('tagsCount', 10);
      });
  });

app.use('/css', express.static('static'));
app.use('/', express.static('pages'));
app.get('/', (req, res) => res.render('main', { main: "main", title: "Главная" }));
app.get('/login', (req, res) => res.render('login', { login: "login", title: "Вход" }));
app.get('/features', (req, res) => res.render('features', { features: "features", title: "Особенности" }));
app.get('/news', (req, res) => res.render('news', { news: "news", title: "Новости" }));
app.get('/new_note', (req, res) => res.render('new_note', { newNote: "newNote", title: "Новая заметка" }));
app.get('/my_notes', (req, res) => res.render('my_notes', { myNotes: "myNotes", title: "Мои заметки" }));
app.get('/new_user', (req, res) => res.render('new_user', { newUser: "newUser", title: "Новый пользователь", bool: "true"}));

app.post('/new_user', urlencodedParser, (req, res) => {
  const rB = req.body;
  if (rB.password === rB.confirmPassword)
    knex('users').insert({
      userName: rB.userName,
      password: rB.password,
      familyName: rB.familyName,
      name: rB.name,
      patronymic: rB.patronymic,
      birthday: rB.birthday,
      email: rB.email,
      mobileNumber: rB.mobileNumber
    }).then(result => res.send(`Пользователь ${rB.userName} успешно зарегистрирован<br><a href="/">на главную</a>`));
  else
    res.render('new_user', {newUser: "newUser", title: "Новый пользователь"})
});

app.post('/new_note', urlencodedParser, (req, res) => {
  const rB = req.body;
  knex('notes').insert({
    noteName: rB.noteName,
    noteText: rB.noteText
  }).then((result) => res.send(`Ваша заметка ${req.body.noteName} успешно сохранена<br><a href="/my_notes">вернуться к моим заметкам</a>`));
});

app.post('/login', urlencodedParser, (req, res) => {
  /*
  db.each('SELECT userName,password FROM users', (err, user) => {
    if (err) res.status(404).send('что то пошло не так...');
    else if ((req.body.userName === user.userName) && (req.body.password === user.password)) res.send(`Welcome, ${user.userName}<br><a href="/">на главную</a>`);
    else { res.send('Такого пользователя не существует. <div><a href="/login">назад</a></div><div><a href="/">на главную</a></div>'); }
  });
  */
});

app.get('/new_page', (req, res) => {
  knex.select().table('notes').then((result) => res.send(result[0].noteName))
});

app.listen(port);
