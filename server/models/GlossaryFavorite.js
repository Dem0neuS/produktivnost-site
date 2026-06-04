const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('GlossaryFavorite', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    term: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'glossary_favorites',
    updatedAt: false
  });
};
