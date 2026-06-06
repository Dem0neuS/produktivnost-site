const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Template', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    icon: { type: DataTypes.STRING, defaultValue: '📄' },
    name: { type: DataTypes.STRING, allowNull: false },
    desc: { type: DataTypes.TEXT, allowNull: false },
    size: { type: DataTypes.STRING, defaultValue: '' },
    content: { type: DataTypes.TEXT, defaultValue: '' }
  }, {
    tableName: 'templates',
    timestamps: false
  });
};