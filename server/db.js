const { Sequelize } = require('sequelize');
require('dotenv').config();

function getSequelize() {
  if (process.env.DATABASE_URL) {
    return new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: { ssl: { rejectUnauthorized: false } },
      logging: false,
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    });
  }

  if (process.env.PGHOST) {
    return new Sequelize(
      process.env.PGDATABASE || 'railway',
      process.env.PGUSER || 'postgres',
      process.env.PGPASSWORD || '',
      {
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT || '5432'),
        dialect: 'postgres',
        dialectOptions: { ssl: { rejectUnauthorized: false } },
        logging: false,
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
      }
    );
  }

  return new Sequelize(
    process.env.DB_NAME || 'produktivnost',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      dialect: 'postgres',
      logging: false,
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    }
  );
}

const sequelize = getSequelize();

const User = require('./models/User')(sequelize);
const Habit = require('./models/Habit')(sequelize);
const TestResult = require('./models/TestResult')(sequelize);
const GlossaryFavorite = require('./models/GlossaryFavorite')(sequelize);
const MicroStep = require('./models/MicroStep')(sequelize);
const PomodoroSession = require('./models/PomodoroSession')(sequelize);

const Subscription = require('./models/Subscription')(sequelize);
const LessonStatus = require('./models/LessonStatus')(sequelize);
const TestStatus = require('./models/TestStatus')(sequelize);
const Course = require('./models/Course')(sequelize);
const Lesson = require('./models/Lesson')(sequelize);
const CourseTest = require('./models/CourseTest')(sequelize);
const CourseTestResult = require('./models/CourseTestResult')(sequelize);
const CourseTestQuestion = require('./models/CourseTestQuestion')(sequelize);
const UserQuestionAnswer = require('./models/UserQuestionAnswer')(sequelize);

// Трекер продуктивности
User.hasMany(Habit, { foreignKey: 'userId' });
Habit.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(TestResult, { foreignKey: 'userId' });
TestResult.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(GlossaryFavorite, { foreignKey: 'userId' });
GlossaryFavorite.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(MicroStep, { foreignKey: 'userId' });
MicroStep.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(PomodoroSession, { foreignKey: 'userId' });
PomodoroSession.belongsTo(User, { foreignKey: 'userId' });

// Модуль обучения
User.belongsTo(Subscription, { foreignKey: 'subscriptionStatusId', as: 'subscription' });
Subscription.hasMany(User, { foreignKey: 'subscriptionStatusId' });

Course.hasMany(Lesson, { foreignKey: 'course_id' });
Lesson.belongsTo(Course, { foreignKey: 'course_id' });

LessonStatus.hasMany(Lesson, { foreignKey: 'status_id' });
Lesson.belongsTo(LessonStatus, { foreignKey: 'status_id' });

Course.hasMany(CourseTest, { foreignKey: 'course_id' });
CourseTest.belongsTo(Course, { foreignKey: 'course_id' });

TestStatus.hasMany(CourseTest, { foreignKey: 'status_id' });
CourseTest.belongsTo(TestStatus, { foreignKey: 'status_id' });

CourseTest.hasMany(CourseTestResult, { foreignKey: 'test_id' });
CourseTestResult.belongsTo(CourseTest, { foreignKey: 'test_id' });

User.hasMany(CourseTestResult, { foreignKey: 'user_id' });
CourseTestResult.belongsTo(User, { foreignKey: 'user_id' });

CourseTest.hasMany(CourseTestQuestion, { foreignKey: 'test_id' });
CourseTestQuestion.belongsTo(CourseTest, { foreignKey: 'test_id' });

CourseTest.hasMany(UserQuestionAnswer, { foreignKey: 'test_id' });
UserQuestionAnswer.belongsTo(CourseTest, { foreignKey: 'test_id' });

CourseTestQuestion.hasMany(UserQuestionAnswer, { foreignKey: 'question_id' });
UserQuestionAnswer.belongsTo(CourseTestQuestion, { foreignKey: 'question_id' });

User.hasMany(UserQuestionAnswer, { foreignKey: 'user_id' });
UserQuestionAnswer.belongsTo(User, { foreignKey: 'user_id' });

async function initDb() {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected');
    await sequelize.sync({ alter: true });
    console.log('Models synchronized');
  } catch (err) {
    console.error('DB connection error:', err.message);
    console.log('Running in offline mode - using localStorage only');
  }
}

module.exports = {
  sequelize, User, Habit, TestResult, GlossaryFavorite, MicroStep, PomodoroSession,
  Subscription, LessonStatus, TestStatus, Course, Lesson, CourseTest, CourseTestResult,
  CourseTestQuestion, UserQuestionAnswer,
  initDb
};
