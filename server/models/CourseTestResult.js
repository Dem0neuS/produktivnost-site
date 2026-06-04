const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('CourseTestResult', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    testId: { type: DataTypes.INTEGER, allowNull: false, field: 'test_id' },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    correctAnswers: { type: DataTypes.INTEGER, allowNull: false, field: 'correct_answers' },
    wrongAnswers: { type: DataTypes.INTEGER, allowNull: false, field: 'wrong_answers' },
    grade: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'course_test_results'
  });
};
