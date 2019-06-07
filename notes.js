const express = require('express');
const app = express();
const pug = require('pug');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const config = {};
config.redisStore = {
  url: process.env.REDIS_STORE_URI,
  secret: process.env.REDIS_STORE_SECRET
}
function like(like) {
  if (like === null) return 0;
  return like;
}
app.set('views', './pages');
app.set('view engine', 'pug');
app.use('/css', express.static('static'));
app.use('/', express.static('pages'));
app.use(session({
  store: new RedisStore({ url: config.redisStore.url }),
  secret: config.redisStore.secret,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  (username, password, done) => {
    findUser(username, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false);
      knex.select('password').from('users').then((array) => { if (!(array.indexOf(password) in array)) return done(null, false) });
    });
  }
));

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
        table.increments('id');
        table.string('noteName', 40);
        table.text('noteText');
        table.string('user', 20);
        table.enu('tags', []);
        table.integer('likes', 10);
        table.integer('tagsCount', 10);
      });
  });
app.get('/', (req, res) => res.render('main', { main: "main", title: "Главная", style: "css/stylesheet.css" }));
app.get('/login', (req, res) => res.render('login', { login: "login", title: "Вход", style: "css/stylesheet.css" }));
app.get('/features', (req, res) => res.render('features', { features: "features", title: "Особенности", style: "css/stylesheet.css" }));
app.get('/news', (req, res) => res.render('news', { news: "news", title: "Новости", style: "css/stylesheet.css" }));
app.get('/new_note', (req, res) => res.render('new_note', { newNote: "newNote", title: "Новая заметка", style: "css/stylesheet.css" }));
app.get('/my_notes', (req, res) => {
  knex.select('noteName', 'id').from('notes').then(notes => {
    res.render('my_notes', { myNotes: "myNotes", title: "Мои заметки", item: notes, length: notes.length, style: "css/stylesheet.css" });
  });
});
app.get('/new_user', (req, res) => res.render('new_user', { newUser: "newUser", title: "Новый пользователь", bool: "true", style: "css/stylesheet.css" }));
app.get('/authentication', (req, res) => res.render('authentication', { login: "login", title: "Вход", style: "css/stylesheet.css" }));
app.get('/my_notes/:id', (req, res) => {
  knex.select('noteName', 'noteText', 'id', 'likes').from('notes').where('id', req.params.id).then(note => {
    res.render('note', { title: "Заметка №" + note[0].id, num: note[0].id, noteName: note[0].noteName, noteText: note[0].noteText, style: "../css/stylesheet.css", likes: like(note[0].likes), bool : "true" });
  });
});

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
    res.render('new_user', { newUser: "newUser", title: "Новый пользователь" })
});

app.post('/new_note', urlencodedParser, (req, res) => {
  const rB = req.body;
  knex('notes').insert({
    noteName: rB.noteName,
    noteText: rB.noteText,
  }).then(result => res.send(`Ваша заметка ${req.body.noteName} успешно сохранена<br><a href="/my_notes">вернуться к моим заметкам</a>`));
});

app.post('/authentication', urlencodedParser, (req, res) => {
  res.render('sdsds');
});

app.post('/my_notes/:id', urlencodedParser, (req, res) => {
  const rB = req.body;
  if (rB.like) {
    knex('notes').where({ id: req.params.id }).increment({ likes: 1 }).then(likes => {
      console.log(likes);
      knex.select('noteName', 'noteText', 'id', 'likes').from('notes').where('id', req.params.id).then(note => {
        res.render('note', { title: "Заметка №" + note[0].id, num: note[0].id, noteName: note[0].noteName, noteText: note[0].noteText, style: "../css/stylesheet.css", likes: like(likes), bool : "true" });
      });
    });
  }
  else {
    res.send('2');
  }
});

app.listen(3000);
