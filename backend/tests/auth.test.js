require('./setup');
const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');

const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'senha123',
};

let authToken;

afterAll(async () => {
  try {
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  } catch (_) {}
  // pool.end() not called here — Jest --forceExit handles cleanup
});

describe('POST /api/auth/register', () => {
  it('deve registrar um novo usuário com sucesso', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe(testUser.username);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('deve rejeitar e-mail duplicado', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('deve rejeitar senha muito curta', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', email: 'new@test.com', password: '123' });
    expect(res.status).toBe(422);
  });

  it('deve rejeitar e-mail inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', email: 'not-an-email', password: 'senha123' });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  it('deve fazer login com credenciais corretas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    authToken = res.body.token;
  });

  it('deve rejeitar senha incorreta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('deve rejeitar e-mail inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nao_existe@example.com', password: 'senha123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('deve retornar o perfil do usuário autenticado', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('deve rejeitar requisição sem token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('deve rejeitar token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token_invalido_aqui');
    expect(res.status).toBe(401);
  });
});
