const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'Пароль должен быть не менее 4 символов' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userName = user.name;
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, theme: user.theme } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Введите email и пароль' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userName = user.name;
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, theme: user.theme } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }
  try {
    const user = await User.findByPk(req.session.userId, { attributes: ['id', 'name', 'email', 'theme'] });
    res.json({ user });
  } catch (err) {
    res.json({ user: null });
  }
});

module.exports = router;
