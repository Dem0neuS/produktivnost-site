const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('UserCourse', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    courseId: { type: DataTypes.INTEGER, allowNull: false, field: 'course_id' },
    status: { type: DataTypes.STRING, defaultValue: 'enrolled' },
    progress: { type: DataTypes.FLOAT, defaultValue: 0 },
    completedLessons: { type: DataTypes.JSONB, defaultValue: [], field: 'completed_lessons' },
    enrolledAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'enrolled_at' },
    completedAt: { type: DataTypes.DATE, allowNull: true, field: 'completed_at' }
  }, {
    tableName: 'user_courses',
    timestamps: false
  });
};
