const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const path = require('path');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize, initDb, Role, User, Course, Lesson } = require('./db');
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
  sessionStore = new SequelizeStore({ db: sequelize, table: 'Sessions' });
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

async function ensureRoles() {
  try {
    const [adminRole, userRole] = await Promise.all([
      Role.findOrCreate({ where: { name: 'Администратор' }, defaults: { name: 'Администратор' } }),
      Role.findOrCreate({ where: { name: 'Пользователь' }, defaults: { name: 'Пользователь' } })
    ]);
    console.log(`Roles ensured: Администратор (id=${adminRole[0].id}), Пользователь (id=${userRole[0].id})`);
    const count = await User.count({ where: { roleId: null } });
    if (count > 0) {
      await User.update({ roleId: userRole[0].id }, { where: { roleId: null } });
      console.log(`Assigned role 'Пользователь' to ${count} existing users`);
    }
  } catch (e) { console.log('Role migration:', e.message); }
}

async function ensureAdmin() {
  try {
    const adminRole = await Role.findOne({ where: { name: 'Администратор' } });
    const admin = await User.findOne({ where: { email: 'thenullpath1@gmail.com' } });
    if (!admin && adminRole) {
      const hash = await bcrypt.hash('123456', 10);
      await User.create({
        name: 'dem0neuS',
        email: 'thenullpath1@gmail.com',
        password: hash,
        roleId: adminRole.id
      });
      console.log('Admin user created (dem0neuS / 123456)');
    }
  } catch (e) { console.log('Admin creation:', e.message); }
}

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
    const { Op } = require('sequelize');
    const lessons = await Lesson.findAll({ order: [['courseId', 'ASC'], ['lessonNumber', 'ASC']] });
    const allContent = [
        '<p>Научитесь за 5 минут отфильтровать хаос из задач с помощью матрицы Эйзенхауэра.</p><h3>Практика</h3><p>Возьмите список всех дел на сегодня. Разделите лист на 4 квадранта:</p><ul><li><strong>Важно и срочно</strong> — делаем сразу</li><li><strong>Важно, не срочно</strong> — планируем</li><li><strong>Не важно, срочно</strong> — делегируем</li><li><strong>Не важно, не срочно</strong> — удаляем</li></ul><p>Результат: перед вами не хаос, а чёткая картина дня.</p>',
        '<p>Техника Pomodoro внутри жёстких блоков — работаем 25 мин, отдыхаем, не переключаясь.</p><h3>Как совместить</h3><p>Разбейте день на 2-часовые блоки. В каждом блоке — 3 помодоро по 25 мин с перерывами 5 мин. После каждого блока — большой перерыв 15-30 мин.</p><p><strong>Важно:</strong> внутри блока никаких переключений — только одна задача.</p>',
        '<p>Мини-GTD (обзор дня) и ритуал «Стоп» — чтобы мысли о работе не шли в личную жизнь.</p><h3>Вечерний ритуал (5 минут)</h3><ol><li>Запишите 3 главных достижения дня</li><li>Перенесите несделанное на завтра</li><li>Скажите вслух: «Рабочий день окончен»</li></ol><p>Этот ритуал снижает тревожность и помогает мозгу переключиться на отдых.</p>',
        '<p>Как разбить «написать диплом» на 15-минутные задачи, используя правило Парето.</p><h3>Правило 80/20 для учёбы</h3><p>20% усилий дают 80% результата. Найдите эти 20% в вашем курсовом проекте:</p><ul><li>Какая глава самая важная?</li><li>Какой источник даст 80% информации?</li><li>Какой эксперимент самый показательный?</li></ul><p>Разбейте работу на задачи по 15 минут и выполняйте по одной в день.</p>',
        '<p>Метод приоритетов: матрица Эйзенхауэра + вес предмета.</p><h3>Как составить карту</h3><p>Оцените каждый предмет по двум шкалам: сложность (1-10) и вес зачётки (количество часов/кредитов). Предметы с высокой сложностью и большим весом — в приоритет. На них уйдёт 80% времени подготовки.</p>',
        '<p>Как совмещать подработку, пары и личную жизнь без выгорания.</p><h3>Режим дня</h3><p>Используйте Time Blocking: пары (утро) → подработка (день) → личное (вечер). В каждом блоке — только одна активность. Pomodoro внутри блоков помогает не отвлекаться.</p>',
        '<p>«Можно с ребёнком» / «Только когда спит». Как их раскладывать по блокам.</p><h3>Два типа задач</h3><p><strong>Тип А</strong> — можно делать с ребёнком: уборка, готовка, покупки, звонки родным.</p><p><strong>Тип Б</strong> — только когда ребёнок спит: работа, учёба, творчество, важные звонки.</p><p>Планируйте день вокруг снов ребёнка: в один сон — задача типа Б, в другой — отдых.</p>',
        '<p>Всего 3 важных бытовых дела в день — остальное по желанию.</p><h3>Как это работает</h3><p>Каждое утро выбирайте 3 дела, которые сделают день «успешным». Всё остальное — бонус. Если сделали только 3 дела — день прошёл не зря. Если сделали больше — вы супергерой.</p>',
        '<p>Выделение 45 минут «на себя» через технику Pomodoro.</p><h3>45 минут для себя</h3><p>Один блок в день, когда ребёнок спит или с другим родителем. 45 минут = 1 помодоро (25 мин) + перерыв + ещё 1 помодоро. В это время — только ваш проект. Без соцсетей, без уборки, без «срочных» дел.</p>',
        '<p>Куда сливать задачи из головы, телеграма, почты.</p><h3>Корзина входящего</h3><p>Заведите одно место (Notion/бумага/файл), куда попадают ВСЕ задачи. Раз в день разбирайте корзину: что-то в календарь, что-то в список, что-то в архив. Если задача занимает меньше 2 минут — сделайте сразу.</p>',
        '<p>Метка «надо подумать», «жду ответа», «сделать, если будет 10 минут».</p><h3>Контексты в GTD</h3><p>Вместо того чтобы ставить дедлайн на каждую задачу, разложите их по контекстам: @компьютер, @звонки, @встречи, @дома, @ожидание. Когда у вас есть 10 минут в очереди — смотрите контекст @ожидание.</p>',
        '<p>Не 2 часа, а 20 минут и чашка чая — пересмотреть «Когда-нибудь» и похвалить себя.</p><h3>Review для занятых</h3><p>Раз в неделю (например, в воскресенье вечером) уделите 20 минут: (1) очистите корзину, (2) посмотрите на список «Когда-нибудь», (3) отметьте сделанное и похвалите себя, (4) наметьте 3 задачи на неделю.</p>',
        '<p>Кто забирает ребёнка, кто покупает продукты — Time Blocking для двоих.</p><h3>Синхронизация</h3><p>Заведите общий календарь (Google Calendar / Notion) с цветовыми метками для каждого члена семьи. В воскресенье на 10 минут сверьте планы на неделю: кто ведёт ребёнка к врачу, кто закупает продукты, когда общий ужин.</p>',
        '<p>Когда никого не дёргать по работе / домашним вопросам.</p><h3>Правила для дома</h3><p>Определите «тихие часы» (например, 9:00-11:00 утра) — время глубокой работы, когда никто никого не отвлекает. «Зелёные зоны» — время для семейных дел и общения. Это снижает конфликты и повышает продуктивность всех.</p>',
        '<p>10 минут в воскресенье синхронизировать планы, чтобы не было «А ты что, забыл?».</p><h3>Воскресный ритуал</h3><p>В воскресенье вечером соберитесь на 10 минут: (1) что было классного на неделе, (2) что не получилось, (3) планы на следующую неделю. Записывайте договорённости в общий календарь. Это убирает 90% бытовых конфликтов.</p>'
      ];
    let migratedCount = 0;
    for (let i = 0; i < lessons.length; i++) {
      if (i < allContent.length) {
        lessons[i].content = allContent[i];
        await lessons[i].save();
        migratedCount++;
      }
    }
    if (migratedCount > 0) console.log(`Migrated ${migratedCount} lessons`);
  } catch (e) { console.error('Auto-migration error:', e.message); }
}

async function start() {
  await initDb();
  await ensureRoles();
  await ensureAdmin();
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
