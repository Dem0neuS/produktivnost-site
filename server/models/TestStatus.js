const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('TestStatus', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'test_statuses',
    timestamps: false
  });
};
