const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Lesson', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    courseId: { type: DataTypes.INTEGER, allowNull: false, field: 'course_id' },
    lessonNumber: { type: DataTypes.INTEGER, allowNull: false, field: 'lesson_number' },
    data: { type: DataTypes.TEXT, allowNull: false },
    statusId: { type: DataTypes.INTEGER, allowNull: false, field: 'status_id' },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'lessons'
  });
};
