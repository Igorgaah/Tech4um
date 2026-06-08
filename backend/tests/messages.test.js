require('./setup');
const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/database');

const userA = {
  username: `msguser_a_${Date.now()}`,
  email: `msga_${Date.now()}@example.com`,
  password: 'senha123',
};
const userB = {
  username: `msguser_b_${Date.now()}`,
  email: `msgb_${Date.now()}@example.com`,
  password: 'senha123',
};

let tokenA, tokenB, userAId, userBId, forumId;

beforeAll(async () => {
  const resA = await request(app).post('/api/auth/register').send(userA);
  tokenA = resA.body.token;
  userAId = resA.body.user.id;

  const resB = await request(app).post('/api/auth/register').send(userB);
  tokenB = resB.body.token;
  userBId = resB.body.user.id;

  const resF = await request(app)
    .post('/api/forums')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ name: `MsgForum_${Date.now()}`, description: 'Test forum' });
  forumId = resF.body.forum.id;
});

afterAll(async () => {
  try {
    await pool.query('DELETE FROM forums WHERE id = $1', [forumId]);
    await pool.query('DELETE FROM users WHERE email = ANY($1::text[])', [[userA.email, userB.email]]);
  } catch (_) {}
});

describe('POST /api/messages/forums/:forumId', () => {
  it('deve enviar mensagem pública', async () => {
    const res = await request(app)
      .post(`/api/messages/forums/${forumId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'Olá a todos!' });
    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe('Olá a todos!');
    expect(res.body.data.is_private).toBe(false);
  });

  it('deve enviar mensagem privada', async () => {
    const res = await request(app)
      .post(`/api/messages/forums/${forumId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'Mensagem secreta', isPrivate: true, recipientId: userBId });
    expect(res.status).toBe(201);
    expect(res.body.data.is_private).toBe(true);
    expect(res.body.data.recipient_id).toBe(userBId);
  });

  it('deve rejeitar mensagem vazia', async () => {
    const res = await request(app)
      .post(`/api/messages/forums/${forumId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: '' });
    expect(res.status).toBe(422);
  });

  it('deve rejeitar mensagem privada sem destinatário', async () => {
    const res = await request(app)
      .post(`/api/messages/forums/${forumId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'sem dest', isPrivate: true });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/messages/forums/:forumId', () => {
  it('deve listar mensagens do fórum', async () => {
    const res = await request(app)
      .get(`/api/messages/forums/${forumId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.messages)).toBe(true);
  });

  it('deve retornar 404 para fórum inexistente', async () => {
    const res = await request(app)
      .get('/api/messages/forums/999999')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(404);
  });
});
