const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Method', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    desc: { type: DataTypes.TEXT, allowNull: false },
    stars: { type: DataTypes.INTEGER, defaultValue: 3 },
    tags: { type: DataTypes.JSONB, defaultValue: [] },
    time: { type: DataTypes.STRING, defaultValue: '' },
    details: { type: DataTypes.TEXT, defaultValue: '' }
  }, {
    tableName: 'methods',
    timestamps: false
  });
};