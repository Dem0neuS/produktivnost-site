const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const path = require('path');
const { sequelize, initDb, Course, Lesson } = require('./db');
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

async function migrateCourses() {
  try {
    const courseMeta = [
      { id: 1, icon: '🚀', tag: 'beginner', description: 'Собрать работающую систему из инструментов сайта: Эйзенхауэр + Pomodoro + Time Blocking + GTD.', audience: 'Новички и те, кто пробовал всё, но ничего не прижилось', result: 'PDF «Мой спокойный день» + снижение тревожности', isFree: true },
      { id: 2, icon: '🎓', tag: 'student', description: 'Перестать учиться ночью и начать успевать отдыхать.', audience: 'Студенты', result: 'Готовый план на семестр', isFree: true },
      { id: 3, icon: '👨‍👩‍👧‍👦', tag: 'parent', description: 'Совмещать быт, ребёнка и собственные проекты без чувства вины.', audience: 'Родители в декрете', result: 'Система покажет — вы сделали главное', isFree: true },
      { id: 4, icon: '💼', tag: 'work', description: 'Полный GTD, адаптированный под бережное отношение к себе.', audience: 'Работающие и фрилансеры', result: 'Mind like water — спокойный ум', isFree: true },
      { id: 5, icon: '👥', tag: 'work', description: 'Единая логика планирования для семьи или команды.', audience: 'Пары, родители + дети, небольшие команды', result: 'Меньше обид и ссор', isFree: true }
    ];
    let count = 0;
    for (const data of courseMeta) {
      const c = await Course.findByPk(data.id);
      if (c && (!c.icon || c.icon === '📚')) { await c.update(data); count++; }
    }
    if (count > 0) console.log(`Migrated ${count} courses`);
    const lessons = await Lesson.findAll({ where: { content: '' } });
    if (lessons.length > 0) {
      const defaultContent = '<p>Содержание урока пока не загружено. Пожалуйста, обновите страницу позже.</p>';
      for (const l of lessons) { l.content = defaultContent; await l.save(); }
      console.log(`Migrated ${lessons.length} lessons`);
    }
  } catch (e) { console.error('Auto-migration error:', e.message); }
}

async function start() {
  await initDb();
  await migrateCourses();
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
