require('./setup');
const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');

const testUser = {
  username: `usertest_${Date.now()}`,
  email: `usertest_${Date.now()}@example.com`,
  password: 'senha123',
};

let authToken;
let userId;

beforeAll(async () => {
  const res = await request(app).post('/api/auth/register').send(testUser);
  authToken = res.body.token;
  userId = res.body.user.id;
});

afterAll(async () => {
  try {
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  } catch (_) {}
});

describe('GET /api/users/search', () => {
  it('deve buscar usuários por username', async () => {
    const q = testUser.username.slice(0, 5);
    const res = await request(app)
      .get(`/api/users/search?q=${q}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(Array.isArray(res.body.users)).toBe(true);
    const found = res.body.users.find((u) => u.username === testUser.username);
    expect(found).toBeTruthy();
  });

  it('deve retornar lista vazia para busca sem resultados', async () => {
    const res = await request(app)
      .get('/api/users/search?q=xxxxxxxxxxxxxxxxxx_nao_existe')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBe(0);
  });

  it('deve retornar lista (busca vazia retorna usuários)', async () => {
    const res = await request(app)
      .get('/api/users/search')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('deve rejeitar requisição sem autenticação', async () => {
    const res = await request(app).get('/api/users/search?q=test');
    expect(res.status).toBe(401);
  });

  it('não deve expor senha nos resultados', async () => {
    const res = await request(app)
      .get(`/api/users/search?q=${testUser.username}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    if (res.body.users.length > 0) {
      res.body.users.forEach((u) => expect(u).not.toHaveProperty('password'));
    }
  });
});

describe('GET /api/users/:id', () => {
  it('deve retornar usuário por id', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.id).toBe(userId);
    expect(res.body.user.username).toBe(testUser.username);
  });

  it('não deve expor senha', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('deve retornar 404 para usuário inexistente', async () => {
    const res = await request(app)
      .get('/api/users/999999')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  it('deve rejeitar requisição sem autenticação', async () => {
    const res = await request(app).get(`/api/users/${userId}`);
    expect(res.status).toBe(401);
  });
});
