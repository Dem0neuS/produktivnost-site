const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('LessonStatus', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'lesson_statuses',
    timestamps: false
  });
};
