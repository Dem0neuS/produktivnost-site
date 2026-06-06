const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('GlossaryTerm', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    term: { type: DataTypes.STRING, allowNull: false },
    def: { type: DataTypes.TEXT, allowNull: false },
    example: { type: DataTypes.TEXT, defaultValue: '' },
    link: { type: DataTypes.STRING, defaultValue: '' },
    linkText: { type: DataTypes.STRING, defaultValue: '' }
  }, {
    tableName: 'glossary_terms',
    timestamps: false
  });
};