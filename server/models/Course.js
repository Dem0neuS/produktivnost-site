const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Course', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING, defaultValue: '📚' },
    tag: { type: DataTypes.STRING, defaultValue: 'beginner' },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    audience: { type: DataTypes.TEXT, defaultValue: '' },
    result: { type: DataTypes.TEXT, defaultValue: '' },
    isFree: { type: DataTypes.BOOLEAN, defaultValue: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'courses'
  });
};
