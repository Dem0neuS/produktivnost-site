# Продуктивность и Планирование

Информационный сайт про продуктивность: методы, привычки, тесты, шаблоны и антипрокрастинация.

## Стек

- **Бэкенд**: Node.js + Express
- **База данных**: PostgreSQL (Sequelize ORM)
- **Фронтенд**: Vanilla JS, CSS Custom Properties
- **Аутентификация**: Сессии (express-session + connect-session-sequelize)
- **Деплой**: Railway

## Модели

- `User` — пользователи (name, email, password, theme)
- `Habit` — привычки (name, days, completed)
- `MicroStep` — микро-шаги (count, weekStart)
- `TestResult` — результаты тестов (testType, result)
- `GlossaryFavorite` — избранные термины (term)

## API

### Auth
- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `POST /api/auth/logout` — выход
- `GET /api/auth/me` — текущий пользователь

### Cabinet
- `GET /api/cabinet/profile` — профиль
- `PUT /api/cabinet/profile` — обновление профиля
- `PUT /api/cabinet/password` — смена пароля

### Data
- `GET /api/sync` — полная синхронизация
- `POST /api/habits` — создать привычку
- `PUT /api/habits/:id` — обновить привычку
- `DELETE /api/habits/:id` — удалить привычку
- `POST /api/habits/sync` — массовая синхронизация привычек
- `POST /api/test-results` — сохранить результат теста
- `POST /api/favorites` — добавить/удалить избранное
- `POST /api/theme` — сохранить тему
- `POST /api/micro-steps` — сохранить микро-шаги

## Установка

```bash
git clone https://github.com/Dem0neuS/produktivnost-site.git
cd produktivnost-site
npm install
```

Создайте `.env` на основе `.env.example`:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SESSION_SECRET=your-secret
NODE_ENV=development
```

```bash
npm start
```

## Docker

```bash
docker compose up --build
```

Приложение будет доступно на http://localhost:3000, PostgreSQL — на порту 5433.

## Тестирование

```bash
npm test
```

Для работы тестов требуется запущенный PostgreSQL (или `npm start` для локальной БД).

## Деплой на Railway

1. Подключите GitHub-репозиторий
2. Добавьте переменные: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`
3. Railway сам установит зависимости и запустит `npm start`
