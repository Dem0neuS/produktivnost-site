const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('TestResult', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    testType: { type: DataTypes.STRING, allowNull: false },
    result: { type: DataTypes.JSONB, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });
};
