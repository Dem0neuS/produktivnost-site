const assert = require('node:assert');
const request = require('supertest');
const app = require('../server/index');

describe('API тесты', function() {
  this.timeout(10000);
  let agent;
  const testUser = { name: 'Test', email: 'test-' + Date.now() + '@test.ru', password: 'test1234' };

  before(() => {
    agent = request.agent(app);
  });

  it('GET /api/auth/me — не авторизован', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user, null);
  });

  it('POST /api/auth/register — регистрация', async () => {
    const res = await agent
      .post('/api/auth/register')
      .send(testUser);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.name, testUser.name);
    assert.strictEqual(res.body.user.email, testUser.email);
  });

  it('GET /api/auth/me — авторизован после регистрации', async () => {
    const res = await agent.get('/api/auth/me');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.user);
    assert.strictEqual(res.body.user.email, testUser.email);
  });

  it('GET /api/cabinet/profile — профиль', async () => {
    const res = await agent.get('/api/cabinet/profile');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.email, testUser.email);
  });

  it('PUT /api/cabinet/profile — обновление имени', async () => {
    const newName = 'Updated ' + Date.now();
    const res = await agent
      .put('/api/cabinet/profile')
      .send({ name: newName });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.name, newName);
  });

  it('GET / — главная страница', async () => {
    const res = await request(app).get('/');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Продуктивность'));
  });

  it('GET /nonexistent — 404 ошибка', async () => {
    const res = await request(app).get('/nonexistent');
    assert.strictEqual(res.status, 404);
  });

  it('POST /api/auth/register — дубликат email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    assert.notStrictEqual(res.status, 200);
    assert.ok(res.body.error);
  });

  it('POST /api/auth/login — неверный пароль', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrong' });
    assert.notStrictEqual(res.status, 200);
    assert.ok(res.body.error);
  });

  it('GET /pomodoro — страница таймера', async () => {
    const res = await request(app).get('/pomodoro');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Pomodoro'));
  });
});
