const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('MicroStep', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    count: { type: DataTypes.INTEGER, defaultValue: 0 },
    weekStart: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'micro_steps'
  });
};
