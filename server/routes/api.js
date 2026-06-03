const express = require('express');
const { Habit, TestResult, GlossaryFavorite, MicroStep, User } = require('../db');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  next();
}

router.get('/sync', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const habits = await Habit.findAll({ where: { userId } });
    const testResults = await TestResult.findAll({ where: { userId } });
    const favorites = await GlossaryFavorite.findAll({ where: { userId } });
    const microSteps = await MicroStep.findAll({ where: { userId } });
    const user = await User.findByPk(userId, { attributes: ['theme'] });
    res.json({ habits, testResults, favorites, microSteps, theme: user.theme });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка синхронизации' });
  }
});

router.post('/habits', requireAuth, async (req, res) => {
  try {
    const { name, days, completed } = req.body;
    const habit = await Habit.create({ userId: req.session.userId, name, days: days || [], completed: completed || {} });
    res.json({ success: true, habit });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сохранения привычки' });
  }
});

router.put('/habits/:id', requireAuth, async (req, res) => {
  try {
    const { name, days, completed } = req.body;
    const habit = await Habit.findOne({ where: { id: req.params.id, userId: req.session.userId } });
    if (!habit) return res.status(404).json({ error: 'Не найдено' });
    if (name !== undefined) habit.name = name;
    if (days !== undefined) habit.days = days;
    if (completed !== undefined) habit.completed = completed;
    await habit.save();
    res.json({ success: true, habit });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

router.delete('/habits/:id', requireAuth, async (req, res) => {
  try {
    await Habit.destroy({ where: { id: req.params.id, userId: req.session.userId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

router.post('/habits/sync', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { habits } = req.body;
    await Habit.destroy({ where: { userId } });
    const created = await Habit.bulkCreate(habits.map(h => ({ userId, name: h.name, days: h.days || [], completed: h.completed || {} })));
    res.json({ success: true, habits: created });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка синхронизации привычек' });
  }
});

router.post('/test-results', requireAuth, async (req, res) => {
  try {
    const { testType, result } = req.body;
    const existing = await TestResult.findOne({ where: { userId: req.session.userId, testType } });
    if (existing) {
      existing.result = result;
      await existing.save();
      return res.json({ success: true, testResult: existing });
    }
    const testResult = await TestResult.create({ userId: req.session.userId, testType, result });
    res.json({ success: true, testResult });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сохранения результата' });
  }
});

router.post('/favorites', requireAuth, async (req, res) => {
  try {
    const { term } = req.body;
    const existing = await GlossaryFavorite.findOne({ where: { userId: req.session.userId, term } });
    if (existing) {
      await existing.destroy();
      return res.json({ success: true, favorite: null, removed: true });
    }
    const fav = await GlossaryFavorite.create({ userId: req.session.userId, term });
    res.json({ success: true, favorite: fav, removed: false });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});

router.post('/theme', requireAuth, async (req, res) => {
  try {
    const { theme } = req.body;
    await User.update({ theme }, { where: { id: req.session.userId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});

router.post('/micro-steps', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { count, weekStart } = req.body;
    const existing = await MicroStep.findOne({ where: { userId, weekStart } });
    if (existing) {
      existing.count = count;
      await existing.save();
      return res.json({ success: true, microStep: existing });
    }
    const microStep = await MicroStep.create({ userId, count, weekStart });
    res.json({ success: true, microStep });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка' });
  }
});

module.exports = router;
