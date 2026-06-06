const express = require('express');
const { Op } = require('sequelize');
const { ContentBlock, Role, User } = require('../db');

const router = express.Router();

function adminOnly(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Не авторизован' });
  User.findByPk(req.session.userId, { include: [Role] }).then(user => {
    if (!user || user.Role?.name !== 'Администратор') return res.status(403).json({ error: 'Доступ запрещён' });
    next();
  }).catch(() => res.status(500).json({ error: 'Ошибка' }));
}

router.get('/:page', async (req, res) => {
  try {
    const blocks = await ContentBlock.findAll({
      where: { page: req.params.page },
      order: [['sortOrder', 'ASC']]
    });
    res.json({ blocks });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки' });
  }
});

router.post('/:page', adminOnly, async (req, res) => {
  try {
    const { section, title, content, sortOrder } = req.body;
    const [block, created] = await ContentBlock.findOrCreate({
      where: { page: req.params.page, section },
      defaults: { page: req.params.page, section, title, content, sortOrder: sortOrder || 0 }
    });
    if (!created) {
      block.title = title;
      block.content = content;
      if (sortOrder !== undefined) block.sortOrder = sortOrder;
      await block.save();
    }
    res.json({ block });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сохранения' });
  }
});

router.put('/:page/:id', adminOnly, async (req, res) => {
  try {
    const block = await ContentBlock.findByPk(req.params.id);
    if (!block) return res.status(404).json({ error: 'Не найдено' });
    const { title, content, sortOrder } = req.body;
    if (title !== undefined) block.title = title;
    if (content !== undefined) block.content = content;
    if (sortOrder !== undefined) block.sortOrder = sortOrder;
    await block.save();
    res.json({ block });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

router.delete('/:page/:id', adminOnly, async (req, res) => {
  try {
    await ContentBlock.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

module.exports = router;
