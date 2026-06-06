const express = require('express');
const { Sequelize } = require('sequelize');
const { User, TestResult, Role } = require('../db');
const Op = Sequelize.Op;

const router = express.Router();

function adminOnly(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Не авторизован' });
  User.findByPk(req.session.userId, { include: [Role] }).then(user => {
    if (!user || user.Role?.name !== 'Администратор') return res.status(403).json({ error: 'Доступ запрещён' });
    next();
  }).catch(() => res.status(500).json({ error: 'Ошибка' }));
}

router.get('/stats', adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({
      where: { lastActiveAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    });
    const totalTests = await TestResult.count();
    res.json({ totalUsers, activeUsers, totalTests });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки статистики' });
  }
});

module.exports = router;
