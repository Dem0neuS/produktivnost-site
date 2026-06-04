// Заполнение БД тестовыми данными
// Запуск: node seed.js
// Внимание: предварительно запустите reset-db.js для чистой БД

const bcrypt = require('bcryptjs');
const { sequelize, initDb, User, Habit, PomodoroSession, TestResult, GlossaryFavorite, MicroStep, Subscription, LessonStatus, TestStatus, Course, Lesson, CourseTest, CourseTestQuestion, CourseTestResult, UserQuestionAnswer } = require('./server/db');
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
      { name: 'Основы тайм-менеджмента' },
      { name: 'Продвинутая продуктивность' },
      { name: 'Эмоциональный интеллект' }
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
      { courseId: courses[0].id, lessonNumber: 1, data: '# Введение в тайм-менеджмент\n\nЧто такое тайм-менеджмент и зачем он нужен? В этом уроке разберём базовые понятия.', statusId: lessonStatuses[0].id },
      { courseId: courses[0].id, lessonNumber: 2, data: '# Матрица Эйзенхауэра\n\nКак расставлять приоритеты с помощью матрицы срочности и важности.', statusId: lessonStatuses[0].id },
      { courseId: courses[0].id, lessonNumber: 3, data: '# Pomodoro-техника\n\n25 минут фокуса — 5 минут отдыха. Освойте главную технику интервальной работы.', statusId: lessonStatuses[2].id },
      { courseId: courses[1].id, lessonNumber: 1, data: '# GTD — Getting Things Done\n\nПолная система управления задачами от Дэвида Аллена.', statusId: lessonStatuses[0].id },
      { courseId: courses[1].id, lessonNumber: 2, data: '# Deep Work\n\nКак входить в состояние глубокой работы и не отвлекаться.', statusId: lessonStatuses[1].id },
      { courseId: courses[2].id, lessonNumber: 1, data: '# Что такое эмоциональный интеллект\n\nEQ vs IQ: почему эмоции важнее IQ для успеха.', statusId: lessonStatuses[0].id },
      { courseId: courses[2].id, lessonNumber: 2, data: '# Управление стрессом\n\nТехники быстрого восстановления в стрессовых ситуациях.', statusId: lessonStatuses[0].id },
      { courseId: courses[2].id, lessonNumber: 3, data: '# Эмпатия в коммуникации\n\nКак понимать эмоции других и строить доверительные отношения.', statusId: lessonStatuses[0].id }
    ]);
    console.log(`  ${lessons.length} created`);

    console.log('--- Course Tests ---');
    const courseTests = await CourseTest.bulkCreate([
      { courseId: courses[0].id, name: 'Входной тест по тайм-менеджменту', statusId: testStatuses[0].id },
      { courseId: courses[0].id, name: 'Итоговый тест по основам', statusId: testStatuses[0].id },
      { courseId: courses[1].id, name: 'Тест по GTD', statusId: testStatuses[0].id },
      { courseId: courses[2].id, name: 'Тест по EQ', statusId: testStatuses[1].id }
    ]);
    console.log(`  ${courseTests.length} created`);

    console.log('--- Course Test Questions ---');
    const questions = await CourseTestQuestion.bulkCreate([
      // Входной тест (id=1)
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
