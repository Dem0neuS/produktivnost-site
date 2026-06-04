const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('CourseTestQuestion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    testId: { type: DataTypes.INTEGER, allowNull: false, field: 'test_id' },
    question: { type: DataTypes.TEXT, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'course_test_questions',
    updatedAt: false
  });
};
