const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const path = require('path');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize, initDb, Role, User, Course, Lesson, GlossaryTerm, Method, Template } = require('./db');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const cabinetRoutes = require('./routes/cabinet');
const coursesRoutes = require('./routes/courses');
const contentRoutes = require('./routes/content');
const adminRoutes = require('./routes/admin');
const pageContentRoutes = require('./routes/pageContent');
const migratePageContent = require('./migratePageContent');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/page-content', pageContentRoutes);

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

async function migrateContent() {
  try {
    const { GlossaryTerm, Method, Template } = require('./db');
    const count = await GlossaryTerm.count();
    if (count === 0) {
      const terms = [
        { term: 'Actionable Item', def: 'Конкретное действие, которое можно выполнить. Не «Подумать о проекте», а «Написать заголовок отчёта». Основа GTD.', example: 'Вместо «Разобраться с почтой» → «Ответить на 3 письма за 10 минут»', link: '/methods#gtd', linkText: 'GTD' },
        { term: 'Batching', def: 'Группировка однотипных задач для выполнения одним блоком. Снижает потери на переключение контекста.', example: 'Выделить 1 час на все звонки, а не звонить по одному раз в час', link: '/methods#timeblocking', linkText: 'Time Blocking' },
        { term: 'Context Switching', def: 'Переключение между разными типами задач. Каждое переключение стоит 10-20 минут потерянного фокуса.', example: 'Проверка почты среди работы над отчётом — потеря 15 минут на восстановление концентрации', link: '/methods#deepwork', linkText: 'Deep Work' },
        { term: 'Deadline Effect', def: 'Эффект дедлайна: продуктивность резко возрастает по мере приближения срока. Используйте искусственные дедлайны.', example: 'Поставить себе дедлайн на день раньше реального, чтобы использовать эффект', link: '/antiprocrastination', linkText: 'Антипрокрастинация' },
        { term: 'Eisenhower Matrix', def: 'Матрица приоритизации по двум осям: срочность и важность. 4 квадранта для принятия решений.', example: 'Важное и несрочное (квадрант 2) — зона стратегического роста', link: '/methods#eisenhower', linkText: 'Подробнее' },
        { term: 'Flow', def: 'Состояние полной вовлечённости в задачу, когда время летит незаметно. Оптимальное состояние для продуктивности.', example: 'Программист пишет код 3 часа и не замечает времени — это flow', link: '/methods#deepwork', linkText: 'Deep Work' },
        { term: 'GTD (Getting Things Done)', def: 'Система управления задачами Дэвида Аллена: сбор, обработка, организация, обзор, выполнение.', example: 'Выгрузить все задачи из головы в систему, чтобы мозг не держал их в фоне', link: '/methods#gtd', linkText: 'Подробнее' },
        { term: 'Habit Stacking', def: 'Метод привязки новой привычки к существующей по формуле «После [триггер] я сделаю [действие]».', example: 'После утреннего кофе (триггер) я читаю 2 страницы (новая привычка)', link: '/habits', linkText: 'Привычки' },
        { term: 'Inbox Zero', def: 'Подход к полной обработке входящих сообщений. Цель — 0 писем в папке «Входящие».', example: 'Обрабатывать каждое письмо сразу: ответить, делегировать, отложить или удалить', link: '/methods', linkText: 'Методы' },
        { term: 'Kanban', def: 'Визуальное управление задачами через доску с колонками: Нужно сделать → В процессе → Готово.', example: 'Trello-доска с задачами, ограничение WIP — не более 3 задач в процессе', link: '/methods#kanban', linkText: 'Подробнее' },
        { term: 'Leverage', def: 'Рычаг — использование ресурсов (времени, денег, технологий) для многократного усиления результата.', example: 'Автоматизация рутинных задач вместо ручного выполнения', link: '/methods#pareto', linkText: '80/20' },
        { term: 'Parkinson Law', def: '«Работа заполняет всё отведённое на неё время». Установите жёсткие сроки, чтобы работать быстрее.', example: 'Задача на 2 часа может быть выполнена за 30 минут, если deadline близко', link: '/antiprocrastination', linkText: 'Антипрокрастинация' },
        { term: 'Pomodoro', def: 'Техника интервальной работы: 25 минут фокуса, 5 минут отдыха. 4 цикла → большой перерыв.', example: 'Написать текст 25 минут → 5 минут чая → ещё 25 минут', link: '/methods#pomodoro', linkText: 'Подробнее' },
        { term: 'ROI of Time', def: 'Окупаемость времени — оценка, какие задачи приносят наибольшую ценность за потраченное время.', example: '1 час консультации = 5000₽, 1 час сортировки писем = 0₽. Вывод: делегировать сортировку', link: '/methods#pareto', linkText: '80/20' },
        { term: 'Second Brain', def: 'Система внешнего хранения знаний: заметки, идеи, ссылки, организованные для быстрого доступа.', example: 'Notion или Obsidian для ведения базы знаний по методике PARA', link: '/glossary', linkText: 'Глоссарий' },
        { term: 'SMART', def: 'Критерии постановки целей: Specific, Measurable, Achievable, Relevant, Time-bound.', example: 'Не «Хочу похудеть», а «Сбросить 5 кг за 3 месяца, занимаясь 3 раза в неделю»', link: '/methods#smart', linkText: 'Подробнее' },
        { term: 'Time Blocking', def: 'Планирование дня блоками по 1-2 часа на конкретные типы задач для минимизации переключений.', example: '9-11: Глубокая работа, 11-12: Встречи, 14-15: Почта и администрирование', link: '/methods#timeblocking', linkText: 'Подробнее' },
        { term: 'Zeigarnik Effect', def: 'Незавершённые задачи запоминаются лучше завершённых. Мозг «фоново» обрабатывает открытые вопросы.', example: 'Начать задачу — мозг будет сам напоминать о ней. Используйте для борьбы с прокрастинацией', link: '/antiprocrastination', linkText: 'Антипрокрастинация' },
        { term: 'CLEAR', def: 'Современный метод целеполагания: Collaborative, Limited, Emotional, Appreciable, Refinable.', example: 'Подходит для творческих проектов, где SMART слишком жёсткий', link: '/methods#clear', linkText: 'Подробнее' },
        { term: 'OKR', def: 'Objectives and Key Results — система целеполагания с амбициозными целями и измеримыми результатами.', example: 'O: Стать экспертом в Python. KR1: Написать 3 проекта. KR2: Получить сертификат.', link: '/methods#okr', linkText: 'Подробнее' },
        { term: 'Deep Work', def: 'Состояние глубокой работы без отвлечений, позволяющее создавать качественный результат.', example: '4 часа в день без телефона, почты и соцсетей для сложных задач', link: '/methods#deepwork', linkText: 'Подробнее' },
        { term: 'Eat The Frog', def: 'Техника: начинайте день с самой сложной и неприятной задачи («лягушки»).', example: 'Если страшно начинать отчёт — сделайте его первым делом с утра', link: '/methods#eatfrog', linkText: 'Подробнее' },
        { term: '2-Minute Rule', def: 'Если задача выполняется за 2 минуты или быстрее — сделайте её сразу.', example: 'Ответить на сообщение, подписать документ, открыть файл — делайте сразу', link: '/methods#2minrule', linkText: 'Подробнее' },
        { term: '5-Second Rule', def: 'Правило Мел Роббинс: считайте 5-4-3-2-1 и действуйте, чтобы прервать цикл сомнений.', example: 'Хотите встать с кровати? 5-4-3-2-1 — встали!', link: '/antiprocrastination', linkText: 'Антипрокрастинация' },
        { term: 'Weekly Review', def: 'Еженедельный 30-минутный обзор задач, календаря и целей для поддержания системы.', example: 'Каждую пятницу: очистить почту, обновить списки, спланировать следующую неделю', link: '/methods#weeklyreview', linkText: 'Подробнее' },
        { term: 'Ivy Lee Method', def: 'Метод планирования: каждый вечер записывайте 6 главных задач на завтра в порядке важности.', example: 'Вечером: 1. Написать отчёт 2. Провести встречу 3. Сделать прототип...', link: '/methods#ivylee', linkText: 'Подробнее' },
        { term: '80/20 Rule (Pareto)', def: '20% усилий дают 80% результата. Сфокусируйтесь на ключевых 20% задач.', example: '20% клиентов приносят 80% прибыли — работайте с ними в первую очередь', link: '/methods#pareto', linkText: 'Подробнее' },
        { term: 'Прокрастинация', def: 'Откладывание важных и срочных дел, замена их менее значимыми, но более приятными занятиями.', example: 'Вместо написания отчёта — уборка стола, проверка соцсетей, просмотр видео', link: '/antiprocrastination', linkText: 'Борьба' },
        { term: 'Привычка', def: 'Автоматическое поведение, закреплённое повторением. Формируется по циклу: сигнал → рутина → награда.', example: 'Чистка зубов перед сном — автоматическая привычка, не требующая силы воли', link: '/habits', linkText: 'Привычки' },
        { term: 'Дофаминовое голодание', def: 'Временный отказ от быстрых источников дофамина (соцсети, игры, видео) для восстановления чувствительности.', example: 'Один день без телефона и интернета — только прогулки, чтение, спорт', link: '/antiprocrastination', linkText: 'Антипрокрастинация' },
        { term: 'Матрица Эйзенхауэра', def: 'Инструмент приоритизации: распределение задач по 4 квадрантам важности и срочности.', example: 'Срочные и важные задачи — делаем сами. Важные, но не срочные — планируем', link: '/methods#eisenhower', linkText: 'Подробнее' },
      ];
      await GlossaryTerm.bulkCreate(terms);
      console.log(`Seeded ${terms.length} glossary terms`);
    }
  } catch (e) { console.error('Glossary seed error:', e.message); }

  try {
    const { Method } = require('./db');
    const count = await Method.count();
    if (count === 0) {
      const methods = [
        { slug: 'eisenhower', name: 'Матрица Эйзенхауэра', desc: 'Приоритизация задач по двум осям: срочность и важность. 4 квадранта для принятия решений.', stars: 3, tags: ['time', 'fast'], time: 'До 10 мин', details: '<h4>Как применять:</h4><ol><li>Выпишите все задачи</li><li>Оцените каждую по срочности и важности</li><li>Распределите по 4 квадрантам:<ul><li>Важно и срочно → делать немедленно</li><li>Важно, но не срочно → запланировать</li><li>Не важно, но срочно → делегировать</li><li>Не важно и не срочно → удалить</li></ul></li><li>Работайте с квадрантом 2 (важное несрочное)</li></ol><h4>Совет:</h4><p>80% времени уделяйте квадранту 2 — это зона стратегического роста.</p>' },
        { slug: 'pomodoro', name: 'Pomodoro', desc: 'Работа интервалами: 25 минут фокуса, 5 минут отдыха. После 4 циклов — большой перерыв.', stars: 4, tags: ['time', 'focus', 'fast'], time: 'До 10 мин', details: '<h4>Как применять:</h4><ol><li>Выберите задачу</li><li>Установите таймер на 25 минут</li><li>Работайте без отвлечений</li><li>Отдых 5 минут</li><li>После 4 помодоро — отдых 15-30 минут</li></ol><h4>Вариант для прокрастинаторов:</h4><p>Начните с 5-минутных интервалов. Постепенно увеличивайте до 25 минут.</p>' },
        { slug: 'gtd', name: 'GTD (Getting Things Done)', desc: 'Система Дэвида Аллена: 5 этапов управления задачами от сбора до выполнения.', stars: 5, tags: ['time', 'long'], time: 'Неделя', details: '<h4>5 этапов GTD:</h4><ol><li><strong>Сбор</strong> — запишите всё, что занимает внимание</li><li><strong>Обработка</strong> — что это? Нужно ли действие?</li><li><strong>Организация</strong> — разложите по категориям: проекты, контексты, когда-нибудь</li><li><strong>Обзор</strong> — еженедельный обзор всех списков</li><li><strong>Выполнение</strong> — выбирайте задачи по контексту и энергии</li></ol><h4>Принцип:</h4><p>Мозг — для мыслей, а не для хранения задач. Выгрузите всё в систему.</p>' },
        { slug: 'timeblocking', name: 'Time Blocking', desc: 'Планирование дня блоками по 1-2 часа на конкретные типы задач. Борьба с переключением контекста.', stars: 4, tags: ['time', 'focus', 'medium'], time: '1 час', details: '<h4>Как применять:</h4><ol><li>Определите типы задач (глубокая работа, встречи, администрирование)</li><li>Назначьте каждому типу временной блок в расписании</li><li>Не смешивайте типы в одном блоке</li><li>Оставьте буферные блоки на непредвиденное</li></ol><h4>Пример:</h4><p>9:00-11:00 Глубокая работа<br>11:00-12:00 Встречи<br>14:00-15:00 Администрирование<br>15:00-16:00 Планирование</p>' },
        { slug: 'smart', name: 'SMART', desc: 'Критерии постановки целей: Specific, Measurable, Achievable, Relevant, Time-bound.', stars: 4, tags: ['goals', 'fast'], time: 'До 10 мин', details: '<h4>Расшифровка:</h4><ul><li><strong>S</strong> — Конкретная (что именно?)</li><li><strong>M</strong> — Измеримая (как узнать, что сделано?)</li><li><strong>A</strong> — Достижимая (реально?)</li><li><strong>R</strong> — Релевантная (зачем это?)</li><li><strong>T</strong> — Ограниченная по времени (когда?)</li></ul><h4>Пример:</h4><p>Вместо «Начать учить английский» → «Сдать IELTS на 7.0 до 31 декабря, занимаясь 3 раза в неделю по 1 часу».</p>' },
        { slug: 'clear', name: 'CLEAR', desc: 'Современная альтернатива SMART: Collaborative, Limited, Emotional, Appreciable, Refinable.', stars: 3, tags: ['goals', 'medium'], time: '1 час', details: '<h4>Расшифровка:</h4><ul><li><strong>C</strong> — Совместная (есть поддержка)</li><li><strong>L</strong> — Ограниченная (по времени/ресурсам)</li><li><strong>E</strong> — Эмоциональная (вдохновляет)</li><li><strong>A</strong> — Ощутимая (можно разбить на шаги)</li><li><strong>R</strong> — Улучшаемая (можно корректировать)</li></ul><p>Подходит для творческих и гибких проектов, где SMART слишком жёсткий.</p>' },
        { slug: 'okr', name: 'OKR', desc: 'Objectives and Key Results — метод целеполагания для амбициозных целей с измеримыми результатами.', stars: 4, tags: ['goals', 'medium'], time: '1 час', details: '<h4>Структура OKR:</h4><ul><li><strong>Objective</strong> — вдохновляющая цель (1-3 слова)</li><li><strong>Key Results</strong> — 3-5 измеримых результата</li></ul><h4>Пример:</h4><p>O: Стать продуктивнее в 2026<br>KR1: Внедрить 3 новых привычки<br>KR2: Прочитать 12 книг по продуктивности<br>KR3: Уменьшить прокрастинацию на 50%</p>' },
        { slug: 'pareto', name: '80/20 (Парето)', desc: '20% усилий дают 80% результата. Сфокусируйтесь на ключевых 20% задач.', stars: 4, tags: ['time', 'fast'], time: 'До 10 мин', details: '<h4>Как применять:</h4><ol><li>Выпишите все задачи/клиенты/проекты</li><li>Определите, какие 20% приносят 80% результата</li><li>Увеличьте время на эти 20%</li><li>Сократите или делегируйте остальные 80%</li></ol><h4>Примеры:</h4><p>80% продаж приносят 20% клиентов<br>80% проблем — из-за 20% причин<br>80% ценности книги — в 20% глав</p>' },
        { slug: 'eatfrog', name: 'Съешь лягушку', desc: 'Начинайте день с самой сложной и неприятной задачи. Всё остальное покажется лёгким.', stars: 3, tags: ['focus', 'fast'], time: 'До 10 мин', details: '<h4>Правило:</h4><p>«Если ваша задача — съесть лягушку, делайте это с утра. Если нужно съесть двух — начните с самой большой».</p><h4>Как применять:</h4><ol><li>Вечером определите «лягушку» на завтра</li><li>Утром, не проверяя почту и соцсети, сделайте её</li><li>После этого — награда (кофе, прогулка)</li></ol>' },
        { slug: '2minrule', name: 'Правило 2 минут', desc: 'Если задача выполняется за 2 минуты или быстрее — сделайте её сразу, не записывая.', stars: 3, tags: ['time', 'fast'], time: 'До 10 мин', details: '<h4>Принцип:</h4><p>Большинство мелких задач занимают больше времени на запись и обработку, чем на выполнение.</p><h4>Примеры:</h4><ul><li>Ответить на сообщение</li><li>Подписать документ</li><li>Положить вещь на место</li><li>Открыть файл</li></ul><p>Это правило — часть системы GTD.</p>' },
        { slug: 'habitstacking', name: 'Habit Stacking', desc: 'Привязка новой привычки к существующей: «После [триггер] я сделаю [новая привычка]».', stars: 4, tags: ['focus', 'fast'], time: 'До 10 мин', details: '<h4>Формула:</h4><p><strong>После/Перед [текущая привычка], я сделаю [новая привычка].</strong></p><h4>Примеры:</h4><ul><li>«После утреннего кофе я читаю 2 страницы»</li><li>«После чистки зубов я делаю 10 приседаний»</li><li>«Перед сном я записываю 3 задачи на завтра»</li></ul><p>Метод Джеймса Клира из книги «Атомные привычки».</p>' },
        { slug: 'weeklyreview', name: 'Weekly Review', desc: 'Еженедельный 30-минутный обзор: очистка списков, обновление целей, планирование недели.', stars: 4, tags: ['time', 'medium'], time: '1 час', details: '<h4>Процесс еженедельного обзора:</h4><ol><li>Соберите все записи и заметки</li><li>Очистите почту и мессенджеры</li><li>Обновите списки задач</li><li>Проверьте календарь на неделю</li><li>Оцените прогресс по целям</li><li>Запланируйте задачи на неделю</li></ol><p>Лучшее время: пятница после обеда или воскресенье вечером.</p>' },
        { slug: 'deepwork', name: 'Deep Work', desc: 'Режим глубокой работы без отвлечений. 2-4 часа в день для сложных интеллектуальных задач.', stars: 5, tags: ['focus', 'medium'], time: '1 час', details: '<h4>Правила глубокой работы:</h4><ol><li>Выделите 2-4 часа без уведомлений</li><li>Закройте все вкладки, кроме нужной</li><li>Используйте технику Pomodoro (50/10)</li><li>Тренируйте концентрацию постепенно</li></ol><h4>Методы:</h4><ul><li><strong>Монастырский</strong> — полная изоляция</li><li><strong>Бимодальный</strong> — несколько часов утром</li><li><strong>Ритмичный</strong> — ежедневно в одно время</li><li><strong>Журналистский</strong> — урывками между делами</li></ul><p>Метод Кэла Ньюпорта из книги «Deep Work».</p>' },
        { slug: 'ivylee', name: 'Метод Айви Ли', desc: 'Ежедневное планирование 6 главных задач. В конце дня выберите 6 задач на завтра по порядку.', stars: 3, tags: ['time', 'fast'], time: 'До 10 мин', details: '<h4>Как применять:</h4><ol><li>Каждый вечер записывайте 6 самых важных задач на завтра</li><li>Расположите их в порядке истинной важности</li><li>Начинайте день с задачи №1</li><li>Работайте над ней, пока не закончите</li><li>Переходите к следующей задаче</li><li>Невыполненные задачи перенесите на следующий день</li></ol><p>Метод повысил продуктивность Bethlehem Steel на 50% за 3 месяца.</p>' },
        { slug: 'kanban', name: 'Kanban', desc: 'Визуальное управление задачами через доску с колонками: Нужно сделать → В процессе → Готово.', stars: 4, tags: ['time', 'medium'], time: '1 час', details: '<h4>Базовая доска Kanban:</h4><ul><li><strong>Нужно сделать</strong> — все задачи в очереди</li><li><strong>В процессе</strong> — не более 3 задач одновременно</li><li><strong>Готово</strong> — выполненные задачи</li></ul><h4>Правила:</h4><ul><li>Ограничьте WIP (work in progress) — не берите больше 2-3 задач</li><li>Визуализируйте поток работы</li><li>Измеряйте время выполнения</li><li>Постоянно улучшайте процесс</li></ul><p>Инструменты: Trello, Notion, Jira или физическая доска.</p>' },
      ];
      await Method.bulkCreate(methods);
      console.log(`Seeded ${methods.length} methods`);
    }
  } catch (e) { console.error('Methods seed error:', e.message); }

  try {
    const { Template } = require('./db');
    const count = await Template.count();
    if (count === 0) {
      const templates = [
        { icon: '📓', name: 'Ежедневник «Идеальный день»', desc: 'Почасовая разбивка дня + приоритеты. Формат A4, PDF.', size: '1.2 MB', content: 'ИДЕАЛЬНЫЙ ДЕНЬ\n\nДата: _____\n\nПриоритеты дня:\n1. _____\n2. _____\n3. _____\n\nРасписание:\n06:00-07:00 | Утро\n07:00-09:00 | ___ \n09:00-12:00 | ___ \n12:00-13:00 | Обед\n13:00-16:00 | ___ \n16:00-18:00 | ___ \n18:00-20:00 | Вечер\n20:00-22:00 | Отдых\n\nВечерний обзор:\nЧто сделано? _____\nЧто улучшить? _____' },
        { icon: '📊', name: 'Трекер привычек на месяц', desc: 'Excel с графиком выполнения привычек на 30 дней.', size: '256 KB', content: 'ТРЕКЕР ПРИВЫЧЕК НА МЕСЯЦ\n\nМесяц: _____\n\nПривычка | 1 | 2 | 3 | ... | 30 | %\n___ | ☐ | ☐ | ☐ | ... | ☐ | 0%\n___ | ☐ | ☐ | ☐ | ... | ☐ | 0%\n\nИтого: ☐☐☐☐☐☐☐☐☐☐ / 30 дней' },
        { icon: '📐', name: 'Матрица Эйзенхауэра', desc: 'Печатный лист A4 для приоритизации задач.', size: '890 KB', content: 'МАТРИЦА ЭЙЗЕНХАУЭРА\n\n┌─────────────────┬─────────────────┐\n│  ВАЖНО И СРОЧНО  │  ВАЖНО НЕ СРОЧНО │\n│  (Сделать сейчас) │  (Запланировать) │\n├─────────────────┼─────────────────┤\n│ НЕ ВАЖНО СРОЧНО  │ НЕ ВАЖНО НЕ СРОЧНО│\n│  (Делегировать)   │  (Удалить)       │\n└─────────────────┴─────────────────┘' },
        { icon: '📅', name: 'Планер «Идеальная неделя»', desc: 'Недельный планер с приоритетами и обзором. PDF.', size: '1.5 MB', content: 'ИДЕАЛЬНАЯ НЕДЕЛЯ\n\nНеделя: _____\n\nЦель недели: _____\n\n┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐\n│ ПН  │ ВТ  │ СР  │ ЧТ  │ ПТ  │ СБ  │ ВС  │\n├─────┼─────┼─────┼─────┼─────┼─────┼─────┤\n│     │     │     │     │     │     │     │\n└─────┴─────┴─────┴─────┴─────┴─────┴─────┘\n\nИтоги недели:\n✅ Что сделано:\n❌ Что не получилось:\n🎯 Планы на следующую:' },
        { icon: '☀️', name: 'Чек-лист «Утренняя рутина за 15 минут»', desc: 'Список дел для продуктивного утра.', size: '340 KB', content: 'УТРЕННЯЯ РУТИНА ЗА 15 МИНУТ\n\n☐ Проснуться в одно и то же время\n☐ Выпить стакан воды\n☐ Умыться/душ\n☐ 5 минут зарядки\n☐ Застелить кровать\n☐ Записать 3 цели на день\n☐ Здоровый завтрак\n☐ 2 минуты тишины/дыхания' },
        { icon: '🌙', name: 'Чек-лист «Вечерний обзор дня»', desc: 'Вечерняя рефлексия для осознанного завершения дня.', size: '280 KB', content: 'ВЕЧЕРНИЙ ОБЗОР ДНЯ\n\nДата: _____\n\n✅ Что я сегодня сделал(а)?\n1. _____\n2. _____\n3. _____\n\n📈 Что можно было сделать лучше?\n_____\n\n🙏 За что я благодарен(на)?\n1. _____\n2. _____\n3. _____\n\n🎯 3 задачи на завтра:\n1. _____\n2. _____\n3. _____' },
        { icon: '🎯', name: 'SMART шаблон целей', desc: 'Форма для постановки целей по критериям SMART.', size: '420 KB', content: 'SMART ШАБЛОН ЦЕЛИ\n\nS (Specific / Конкретная): _____\nM (Measurable / Измеримая): _____\nA (Achievable / Достижимая): _____\nR (Relevant / Релевантная): _____\nT (Time-bound / Ограниченная): _____\n\nПлан достижения:\nШаг 1: _____\nШаг 2: _____\nШаг 3: _____' },
        { icon: '🔨', name: 'Лист декомпозиции задачи', desc: 'Разбейте любую крупную задачу на маленькие шаги.', size: '310 KB', content: 'ДЕКОМПОЗИЦИЯ ЗАДАЧИ\n\nЗадача: _____\n\nМикрошаги:\n1. _____\n2. _____\n3. _____\n4. _____\n5. _____\n\nПервый шаг (прямо сейчас): _____\n\nОжидаемое время выполнения: _____' },
        { icon: '📉', name: 'Календарь обратного планирования', desc: 'Планирование от дедлайна к первому шагу.', size: '680 KB', content: 'ОБРАТНОЕ ПЛАНИРОВАНИЕ\n\nДедлайн: _____\n\n┌──────┬──────────────────────────┐\n│ Дата │          Шаг             │\n├──────┼──────────────────────────┤\n│      │                         │\n│      │                         │\n│      │                         │\n│      │                         │\n│      │                         │\n└──────┴──────────────────────────┘\n\nНачать с: _____' },
      ];
      await Template.bulkCreate(templates);
      console.log(`Seeded ${templates.length} templates`);
    }
  } catch (e) { console.error('Templates seed error:', e.message); }
}

async function start() {
  await initDb();
  await ensureRoles();
  await ensureAdmin();
  await migrateCourses();
  await migrateContent();
  await migratePageContent();
  if (sessionStore.sync) {
    try {
      await sequelize.query('DROP TABLE IF EXISTS "Sessions" CASCADE');
      await sessionStore.sync();
      console.log('Session store synced');
    } catch (e) {
      console.log('Session store sync failed:', e.message);
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
