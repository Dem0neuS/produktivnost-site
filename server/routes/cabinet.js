const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../db');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  next();
}

router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      attributes: ['id', 'name', 'email', 'theme', 'createdAt']
    });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки профиля' });
  }
});

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ error: 'Email уже используется' });
      user.email = email;
      req.session.userEmail = email;
    }
    if (name) {
      user.name = name;
      req.session.userName = name;
    }
    await user.save();
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, theme: user.theme } });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
});

router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Заполните оба поля' });
    }
    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'Новый пароль должен быть не менее 4 символов' });
    }
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Неверный текущий пароль' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка смены пароля' });
  }
});

module.exports = router;
