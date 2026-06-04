const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Subscription', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'subscriptions',
    timestamps: false
  });
};
