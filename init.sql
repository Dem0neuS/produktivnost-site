-- =====================================================================
-- 1. СЛУЖЕБНЫЕ ТАБЛИЦЫ, СПРАВОЧНИКИ И НЕЗАВИСИМЫЕ СУЩНОСТИ
-- =====================================================================

-- Сессии авторизации (создаётся connect-session-sequelize автоматически)
-- Таблица: "Sessions" (modelKey: 'Session', tableName: 'Sessions' по умолчанию)

-- Подписки (из ER-диаграммы: справочник наименований подписок)
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Статусы Уроков (из ER-диаграммы: справочник статусов)
CREATE TABLE IF NOT EXISTS lesson_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Статусы Тестов (из ER-диаграммы: справочник статусов)
CREATE TABLE IF NOT EXISTS test_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Курсы (из ER-диаграммы)
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ
);


-- =====================================================================
-- 2. ОСНОВНАЯ ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (СВЯЗУЮЩЕЕ ЗВЕНО)
-- =====================================================================

-- Users — пользователи (со связью СтатусПодписки(FK) из диаграммы)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    theme VARCHAR(255) DEFAULT 'light',
    "resetToken" VARCHAR(255) NULL,
    "resetTokenExpires" TIMESTAMPTZ NULL,
    subscription_status_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL
);


-- =====================================================================
-- 3. ТАБЛИЦЫ ТРЕКЕРА ПРОДУКТИВНОСТИ
-- =====================================================================

-- Habits — привычки (User → Habit)
CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    days JSONB DEFAULT '[]',
    completed JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL
);

-- PomodoroSessions — сессии таймера (User → PomodoroSession)
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    duration INTEGER NOT NULL,
    type VARCHAR(255) DEFAULT 'work',
    "completedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL
);

-- TestResults — результаты психологических тестов/тестов продуктивности
CREATE TABLE IF NOT EXISTS test_results (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "testType" VARCHAR(255) NOT NULL,
    result JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL
);

-- GlossaryFavorites — избранные термины (User → GlossaryFavorite)
CREATE TABLE IF NOT EXISTS glossary_favorites (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    term VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL
);

-- MicroSteps — micro-шаги (User → MicroStep)
CREATE TABLE IF NOT EXISTS micro_steps (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0,
    "weekStart" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL
);


-- =====================================================================
-- 4. ТАБЛИЦЫ МОДУЛЯ ОБУЧЕНИЯ (ИЗ ER-ДИАГРАММЫ)
-- =====================================================================

-- Уроки (Курсы --> Уроки)
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_number INTEGER NOT NULL,
    data TEXT NOT NULL,
    status_id INTEGER NOT NULL REFERENCES lesson_statuses(id) ON DELETE RESTRICT,
    "createdAt" TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ
);

-- Тесты внутри курсов (Курсы --> Тесты)
CREATE TABLE IF NOT EXISTS course_tests (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status_id INTEGER NOT NULL REFERENCES test_statuses(id) ON DELETE RESTRICT,
    "createdAt" TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ
);

-- Вопросы к тестам (Тесты --> Вопросы к тестам)
CREATE TABLE IF NOT EXISTS course_test_questions (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL REFERENCES course_tests(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Общие результаты сдачи тестов по курсам
CREATE TABLE IF NOT EXISTS course_test_results (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL REFERENCES course_tests(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    correct_answers INTEGER NOT NULL,
    wrong_answers INTEGER NOT NULL,
    grade VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL
);

-- Повопросные ответы пользователя
CREATE TABLE IF NOT EXISTS user_question_answers (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL REFERENCES course_tests(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES course_test_questions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================================
-- 5. ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ СВЯЗЕЙ (FOREIGN KEYS)
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits("userId");
CREATE INDEX IF NOT EXISTS idx_pomodoro_user_id ON pomodoro_sessions("userId");
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_tests_course_id ON course_tests(course_id);
CREATE INDEX IF NOT EXISTS idx_course_test_questions_test_id ON course_test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_course_test_results_test_id ON course_test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_course_test_results_user_id ON course_test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_question_answers_test_question ON user_question_answers(test_id, question_id);
CREATE INDEX IF NOT EXISTS idx_user_question_answers_user ON user_question_answers(user_id);
