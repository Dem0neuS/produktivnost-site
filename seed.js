// Заполнение БД тестовыми данными
// Запуск: node seed.js
// Внимание: предварительно запустите reset-db.js для чистой БД

const bcrypt = require('bcryptjs');
const { sequelize, initDb, User, Habit, PomodoroSession, TestResult, GlossaryFavorite, MicroStep, Subscription, LessonStatus, TestStatus, Course, Lesson, CourseTest, CourseTestQuestion, CourseTestResult, UserQuestionAnswer, UserCourse } = require('./server/db');
require('dotenv').config();

(async () => {
  try {
    console.log('Connecting...');
    await sequelize.authenticate();
    console.log('Connected.\n');

    // =====================================================================
    // 1. СПРАВОЧНИКИ
    // =====================================================================
    console.log('--- Subscriptions ---');
    const subs = await Subscription.bulkCreate([
      { name: 'Базовая' },
      { name: 'Премиум' },
      { name: 'VIP' }
    ]);
    console.log(`  ${subs.length} created`);

    console.log('--- Lesson Statuses ---');
    const lessonStatuses = await LessonStatus.bulkCreate([
      { name: 'Доступен' },
      { name: 'Заблокирован' },
      { name: 'Пройден' }
    ]);
    console.log(`  ${lessonStatuses.length} created`);

    console.log('--- Test Statuses ---');
    const testStatuses = await TestStatus.bulkCreate([
      { name: 'Активен' },
      { name: 'Черновик' },
      { name: 'Архив' }
    ]);
    console.log(`  ${testStatuses.length} created`);

    // =====================================================================
    // 2. КУРСЫ
    // =====================================================================
    console.log('\n--- Courses ---');
    const courses = await Course.bulkCreate([
      { name: 'Ваша первая система из 4 блоков', icon: '🚀', tag: 'beginner', description: 'Собрать работающую систему из инструментов сайта: Эйзенхауэр + Pomodoro + Time Blocking + GTD.', audience: 'Новички и те, кто пробовал всё, но ничего не прижилось', result: 'PDF «Мой спокойный день» + снижение тревожности', isFree: true },
      { name: 'Сессия без нервов: учёба и жизнь', icon: '🎓', tag: 'student', description: 'Перестать учиться ночью и начать успевать отдыхать.', audience: 'Студенты', result: 'Готовый план на семестр', isFree: true },
      { name: 'Сделать, отвлечься, не забыть', icon: '👨‍👩‍👧‍👦', tag: 'parent', description: 'Совмещать быт, ребёнка и собственные проекты без чувства вины.', audience: 'Родители в декрете', result: 'Система покажет — вы сделали главное', isFree: true },
      { name: 'Мастер-контроль без выгорания', icon: '💼', tag: 'work', description: 'Полный GTD, адаптированный под бережное отношение к себе.', audience: 'Работающие и фрилансеры', result: 'Mind like water — спокойный ум', isFree: true },
      { name: 'Синхронизация без конфликтов', icon: '👥', tag: 'work', description: 'Единая логика планирования для семьи или команды.', audience: 'Пары, родители + дети, небольшие команды', result: 'Меньше обид и ссор', isFree: true }
    ]);
    console.log(`  ${courses.length} created`);

    // =====================================================================
    // 3. ПОЛЬЗОВАТЕЛИ
    // =====================================================================
    console.log('\n--- Users ---');
    const hash = await bcrypt.hash('123456', 10);
    const users = await User.bulkCreate([
      { name: 'Анна Петрова', email: 'anna@test.ru', password: hash, theme: 'light', subscriptionStatusId: subs[0].id },
      { name: 'Иван Сидоров', email: 'ivan@test.ru', password: hash, theme: 'dark', subscriptionStatusId: subs[1].id },
      { name: 'Мария Иванова', email: 'maria@test.ru', password: hash, theme: 'light', subscriptionStatusId: subs[2].id },
      { name: 'Демо Пользователь', email: 'demo@test.ru', password: hash, theme: 'light', subscriptionStatusId: subs[0].id }
    ]);
    console.log(`  ${users.length} created (pass: 123456)`);

    // =====================================================================
    // 4. ТРЕКЕР ПРОДУКТИВНОСТИ
    // =====================================================================
    console.log('\n--- Habits ---');
    const habits = await Habit.bulkCreate([
      { userId: users[0].id, name: 'Утренняя зарядка', days: ['Пн','Вт','Ср','Чт','Пт'], completed: { '2026-06-01': true, '2026-06-02': true, '2026-06-03': false } },
      { userId: users[0].id, name: 'Чтение 10 страниц', days: ['Пн','Ср','Пт'], completed: { '2026-06-01': true, '2026-06-03': true } },
      { userId: users[1].id, name: 'Планирование дня', days: ['Пн','Вт','Ср','Чт','Пт','Сб'], completed: { '2026-06-01': true, '2026-06-02': true, '2026-06-03': true } },
      { userId: users[1].id, name: 'Медитация 5 мин', days: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'], completed: { '2026-06-01': false, '2026-06-02': true } },
      { userId: users[2].id, name: 'Стакан воды после пробуждения', days: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'], completed: { '2026-06-01': true, '2026-06-02': true, '2026-06-03': true } },
      { userId: users[3].id, name: 'Трекер задач в Notion', days: ['Пн','Вт','Ср','Чт','Пт'], completed: { '2026-06-01': true, '2026-06-02': false } }
    ]);
    console.log(`  ${habits.length} created`);

    console.log('--- Pomodoro Sessions ---');
    const now = new Date();
    const day = 86400000;
    const sessions = await PomodoroSession.bulkCreate([
      { userId: users[0].id, duration: 1500, type: 'work', completedAt: new Date(now - 2 * day) },
      { userId: users[0].id, duration: 1500, type: 'work', completedAt: new Date(now - 2 * day) },
      { userId: users[0].id, duration: 300, type: 'break', completedAt: new Date(now - 2 * day) },
      { userId: users[0].id, duration: 1500, type: 'work', completedAt: new Date(now - 1 * day) },
      { userId: users[0].id, duration: 1500, type: 'work', completedAt: new Date(now - 1 * day) },
      { userId: users[0].id, duration: 1500, type: 'work', completedAt: new Date(now - 1 * day) },
      { userId: users[0].id, duration: 300, type: 'break', completedAt: new Date(now - 1 * day) },
      { userId: users[0].id, duration: 1500, type: 'work', completedAt: now },
      { userId: users[0].id, duration: 1500, type: 'work', completedAt: now },
      { userId: users[1].id, duration: 1500, type: 'work', completedAt: now },
      { userId: users[2].id, duration: 1500, type: 'work', completedAt: new Date(now - 1 * day) },
      { userId: users[2].id, duration: 300, type: 'break', completedAt: new Date(now - 1 * day) }
    ]);
    console.log(`  ${sessions.length} created`);

    console.log('--- Test Results ---');
    const testResults = await TestResult.bulkCreate([
      { userId: users[0].id, testType: 'productivity', result: { score: 75, label: 'Выше среднего', method: 'Pomodoro' } },
      { userId: users[0].id, testType: 'procrastination', result: { score: 40, label: 'Умеренная прокрастинация' } },
      { userId: users[1].id, testType: 'productivity', result: { score: 90, label: 'Отлично', method: 'GTD' } },
      { userId: users[2].id, testType: 'productivity', result: { score: 50, label: 'Средний', method: 'Eisenhower' } },
      { userId: users[2].id, testType: 'procrastination', result: { score: 70, label: 'Высокая прокрастинация' } },
      { userId: users[3].id, testType: 'productivity', result: { score: 65, label: 'Выше среднего', method: 'Time Blocking' } }
    ]);
    console.log(`  ${testResults.length} created`);

    console.log('--- Glossary Favorites ---');
    const favs = await GlossaryFavorite.bulkCreate([
      { userId: users[0].id, term: 'Pomodoro' },
      { userId: users[0].id, term: 'Flow' },
      { userId: users[1].id, term: 'GTD' },
      { userId: users[1].id, term: 'Deep Work' },
      { userId: users[2].id, term: 'Матрица Эйзенхауэра' },
      { userId: users[3].id, term: 'Прокрастинация' }
    ]);
    console.log(`  ${favs.length} created`);

    console.log('--- Micro Steps ---');
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    const ws = weekStart.toISOString().slice(0, 10);
    const micros = await MicroStep.bulkCreate([
      { userId: users[0].id, count: 5, weekStart: ws },
      { userId: users[1].id, count: 3, weekStart: ws },
      { userId: users[2].id, count: 7, weekStart: ws },
      { userId: users[3].id, count: 2, weekStart: ws }
    ]);
    console.log(`  ${micros.length} created`);

    // =====================================================================
    // 5. МОДУЛЬ ОБУЧЕНИЯ
    // =====================================================================
    console.log('\n--- Lessons ---');
    const lessons = await Lesson.bulkCreate([
      { courseId: courses[0].id, lessonNumber: 1, data: 'Утро: матрица Эйзенхауэра за 5 минут', statusId: lessonStatuses[0].id, content: '<p>Научитесь за 5 минут отфильтровать хаос из задач с помощью матрицы Эйзенхауэра.</p><h3>Практика</h3><p>Возьмите список всех дел на сегодня. Разделите лист на 4 квадранта:</p><ul><li><strong>Важно и срочно</strong> — делаем сразу</li><li><strong>Важно, не срочно</strong> — планируем</li><li><strong>Не важно, срочно</strong> — делегируем</li><li><strong>Не важно, не срочно</strong> — удаляем</li></ul><p>Результат: перед вами не хаос, а чёткая картина дня.</p>' },
      { courseId: courses[0].id, lessonNumber: 2, data: 'День: Pomodoro внутри Time Blocking', statusId: lessonStatuses[0].id, content: '<p>Техника Pomodoro внутри жёстких блоков — работаем 25 мин, отдыхаем, не переключаясь.</p><h3>Как совместить</h3><p>Разбейте день на 2-часовые блоки. В каждом блоке — 3 помодоро по 25 мин с перерывами 5 мин. После каждого блока — большой перерыв 15-30 мин.</p><p><strong>Важно:</strong> внутри блока никаких переключений — только одна задача.</p>' },
      { courseId: courses[0].id, lessonNumber: 3, data: 'Вечер: мини-GTD и ритуал «Стоп»', statusId: lessonStatuses[0].id, content: '<p>Мини-GTD (обзор дня) и ритуал «Стоп» — чтобы мысли о работе не шли в личную жизнь.</p><h3>Вечерний ритуал (5 минут)</h3><ol><li>Запишите 3 главных достижения дня</li><li>Перенесите несделанное на завтра</li><li>Скажите вслух: «Рабочий день окончен»</li></ol><p>Этот ритуал снижает тревожность и помогает мозгу переключиться на отдых.</p>' },
      { courseId: courses[1].id, lessonNumber: 1, data: 'Декомпозиция курсача (80/20)', statusId: lessonStatuses[0].id, content: '<p>Как разбить «написать диплом» на 15-минутные задачи, используя правило Парето.</p><h3>Правило 80/20 для учёбы</h3><p>20% усилий дают 80% результата. Найдите эти 20% в вашем курсовом проекте:</p><ul><li>Какая глава самая важная?</li><li>Какой источник даст 80% информации?</li><li>Какой эксперимент самый показательный?</li></ul><p>Разбейте работу на задачи по 15 минут и выполняйте по одной в день.</p>' },
      { courseId: courses[1].id, lessonNumber: 2, data: 'Карта экзаменов', statusId: lessonStatuses[0].id, content: '<p>Метод приоритетов: матрица Эйзенхауэра + вес предмета.</p><h3>Как составить карту</h3><p>Оцените каждый предмет по двум шкалам: сложность (1-10) и вес зачётки (количество часов/кредитов). Предметы с высокой сложностью и большим весом — в приоритет. На них уйдёт 80% времени подготовки.</p>' },
      { courseId: courses[1].id, lessonNumber: 3, data: 'Режим «Фрилансер» для студента', statusId: lessonStatuses[0].id, content: '<p>Как совмещать подработку, пары и личную жизнь без выгорания.</p><h3>Режим дня</h3><p>Используйте Time Blocking: пары (утро) → подработка (день) → личное (вечер). В каждом блоке — только одна активность. Pomodoro внутри блоков помогает не отвлекаться.</p>' },
      { courseId: courses[2].id, lessonNumber: 1, data: 'Уровни задач: «можно с ребёнком» / «только когда спит»', statusId: lessonStatuses[0].id, content: '<p>«Можно с ребёнком» / «Только когда спит». Как их раскладывать по блокам.</p><h3>Два типа задач</h3><p><strong>Тип А</strong> — можно делать с ребёнком: уборка, готовка, покупки, звонки родным.</p><p><strong>Тип Б</strong> — только когда ребёнок спит: работа, учёба, творчество, важные звонки.</p><p>Планируйте день вокруг снов ребёнка: в один сон — задача типа Б, в другой — отдых.</p>' },
      { courseId: courses[2].id, lessonNumber: 2, data: 'Правило 3-х дел', statusId: lessonStatuses[0].id, content: '<p>Всего 3 важных бытовых дела в день — остальное по желанию.</p><h3>Как это работает</h3><p>Каждое утро выбирайте 3 дела, которые сделают день «успешным». Всё остальное — бонус. Если сделали только 3 дела — день прошёл не зря. Если сделали больше — вы супергерой.</p>' },
      { courseId: courses[2].id, lessonNumber: 3, data: 'Свой проект без прокрастинации', statusId: lessonStatuses[0].id, content: '<p>Выделение 45 минут «на себя» через технику Pomodoro.</p><h3>45 минут для себя</h3><p>Один блок в день, когда ребёнок спит или с другим родителем. 45 минут = 1 помодоро (25 мин) + перерыв + ещё 1 помодоро. В это время — только ваш проект. Без соцсетей, без уборки, без «срочных» дел.</p>' },
      { courseId: courses[3].id, lessonNumber: 1, data: 'Полная «Корзина» для задач', statusId: lessonStatuses[0].id, content: '<p>Куда сливать задачи из головы, телеграма, почты.</p><h3>Корзина входящего</h3><p>Заведите одно место (Notion/бумага/файл), куда попадают ВСЕ задачи. Раз в день разбирайте корзину: что-то в календарь, что-то в список, что-то в архив. Если задача занимает меньше 2 минут — сделайте сразу.</p>' },
      { courseId: courses[3].id, lessonNumber: 2, data: 'Контексты вместо дедлайнов', statusId: lessonStatuses[0].id, content: '<p>Метка «надо подумать», «жду ответа», «сделать, если будет 10 минут».</p><h3>Контексты в GTD</h3><p>Вместо того чтобы ставить дедлайн на каждую задачу, разложите их по контекстам: @компьютер, @звонки, @встречи, @дома, @ожидание. Когда у вас есть 10 минут в очереди — смотрите контекст @ожидание.</p>' },
      { courseId: courses[3].id, lessonNumber: 3, data: 'Еженедельный обзор по-человечески', statusId: lessonStatuses[0].id, content: '<p>Не 2 часа, а 20 минут и чашка чая — пересмотреть «Когда-нибудь» и похвалить себя.</p><h3>Review для занятых</h3><p>Раз в неделю (например, в воскресенье вечером) уделите 20 минут: (1) очистите корзину, (2) посмотрите на список «Когда-нибудь», (3) отметьте сделанное и похвалите себя, (4) наметьте 3 задачи на неделю.</p>' },
      { courseId: courses[4].id, lessonNumber: 1, data: 'Общий календарь', statusId: lessonStatuses[0].id, content: '<p>Кто забирает ребёнка, кто покупает продукты — Time Blocking для двоих.</p><h3>Синхронизация</h3><p>Заведите общий календарь (Google Calendar / Notion) с цветовыми метками для каждого члена семьи. В воскресенье на 10 минут сверьте планы на неделю: кто ведёт ребёнка к врачу, кто закупает продукты, когда общий ужин.</p>' },
      { courseId: courses[4].id, lessonNumber: 2, data: '«Тихие часы» и «Зелёные зоны»', statusId: lessonStatuses[0].id, content: '<p>Когда никого не дёргать по работе / домашним вопросам.</p><h3>Правила для дома</h3><p>Определите «тихие часы» (например, 9:00-11:00 утра) — время глубокой работы, когда никто никого не отвлекает. «Зелёные зоны» — время для семейных дел и общения. Это снижает конфликты и повышает продуктивность всех.</p>' },
      { courseId: courses[4].id, lessonNumber: 3, data: 'Общий обзор', statusId: lessonStatuses[0].id, content: '<p>10 минут в воскресенье синхронизировать планы, чтобы не было «А ты что, забыл?».</p><h3>Воскресный ритуал</h3><p>В воскресенье вечером соберитесь на 10 минут: (1) что было классного на неделе, (2) что не получилось, (3) планы на следующую неделю. Записывайте договорённости в общий календарь. Это убирает 90% бытовых конфликтов.</p>' }
    ]);
    console.log(`  ${lessons.length} created`);

    console.log('--- User Courses (enrollments) ---');
    const enrollments = await UserCourse.bulkCreate([
      { userId: users[0].id, courseId: courses[0].id, status: 'in_progress', progress: 33, completedLessons: [1] },
      { userId: users[0].id, courseId: courses[2].id, status: 'in_progress', progress: 0, completedLessons: [] },
      { userId: users[1].id, courseId: courses[3].id, status: 'in_progress', progress: 66, completedLessons: [10, 11] },
      { userId: users[2].id, courseId: courses[2].id, status: 'completed', progress: 100, completedLessons: [7, 8, 9], completedAt: new Date() },
      { userId: users[3].id, courseId: courses[0].id, status: 'in_progress', progress: 66, completedLessons: [1, 2] }
    ]);
    console.log(`  ${enrollments.length} created`);

    console.log('--- Course Tests ---');
    const courseTests = await CourseTest.bulkCreate([
      { courseId: courses[0].id, name: 'Самопроверка: блок 1', statusId: testStatuses[0].id },
      { courseId: courses[0].id, name: 'Самопроверка: блок 2', statusId: testStatuses[0].id },
      { courseId: courses[1].id, name: 'Тест по декомпозиции', statusId: testStatuses[0].id },
      { courseId: courses[3].id, name: 'Тест по GTD', statusId: testStatuses[0].id },
      { courseId: courses[4].id, name: 'Тест по синхронизации', statusId: testStatuses[1].id }
    ]);
    console.log(`  ${courseTests.length} created`);

    console.log('--- Course Test Questions ---');
    const questions = await CourseTestQuestion.bulkCreate([
      // Самопроверка блок 1 (id=1)
      { testId: courseTests[0].id, question: 'Что означает аббревиатура GTD?' },
      { testId: courseTests[0].id, question: 'Сколько минут длится один Pomodoro-цикл?' },
      { testId: courseTests[0].id, question: 'Какие оси использует матрица Эйзенхауэра?' },
      { testId: courseTests[0].id, question: 'Что такое «лягушка» в тайм-менеджменте?' },
      // Итоговый тест (id=2)
      { testId: courseTests[1].id, question: 'Какой процент задач обычно приносит 80% результата?' },
      { testId: courseTests[1].id, question: 'Что такое Time Blocking?' },
      { testId: courseTests[1].id, question: 'Как часто нужно делать Weekly Review?' },
      // GTD тест (id=3)
      { testId: courseTests[2].id, question: 'Из скольки этапов состоит система GTD?' },
      { testId: courseTests[2].id, question: 'Что такое «контекст» в GTD?' },
      // EQ тест (id=4)
      { testId: courseTests[3].id, question: 'Из скольки компонентов состоит EQ по модели Гоулмана?' },
      { testId: courseTests[3].id, question: 'Что такое эмпатия?' }
    ]);
    console.log(`  ${questions.length} created`);

    console.log('--- Course Test Results ---');
    const ctr = await CourseTestResult.bulkCreate([
      { testId: courseTests[0].id, userId: users[0].id, correctAnswers: 3, wrongAnswers: 1, grade: '75%' },
      { testId: courseTests[0].id, userId: users[1].id, correctAnswers: 4, wrongAnswers: 0, grade: '100%' },
      { testId: courseTests[1].id, userId: users[0].id, correctAnswers: 2, wrongAnswers: 1, grade: '67%' },
      { testId: courseTests[2].id, userId: users[1].id, correctAnswers: 2, wrongAnswers: 0, grade: '100%' }
    ]);
    console.log(`  ${ctr.length} created`);

    console.log('--- User Question Answers ---');
    const uqa = await UserQuestionAnswer.bulkCreate([
      // Анна - входной тест: 3 правильных, 1 неправильный
      { testId: courseTests[0].id, questionId: questions[0].id, userId: users[0].id, isCorrect: true },
      { testId: courseTests[0].id, questionId: questions[1].id, userId: users[0].id, isCorrect: true },
      { testId: courseTests[0].id, questionId: questions[2].id, userId: users[0].id, isCorrect: false },
      { testId: courseTests[0].id, questionId: questions[3].id, userId: users[0].id, isCorrect: true },
      // Иван - входной тест: 4 правильных
      { testId: courseTests[0].id, questionId: questions[0].id, userId: users[1].id, isCorrect: true },
      { testId: courseTests[0].id, questionId: questions[1].id, userId: users[1].id, isCorrect: true },
      { testId: courseTests[0].id, questionId: questions[2].id, userId: users[1].id, isCorrect: true },
      { testId: courseTests[0].id, questionId: questions[3].id, userId: users[1].id, isCorrect: true },
      // Анна - итоговый тест: 2 правильных, 1 неправильный
      { testId: courseTests[1].id, questionId: questions[4].id, userId: users[0].id, isCorrect: true },
      { testId: courseTests[1].id, questionId: questions[5].id, userId: users[0].id, isCorrect: true },
      { testId: courseTests[1].id, questionId: questions[6].id, userId: users[0].id, isCorrect: false },
      // Иван - GTD тест: 2 правильных
      { testId: courseTests[2].id, questionId: questions[7].id, userId: users[1].id, isCorrect: true },
      { testId: courseTests[2].id, questionId: questions[8].id, userId: users[1].id, isCorrect: true }
    ]);
    console.log(`  ${uqa.length} created`);

    console.log('\n=== Seed complete ===');
    console.log('Users: anna@test.ru, ivan@test.ru, maria@test.ru, demo@test.ru (pass: 123456)');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
})();
