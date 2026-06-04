const express = require('express');
const router = express.Router();
const { Course, Lesson, LessonStatus, CourseTest, CourseTestQuestion, UserCourse, User, sequelize } = require('../db');

async function getUserId(req) {
  if (req.session?.userId) {
    const user = await User.findByPk(req.session.userId, { attributes: ['id'] });
    return user?.id || null;
  }
  return null;
}

// Список всех курсов
router.get('/', async (req, res) => {
  try {
    const courses = await Course.findAll({
      order: [['id', 'ASC']],
      attributes: {
        include: [[sequelize.literal('(SELECT COUNT(*) FROM "lessons" WHERE "lessons"."course_id" = "Course"."id")'), 'lessonCount']]
      }
    });
    res.json({ courses });
  } catch (e) {
    console.error('Courses list error:', e.message);
    res.status(500).json({ error: 'Ошибка загрузки курсов' });
  }
});

// Детали курса с уроками
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: Lesson, include: [LessonStatus] }, { model: CourseTest }],
      order: [[Lesson, 'lessonNumber', 'ASC']]
    });
    if (!course) return res.status(404).json({ error: 'Курс не найден' });
    res.json({ course });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка загрузки курса' });
  }
});

// Мои курсы
router.get('/my/list', async (req, res) => {
  const uid = await getUserId(req);
  if (!uid) return res.json({ courses: [] });
  try {
    const userCourses = await UserCourse.findAll({
      where: { userId: uid },
      order: [['createdAt', 'DESC']]
    });
    const courseIds = [...new Set(userCourses.map(uc => uc.courseId))];
    const [courses, counts] = await Promise.all([
      courseIds.length > 0
        ? Course.findAll({ where: { id: courseIds } })
        : Promise.resolve([]),
      courseIds.length > 0
        ? sequelize.query(
            'SELECT course_id, COUNT(*) AS cnt FROM lessons WHERE course_id IN (:ids) GROUP BY course_id',
            { replacements: { ids: courseIds }, type: sequelize.QueryTypes.SELECT }
          )
        : Promise.resolve([])
    ]);
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));
    const countMap = {};
    counts.forEach(r => { countMap[r.course_id] = parseInt(r.cnt, 10); });
    const result = userCourses.map(uc => {
      const plain = uc.toJSON();
      const course = courseMap[uc.courseId];
      if (course) {
        plain.course = course.toJSON();
        plain.course.lessonCount = countMap[uc.courseId] || 0;
      }
      return plain;
    });
    res.json({ courses: result });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка загрузки' });
  }
});

// Запись на курс
router.post('/:id/enroll', async (req, res) => {
  const uid = await getUserId(req);
  if (!uid) return res.status(401).json({ error: 'Не авторизован' });
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Курс не найден' });

    const existing = await UserCourse.findOne({
      where: { userId: uid, courseId: course.id }
    });
    if (existing) return res.json({ success: true, enrollment: existing });

    const enrollment = await UserCourse.create({
      userId: uid,
      courseId: course.id,
      status: 'in_progress'
    });
    res.json({ success: true, enrollment });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка записи' });
  }
});

// Отметить урок пройденным
router.post('/lessons/:id/complete', async (req, res) => {
  const uid = await getUserId(req);
  if (!uid) return res.status(401).json({ error: 'Не авторизован' });
  try {
    const lesson = await Lesson.findByPk(req.params.id, { include: [Course] });
    if (!lesson) return res.status(404).json({ error: 'Урок не найден' });

    const uc = await UserCourse.findOne({
      where: { userId: uid, courseId: lesson.courseId }
    });
    if (!uc) return res.status(400).json({ error: 'Вы не записаны на курс' });

    const allLessons = await Lesson.count({ where: { courseId: lesson.courseId, statusId: { [require('sequelize').Op.ne]: 2 } }});
    const total = allLessons || 1;

    const completed = uc.completedLessons || [];
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

// Снять отметку с урока
router.post('/lessons/:id/uncomplete', async (req, res) => {
  const uid = await getUserId(req);
  if (!uid) return res.status(401).json({ error: 'Не авторизован' });
  try {
    const lesson = await Lesson.findByPk(req.params.id, { include: [Course] });
    if (!lesson) return res.status(404).json({ error: 'Урок не найден' });

    const uc = await UserCourse.findOne({
      where: { userId: uid, courseId: lesson.courseId }
    });
    if (!uc) return res.status(400).json({ error: 'Вы не записаны на курс' });

    const allLessons = await Lesson.count({ where: { courseId: lesson.courseId, statusId: { [require('sequelize').Op.ne]: 2 } }});
    const total = allLessons || 1;

    const completed = uc.completedLessons || [];
    const arr = Array.isArray(completed) ? completed : [];
    const idx = arr.indexOf(lesson.id);
    if (idx !== -1) arr.splice(idx, 1);
    const progress = Math.min(100, Math.round((arr.length / total) * 100));
    const status = progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'in_progress';

    await uc.update({
      completedLessons: arr,
      progress,
      status,
      completedAt: status === 'completed' ? new Date() : null
    });

    res.json({ success: true, progress, status });
  } catch (e) {
    console.error('Uncomplete error:', e);
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Миграция данных курсов (заполнение новых полей для существующих записей)
router.post('/migrate', async (req, res) => {
  try {
    const courseData = {
      1: { icon: '🚀', tag: 'beginner', description: 'Собрать работающую систему из инструментов сайта: Эйзенхауэр + Pomodoro + Time Blocking + GTD.', audience: 'Новички и те, кто пробовал всё, но ничего не прижилось', result: 'PDF «Мой спокойный день» + снижение тревожности', isFree: true },
      2: { icon: '🎓', tag: 'student', description: 'Перестать учиться ночью и начать успевать отдыхать.', audience: 'Студенты', result: 'Готовый план на семестр', isFree: true },
      3: { icon: '👨‍👩‍👧‍👦', tag: 'parent', description: 'Совмещать быт, ребёнка и собственные проекты без чувства вины.', audience: 'Родители в декрете', result: 'Система покажет — вы сделали главное', isFree: true },
      4: { icon: '💼', tag: 'work', description: 'Полный GTD, адаптированный под бережное отношение к себе.', audience: 'Работающие и фрилансеры', result: 'Mind like water — спокойный ум', isFree: true },
      5: { icon: '👥', tag: 'work', description: 'Единая логика планирования для семьи или команды.', audience: 'Пары, родители + дети, небольшие команды', result: 'Меньше обид и ссор', isFree: true }
    };
    const results = { courses: 0, lessons: 0 };
    for (const [id, data] of Object.entries(courseData)) {
      const course = await Course.findByPk(parseInt(id));
      if (course) { await course.update(data); results.courses++; }
    }
    const lessons = await Lesson.findAll();
    for (const lesson of lessons) {
      if (!lesson.content || lesson.content === '') {
        lesson.content = '<p>Содержание урока пока не загружено.</p>';
        await lesson.save();
        results.lessons++;
      }
    }
    res.json({ success: true, migrated: results });
  } catch (e) {
    console.error('Migration error:', e);
    res.status(500).json({ error: 'Ошибка миграции' });
  }
});

module.exports = router;
