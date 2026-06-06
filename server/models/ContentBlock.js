const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('ContentBlock', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    page: { type: DataTypes.STRING, allowNull: false },
    section: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: true },
    content: { type: DataTypes.JSONB, allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, { tableName: 'content_blocks' });
};
