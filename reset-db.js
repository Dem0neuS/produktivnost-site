// Сброс БД: удаляет все таблицы и пересоздаёт через Sequelize
// Запуск: node reset-db.js
// Внимание: все данные будут безвозвратно удалены!

const { sequelize, initDb } = require('./server/db');
require('dotenv').config();

(async () => {
  try {
    console.log('Connecting...');
    await sequelize.authenticate();
    console.log('Connected to:', sequelize.config.database);

    // Удаляем все таблицы (старые и новые)
    const tables = [
      'user_question_answers',
      'course_test_questions',
      'course_test_results',
      'course_tests',
      'lessons',
      'courses',
      'test_statuses',
      'lesson_statuses',
      'subscriptions',
      'micro_steps',
      'glossary_favorites',
      'test_results',
      'pomodoro_sessions',
      'habits',
      'users',
      'Sessions',

      // Старые таблицы (если остались от предыдущей версии)
      'sessions',
      'Users',
      'Habits',
      'PomodoroSessions',
      'TestResults',
      'GlossaryFavorites',
      'MicroSteps'
    ];

    for (const t of tables) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS "${t}" CASCADE`);
        console.log('  Dropped:', t);
      } catch (e) {
        // ignore if doesn't exist
      }
    }

    console.log('\nAll tables dropped. Recreating via sync...\n');
    await initDb();

    console.log('\nDone! Database recreated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
