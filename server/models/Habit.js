const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Habit', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    days: { type: DataTypes.JSONB, defaultValue: [] },
    completed: { type: DataTypes.JSONB, defaultValue: {} },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });
};
