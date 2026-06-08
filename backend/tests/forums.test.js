require('./setup');
const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');

const testUser = {
  username: `forumuser_${Date.now()}`,
  email: `forum_${Date.now()}@example.com`,
  password: 'senha123',
};

let authToken;
let createdForumId;
const forumName = `Forum Test ${Date.now()}`;

beforeAll(async () => {
  const res = await request(app).post('/api/auth/register').send(testUser);
  authToken = res.body.token;
});

afterAll(async () => {
  try {
    if (createdForumId) {
      await pool.query('DELETE FROM forums WHERE id = $1', [createdForumId]);
    }
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  } catch (_) {}
});

describe('GET /api/forums', () => {
  it('deve listar fóruns para usuário autenticado', async () => {
    const res = await request(app)
      .get('/api/forums')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('forums');
    expect(Array.isArray(res.body.forums)).toBe(true);
  });

  it('deve rejeitar listagem sem autenticação', async () => {
    const res = await request(app).get('/api/forums');
    expect(res.status).toBe(401);
  });

  it('deve filtrar fóruns por busca', async () => {
    const res = await request(app)
      .get('/api/forums?search=javascript')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
  });
});

describe('POST /api/forums', () => {
  it('deve criar fórum com sucesso', async () => {
    const res = await request(app)
      .post('/api/forums')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: forumName, description: 'Descrição de teste' });
    expect(res.status).toBe(201);
    expect(res.body.forum.name).toBe(forumName);
    createdForumId = res.body.forum.id;
  });

  it('deve rejeitar nome duplicado', async () => {
    const res = await request(app)
      .post('/api/forums')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: forumName });
    expect(res.status).toBe(409);
  });

  it('deve rejeitar nome muito curto', async () => {
    const res = await request(app)
      .post('/api/forums')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'ab' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/forums/:id', () => {
  it('deve retornar fórum por id', async () => {
    const res = await request(app)
      .get(`/api/forums/${createdForumId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.forum.id).toBe(createdForumId);
  });

  it('deve retornar 404 para fórum inexistente', async () => {
    const res = await request(app)
      .get('/api/forums/999999')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });
});
