const express = require('express');
const router = express.Router();
const { Course, Lesson, LessonStatus, CourseTest, CourseTestQuestion, UserCourse, User, sequelize } = require('../db');

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Не авторизован' });
  next();
}

// Список всех курсов
router.get('/', async (req, res) => {
  try {
    const courses = await Course.findAll({ order: [['id', 'ASC']] });
    res.json({ courses });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка загрузки курсов' });
  }
});

// Детали курса с уроками
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: Lesson, include: [LessonStatus] }, { model: CourseTest }]
    });
    if (!course) return res.status(404).json({ error: 'Курс не найден' });
    res.json({ course });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка загрузки курса' });
  }
});

// Мои курсы
router.get('/my/list', async (req, res) => {
  if (!req.user) return res.json({ courses: [] });
  try {
    const userCourses = await UserCourse.findAll({
      where: { userId: req.user.id },
      include: [Course],
      order: [['enrolledAt', 'DESC']]
    });
    res.json({ courses: userCourses });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка загрузки' });
  }
});

// Запись на курс
router.post('/:id/enroll', requireAuth, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Курс не найден' });

    const existing = await UserCourse.findOne({
      where: { userId: req.user.id, courseId: course.id }
    });
    if (existing) return res.json({ success: true, enrollment: existing });

    const enrollment = await UserCourse.create({
      userId: req.user.id,
      courseId: course.id,
      status: 'in_progress'
    });
    res.json({ success: true, enrollment });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка записи' });
  }
});

// Отметить урок пройденным
router.post('/lessons/:id/complete', requireAuth, async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, { include: [Course] });
    if (!lesson) return res.status(404).json({ error: 'Урок не найден' });

    const uc = await UserCourse.findOne({
      where: { userId: req.user.id, courseId: lesson.courseId }
    });
    if (!uc) return res.status(400).json({ error: 'Вы не записаны на курс' });

    const allLessons = await Lesson.count({ where: { courseId: lesson.courseId, statusId: { [require('sequelize').Op.ne]: 2 } }});
    const total = allLessons || 1;

    // отмечаем урок как пройденный (храним JSON с пройденными lessonId)
    const completed = uc.completedLessons || {};
    const arr = Array.isArray(completed) ? completed : [];
    if (!arr.includes(lesson.id)) arr.push(lesson.id);
    const progress = Math.min(100, Math.round((arr.length / total) * 100));
    const status = progress >= 100 ? 'completed' : 'in_progress';

    await uc.update({
      completedLessons: arr,
      progress,
      status,
      completedAt: status === 'completed' ? new Date() : null
    });

    res.json({ success: true, progress, status });
  } catch (e) {
    console.error('Complete error:', e);
    res.status(500).json({ error: 'Ошибка' });
  }
});

module.exports = router;
