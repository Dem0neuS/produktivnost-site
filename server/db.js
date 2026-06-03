const { Sequelize } = require('sequelize');
require('dotenv').config();

const isRailway = !!process.env.DATABASE_URL;

const sequelize = isRailway
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: { ssl: { rejectUnauthorized: false } },
      logging: false,
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    })
  : new Sequelize(
      process.env.DB_NAME || 'produktivnost',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
      }
    );

const User = require('./models/User')(sequelize);
const Habit = require('./models/Habit')(sequelize);
const TestResult = require('./models/TestResult')(sequelize);
const GlossaryFavorite = require('./models/GlossaryFavorite')(sequelize);
const MicroStep = require('./models/MicroStep')(sequelize);

User.hasMany(Habit, { foreignKey: 'userId' });
Habit.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(TestResult, { foreignKey: 'userId' });
TestResult.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(GlossaryFavorite, { foreignKey: 'userId' });
GlossaryFavorite.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(MicroStep, { foreignKey: 'userId' });
MicroStep.belongsTo(User, { foreignKey: 'userId' });

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

module.exports = { sequelize, User, Habit, TestResult, GlossaryFavorite, MicroStep, initDb };
