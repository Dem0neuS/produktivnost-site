const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('PomodoroSession', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING, defaultValue: 'work' },
    completedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'pomodoro_sessions',
    updatedAt: false
  });
};
