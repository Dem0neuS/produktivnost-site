const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('CourseTest', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    courseId: { type: DataTypes.INTEGER, allowNull: false, field: 'course_id' },
    name: { type: DataTypes.STRING, allowNull: false },
    data: { type: DataTypes.JSONB, allowNull: false },
    statusId: { type: DataTypes.INTEGER, allowNull: false, field: 'status_id' },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'course_tests'
  });
};
