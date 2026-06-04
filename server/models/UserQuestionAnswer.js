const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('UserQuestionAnswer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    testId: { type: DataTypes.INTEGER, allowNull: false, field: 'test_id' },
    questionId: { type: DataTypes.INTEGER, allowNull: false, field: 'question_id' },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    isCorrect: { type: DataTypes.BOOLEAN, allowNull: false, field: 'is_correct' },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'user_question_answers',
    updatedAt: false
  });
};
