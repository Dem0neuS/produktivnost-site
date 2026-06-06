const express = require('express');
const bcrypt = require('bcryptjs');
const { Role, User } = require('../db');

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
    const userRole = await Role.findOne({ where: { name: 'Пользователь' } });
    const user = await User.create({ name, email, password: hashedPassword, roleId: userRole?.id || null });
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userName = user.name;
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, theme: user.theme, roleId: user.roleId, role: 'Пользователь' } });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
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
    const user = await User.findOne({ where: { email }, include: [Role] });
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
    user.lastActiveAt = new Date();
    await user.save();
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, theme: user.theme, roleId: user.roleId, role: user.Role?.name } });
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

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Введите email' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.json({ success: true, message: 'Если пользователь с таким email существует, ссылка для сброса отправлена' });
    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    user.resetToken = token;
    user.resetTokenExpires = new Date(Date.now() + 3600000);
    await user.save();
    res.json({ success: true, token, message: 'В демо-режиме код сброса показан ниже. В реальном проекте он был бы отправлен на email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ error: 'Все поля обязательны' });
    if (newPassword.length < 4) return res.status(400).json({ error: 'Пароль должен быть не менее 4 символов' });
    const user = await User.findOne({ where: { email, resetToken: token } });
    if (!user || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ error: 'Неверный или просроченный код сброса' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();
    res.json({ success: true, message: 'Пароль успешно изменён' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }
  try {
    const user = await User.findByPk(req.session.userId, { include: [Role], attributes: ['id', 'name', 'email', 'theme', 'roleId', 'lastActiveAt'] });
    if (user) {
      user.lastActiveAt = new Date();
      await user.save();
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email, theme: user.theme, roleId: user.roleId, role: user.Role?.name } });
  } catch (err) {
    res.json({ user: null });
  }
});

module.exports = router;
