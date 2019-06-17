const express = require('express');

const app = express();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const config = {};
config.redisStore = {
  url: process.env.REDIS_STORE_URI,
  secret: process.env.REDIS_STORE_SECRET,
};

const user = {
  userName: 'user123',
  password: 'pass1',
  notesCount: 0,
};

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './db/users_db.sqlite3',
  },
  useNullAsDefault: true,
});

function renderPage(req, res, hidden = 'true', hiddenDel = 'true') {
  knex('notes').select('*').where('id', req.params.id).then(note => knex('tags').select('*').where('noteId', req.params.id).then((tag) => {
    res.render('note', {
      title: `Заметка №${note[0].id}`, note: note[0], style: '../css/stylesheet.css', bool: hidden, bool2: hiddenDel, tags: tag, likes: note[0].likes,
    });
  }));
}

app.set('views', './pages');
app.set('view engine', 'pug');
app.use('/css', express.static('static'));
app.use('/', express.static('pages'));
app.use(session({
  store: new RedisStore({ url: config.redisStore.url }),
  secret: config.redisStore.secret,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  (username, password, done) => {
    findUser(username, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false);
      knex.select('password').from('users').then((array) => { if (!(array.indexOf(password) in array)) return done(null, false); });
    });
  },
));

const urlencodedParser = require('body-parser').urlencoded({ extended: false });


knex.schema.hasTable('users')
  .then((exists) => {
    if (!exists) {
      return knex.schema.createTable('users', (table) => {
        table.string('userName');
        table.string('password');
        table.string('familyName');
        table.string('name');
        table.string('patronymic');
        table.date('birthday');
        table.string('email');
        table.string('mobileNumber');
        table.integer('notesCount');
      });
    }
  });
knex.schema.hasTable('notes')
  .then((exists) => {
    if (!exists) {
      return knex.schema.createTable('notes', (table) => {
        table.increments('id');
        table.string('noteName');
        table.text('noteText');
        table.string('user');
        table.integer('likes');
        table.integer('tagsCount');
      });
    }
  });

knex.schema.hasTable('tags')
  .then((exists) => {
    if (!exists) {
      return knex.schema.createTable('tags', (table) => {
        table.string('tagText');
        table.string('noteName');
        table.integer('noteId');
        table.string('user');
      });
    }
  });
knex.schema.hasTable('likes')
  .then((exists) => {
    if (!exists) {
      return knex.schema.createTable('likes', (table) => {
        table.integer('noteId');
        table.integer('count');
        table.string('user');
        table.boolean('liked');
      });
    }
  });
app.get('/', (req, res) => res.render('main', { main: 'main', title: 'Главная', style: 'css/stylesheet.css' }));
app.get('/login', (req, res) => res.render('login', { login: 'login', title: 'Вход', style: 'css/stylesheet.css' }));
app.get('/features', (req, res) => res.render('features', { features: 'features', title: 'Особенности', style: 'css/stylesheet.css' }));
app.get('/news', (req, res) => res.render('news', { news: 'news', title: 'Новости', style: 'css/stylesheet.css' }));
app.get('/new_note', (req, res) => res.render('new_note', { newNote: 'newNote', title: 'Новая заметка', style: 'css/stylesheet.css' }));
app.get('/my_notes', (req, res) => knex.select('noteName', 'id').from('notes').then((notes) => {
  res.render('my_notes', {
    myNotes: 'myNotes', title: 'Мои заметки', notes, style: 'css/stylesheet.css',
  });
}));
app.get('/new_user', (req, res) => res.render('new_user', {
  newUser: 'newUser', title: 'Новый пользователь', bool: 'true', style: 'css/stylesheet.css',
}));
app.get('/authentication', (req, res) => res.render('authentication', { login: 'login', title: 'Вход', style: 'css/stylesheet.css' }));
app.get('/my_notes/:id', (req, res) => renderPage(req, res, true, true));

app.post('/new_user', urlencodedParser, (req, res) => {
  const rB = req.body;
  if (rB.password === rB.confirmPassword) {
    knex('users').insert({
      userName: rB.userName,
      password: rB.password,
      familyName: rB.familyName,
      name: rB.name,
      patronymic: rB.patronymic,
      birthday: rB.birthday,
      email: rB.email,
      mobileNumber: rB.mobileNumber,
    }).then(() => res.send(`Пользователь ${rB.userName} успешно зарегистрирован<br><a href="/">на главную</a>`));
  } else res.render('new_user', { newUser: 'newUser', title: 'Новый пользователь' });
});

app.post('/new_note', urlencodedParser, (req, res) => {
  const rB = req.body;
  knex('notes').insert({
    noteName: rB.noteName,
    noteText: rB.noteText,
    likes: 0,
    user: user.userName,
    tagsCount: 0,
  }).then(() => res.send(`Ваша заметка ${rB.noteName} успешно сохранена<br><a href="/my_notes">вернуться к моим заметкам</a>`));
});

app.post('/authentication', urlencodedParser, (req, res) => {
  res.render('sdsds');
});

app.post('/my_notes/:id', urlencodedParser, (req, res) => {
  const rB = req.body;
  const rP = req.params;
  if (rB.like) {
    knex('likes').select('user').where({ noteId: rP.id }).then((users) => {
      if (users.every(usr => usr.user !== user.userName)) {
        knex('likes').insert({ noteId: rP.id, user: user.userName, liked: true });
        knex('notes').increment('likes', 1).where({ user: user.userName });
        renderPage(req, res, true, true);
      }
    });
  } else if (rB.tag) renderPage(req, res, false, true);
  else if (rB.cancel) renderPage(req, res, true, true);
  else if (rB.addTag) {
    knex('notes').select('noteName', 'likes').where({ id: rP.id }).then(note => knex('tags').insert({
      tagText: rB.hashtag, noteName: note.noteName, noteId: rP.id, user: user.userName,
    }).then(() => renderPage(req, res, true, true)));
  } else if (rB.delete) {
    renderPage(req, res, true, false);
  } else if (rB.deleteTag) {
    knex('tags').where({ tagText: rB.deletingTag, user: user.userName }).del().then(() => renderPage(req, res, true, true));
  }
});

app.listen(3000);
