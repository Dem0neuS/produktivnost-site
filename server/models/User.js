const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    theme: { type: DataTypes.STRING, defaultValue: 'light' },
    resetToken: { type: DataTypes.STRING, allowNull: true },
    resetTokenExpires: { type: DataTypes.DATE, allowNull: true },
    roleId: { type: DataTypes.INTEGER, allowNull: true, field: 'role_id', defaultValue: 2 },
    subscriptionStatusId: { type: DataTypes.INTEGER, allowNull: true, field: 'subscription_status_id' },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'users'
  });
};
