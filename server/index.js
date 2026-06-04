const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const path = require('path');
const { sequelize, initDb } = require('./db');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const cabinetRoutes = require('./routes/cabinet');
const coursesRoutes = require('./routes/courses');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Must create store AFTER Session model is defined in db.js
let sessionStore;
try {
  sessionStore = new SequelizeStore({ db: sequelize, table: 'Session' });
} catch (e) {
  console.error('Session store init error:', e.message);
  sessionStore = new session.MemoryStore();
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'produktivnost-secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

app.use('/css', express.static(path.join(__dirname, '..', 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'public', 'js')));
app.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));
app.use('/pages', express.static(path.join(__dirname, '..', 'public', 'pages')));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/cabinet', cabinetRoutes);
app.use('/api/courses', coursesRoutes);

const pages = ['index', 'habits', 'antiprocrastination', 'methods', 'templates', 'glossary', 'tests', 'about', 'cabinet', 'pomodoro', 'courses', 'course'];

pages.forEach(page => {
  const filePath = page === 'index'
    ? path.join(__dirname, '..', 'public', 'index.html')
    : path.join(__dirname, '..', 'public', 'pages', `${page}.html`);
  const route = page === 'index' ? '/' : `/${page}`;
  app.get(route, (req, res) => res.sendFile(filePath));
});

// JSON parse error handler (body-parser malformed JSON)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Неверный формат JSON' });
  }
  next();
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
});

async function start() {
  await initDb();
  if (sessionStore.sync) {
    try {
      await sessionStore.sync();
      console.log('Session store synced');
    } catch (e) {
      console.log('Session store sync failed, using memory fallback');
    }
  }
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  start();
}

module.exports = app;
