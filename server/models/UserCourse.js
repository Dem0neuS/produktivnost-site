const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('UserCourse', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'in_progress' },
    progress: { type: DataTypes.FLOAT, defaultValue: 0 },
    completedLessons: { type: DataTypes.JSONB, defaultValue: [] },
    completedAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'user_courses'
  });
};
