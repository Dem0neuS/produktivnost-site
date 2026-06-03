-- Создание базы данных (выполнить от суперпользователя)
-- CREATE DATABASE produktivnost;

-- Таблицы создаются автоматически Sequelize через server/db.js
-- Для ручного создания таблиц:

CREATE TABLE IF NOT EXISTS "Users" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  theme VARCHAR(255) DEFAULT 'light',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Habits" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"(id),
  name VARCHAR(255) NOT NULL,
  days JSONB DEFAULT '[]',
  completed JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TestResults" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"(id),
  "testType" VARCHAR(255) NOT NULL,
  result JSONB NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "GlossaryFavorites" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"(id),
  term VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "MicroSteps" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "Users"(id),
  count INTEGER DEFAULT 0,
  "weekStart" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
