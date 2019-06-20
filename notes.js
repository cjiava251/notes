const express = require('express');

const app = express();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const urlencodedParser = require('body-parser').urlencoded({ extended: false });

const config = {};
config.redisStore = {
  url: process.env.REDIS_STORE_URI,
  secret: process.env.REDIS_STORE_SECRET,
};

const user = {
  userName: 'user12',
  password: 'pass1',
  notesCount: 0,
  id: 5
};

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './db/users_db.sqlite3',
  },
  useNullAsDefault: true,
});

function renderNotePage(req, res, hiddenAdd = 'true', hiddenDel = 'true') {
  knex('notes').select().where({ id: req.params.noteId })
    .then(note => knex('tags').select('tagText').where({ noteId: note[0].id, userId: req.params.userId })
      .then(tag => res.render('note', {
        title: `Заметка № ${note[0].id}`,
        note: note[0],
        style: '../css/stylesheet.css',
        bool1: hiddenAdd,
        bool2: hiddenDel,
        tags: tag
      }))
    );
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

app.get('/', (req, res) => res.render('main', { main: 'main', title: 'Главная', style: 'css/stylesheet.css' }));
app.get('/login', (req, res) => res.render('login', { login: 'login', title: 'Вход', style: 'css/stylesheet.css' }));
app.get('/features', (req, res) => res.render('features', { features: 'features', title: 'Особенности', style: 'css/stylesheet.css' }));
app.get('/news', (req, res) => res.render('news', { news: 'news', title: 'Новости', style: 'css/stylesheet.css' }));
app.get('/user/:userId/notes', (req, res) => {
  if (req.params.userId == user.id)
    knex('notes').select('noteName', 'id')
      .then(notes => {
        res.render('my_notes', { myNotes: "myNotes", title: 'Мои заметки', notes: notes, style: 'css/stylesheet.css', userId: user.id })
      });
  else
    res.redirect('/temp');
});
app.route('/user/:userId/new_note')
  .get((req, res) => res.render('new_note', { newNote: 'newNote', title: 'Новая заметка', style: 'css/stylesheet.css' }))
  .post(urlencodedParser, (req, res) => {
    const rB = req.body, rP = req.params;
    knex('notes').insert({
      userId: user.id,
      noteName: rB.noteName,
      noteText: rB.noteText,
      likesCount: 0,
      tagsCount: 0,
    }).then(() => res.send(`Ваша заметка ${rB.noteName} успешно сохранена<br><a href="/user/${rP.userId}/notes">вернуться к моим заметкам</a>`));
  });
app.route('/user/:userId/notes/:noteId')
  .get((req, res) => renderNotePage(req, res))
  .post(urlencodedParser, (req, res) => {
    const rP = req.params, rB = req.body;
    if (rB.like) {
      knex('likes').select().where({ userId: rP.userId, noteId: rP.noteId }).then(usr => {
        if (usr[0] === undefined) {
          knex('likes').insert({ userId: rP.userId, noteId: rP.noteId }).then(() =>
            knex('notes').increment('likesCount', 1).where({ id: rP.noteId }).then(() => renderNotePage(req, res)));
        } else {
          knex('likes').where({ userId: rP.userId, noteId: rP.noteId }).del().then(() =>
            knex('notes').decrement('likesCount', 1).where({ id: rP.noteId }).then(() => renderNotePage(req, res))
          )
        }
      });
    }
  })
  .post(urlencodedParser, (req, res) => {
    if (req.body.tag) renderNotePage(req, res, false);
  })
  .post(urlencodedParser, (req, res) => {
    if (req.body.cancel) renderNotePage(req, res);
  })
  .post(urlencodedParser, (req, res) => {
    const rP = req.params, rB = req.body;
    if (rB.addTag)
      knex('tags').insert({ tagText: rB.hashtag, noteId: rP.noteId, userId: rP.userId })
        .then(() => renderNotePage(req, res));
  })
  .post(urlencodedParser, (req, res) => {
    if (req.body.delete) renderNotePage(req, res, true, false);
  })
  .post(urlencodedParser, (req, res) => {
    if (req.body.deleteTag) {
      knex('tags').where({ tagText: req.body.deletingTag, userId: req.params.userId })
        .del().then(() => renderNotePage(req, res));
    }
  });

app.route('/new_user')
  .get((req, res) =>
    res.render('new_user', {
      newUser: 'newUser', title: 'Новый пользователь', bool: 'true', style: 'css/stylesheet.css'
    })
  )
  .post(urlencodedParser, (req, res) => {
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
    } else res.render('new_user', { newUser: 'newUser', title: 'Новый пользователь', style: 'css/stylesheet.css' });
  });


app.get('/temp', (req, res) => {
  res.send('вы не авторизованы <a href="/">на главную</a>');
});


// knex('notes').select('tagsCount').then(tag => console.log(tag))

app.listen(3000);
