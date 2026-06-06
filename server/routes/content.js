const express = require('express');
const router = express.Router();
const { GlossaryTerm, Method, Template, Role, User } = require('../db');

async function isAdmin(req) {
  if (!req.session?.userId) return false;
  const user = await User.findByPk(req.session.userId, { include: [Role], attributes: ['id', 'roleId'] });
  if (!user) return false;
  return user.Role?.name === 'Администратор';
}

async function adminOnly(req, res, next) {
  if (await isAdmin(req)) return next();
  res.status(403).json({ error: 'Доступ только администратору' });
}

// ---- Glossary Terms ----

router.get('/glossary', async (req, res) => {
  try {
    const terms = await GlossaryTerm.findAll({ order: [['term', 'ASC']] });
    res.json({ terms });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка загрузки глоссария' });
  }
});

router.post('/glossary', adminOnly, async (req, res) => {
  try {
    const { term, def, example, link, linkText } = req.body;
    if (!term || !def) return res.status(400).json({ error: 'term и def обязательны' });
    const t = await GlossaryTerm.create({ term, def, example, link, linkText });
    res.json({ success: true, term: t });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка создания термина' });
  }
});

router.put('/glossary/:id', adminOnly, async (req, res) => {
  try {
    const t = await GlossaryTerm.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Термин не найден' });
    const { term, def, example, link, linkText } = req.body;
    await t.update({ term, def, example, link, linkText });
    res.json({ success: true, term: t });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

router.delete('/glossary/:id', adminOnly, async (req, res) => {
  try {
    const t = await GlossaryTerm.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Термин не найден' });
    await t.destroy();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// ---- Methods ----

router.get('/methods', async (req, res) => {
  try {
    const methods = await Method.findAll({ order: [['id', 'ASC']] });
    res.json({ methods });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка загрузки методов' });
  }
});

router.post('/methods', adminOnly, async (req, res) => {
  try {
    const { slug, name, desc, stars, tags, time, details } = req.body;
    if (!slug || !name) return res.status(400).json({ error: 'slug и name обязательны' });
    const m = await Method.create({ slug, name, desc, stars: stars || 3, tags: tags || [], time, details });
    res.json({ success: true, method: m });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка создания метода' });
  }
});

router.put('/methods/:id', adminOnly, async (req, res) => {
  try {
    const m = await Method.findByPk(req.params.id);
    if (!m) return res.status(404).json({ error: 'Метод не найден' });
    const { slug, name, desc, stars, tags, time, details } = req.body;
    await m.update({ slug, name, desc, stars, tags, time, details });
    res.json({ success: true, method: m });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

router.delete('/methods/:id', adminOnly, async (req, res) => {
  try {
    const m = await Method.findByPk(req.params.id);
    if (!m) return res.status(404).json({ error: 'Метод не найден' });
    await m.destroy();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// ---- Templates ----

router.get('/templates', async (req, res) => {
  try {
    const templates = await Template.findAll({ order: [['id', 'ASC']] });
    res.json({ templates });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка загрузки шаблонов' });
  }
});

router.post('/templates', adminOnly, async (req, res) => {
  try {
    const { icon, name, desc, size, content } = req.body;
    if (!name || !desc) return res.status(400).json({ error: 'name и desc обязательны' });
    const t = await Template.create({ icon: icon || '📄', name, desc, size, content });
    res.json({ success: true, template: t });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка создания шаблона' });
  }
});

router.put('/templates/:id', adminOnly, async (req, res) => {
  try {
    const t = await Template.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Шаблон не найден' });
    const { icon, name, desc, size, content } = req.body;
    await t.update({ icon, name, desc, size, content });
    res.json({ success: true, template: t });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

router.delete('/templates/:id', adminOnly, async (req, res) => {
  try {
    const t = await Template.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Шаблон не найден' });
    await t.destroy();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

module.exports = router;
