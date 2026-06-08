require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('../src/config/database');

const DEFAULT_PASSWORD = 'senha123';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

async function seed() {
  console.log('🌱 Running seeds...');

  const hash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  console.log('  → Hashing passwords...');

  // Users
  const userResults = await Promise.all([
    pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1,$2,$3)
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
       RETURNING id, username`,
      ['admin', 'admin@tech4um.com', hash]
    ),
    pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1,$2,$3)
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
       RETURNING id, username`,
      ['alice', 'alice@example.com', hash]
    ),
    pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1,$2,$3)
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
       RETURNING id, username`,
      ['bob', 'bob@example.com', hash]
    ),
    pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1,$2,$3)
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
       RETURNING id, username`,
      ['carol', 'carol@example.com', hash]
    ),
    pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1,$2,$3)
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
       RETURNING id, username`,
      ['dave', 'dave@example.com', hash]
    ),
  ]);

  const users = userResults.map((r) => r.rows[0]);
  console.log(`  → Seeded ${users.length} users`);

  const [admin, alice, bob, carol, dave] = users;

  // Forums
  const forums = [
    { name: 'Geral', description: 'Discussões gerais sobre tecnologia e programação.', createdBy: admin.id },
    { name: 'JavaScript', description: 'Tudo sobre JS, Node.js, React e o ecossistema front-end.', createdBy: admin.id },
    { name: 'Python', description: 'Python, Django, Flask e ciência de dados.', createdBy: alice.id },
    { name: 'DevOps', description: 'Docker, Kubernetes, CI/CD e infraestrutura.', createdBy: admin.id },
    { name: 'Banco de Dados', description: 'SQL, NoSQL, performance e modelagem de dados.', createdBy: bob.id },
    { name: 'Segurança', description: 'Cybersecurity, boas práticas e vulnerabilidades.', createdBy: admin.id },
    { name: 'Mobile', description: 'Android, iOS, React Native e Flutter.', createdBy: carol.id },
    { name: 'Open Source', description: 'Contribuição em projetos open source.', createdBy: alice.id },
  ];

  const forumIds = {};
  for (const f of forums) {
    const res = await pool.query(
      `INSERT INTO forums (name, description, created_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
       RETURNING id, name`,
      [f.name, f.description, f.createdBy]
    );
    forumIds[f.name] = res.rows[0].id;
  }
  console.log(`  → Seeded ${forums.length} forums`);

  // Messages
  const messages = [
    { forumId: forumIds['Geral'], userId: admin.id, content: 'Bem-vindos ao Tech4um! Este é um espaço para compartilhar conhecimento.' },
    { forumId: forumIds['Geral'], userId: alice.id, content: 'Olá a todos! Feliz em fazer parte desta comunidade.' },
    { forumId: forumIds['Geral'], userId: bob.id,   content: 'Alguém tem dicas de recursos para aprender TypeScript?' },
    { forumId: forumIds['Geral'], userId: carol.id, content: 'Recomendo o handbook oficial e o canal do Fireship no YouTube!' },
    { forumId: forumIds['Geral'], userId: admin.id, content: 'Ótima dica, Carol! Também tem o curso do Rocketseat.' },
    { forumId: forumIds['JavaScript'], userId: alice.id, content: 'Alguém está usando Vite nos projetos? Qual a opinião?' },
    { forumId: forumIds['JavaScript'], userId: bob.id,   content: 'Sim! Vite é incrível, muito mais rápido que o webpack.' },
    { forumId: forumIds['JavaScript'], userId: admin.id, content: 'Migrei todos os meus projetos React para Vite. Vale muito a pena.' },
    { forumId: forumIds['Python'],     userId: carol.id, content: 'Alguma recomendação de lib para validação de dados em Python?' },
    { forumId: forumIds['Python'],     userId: alice.id, content: 'Pydantic é excelente! Especialmente para APIs com FastAPI.' },
    { forumId: forumIds['DevOps'],     userId: dave.id,  content: 'Alguém usa Docker Compose em produção? Quais são as limitações?' },
    { forumId: forumIds['DevOps'],     userId: admin.id, content: 'Para produção com múltiplas réplicas, vale a pena migrar para Kubernetes.' },
  ];

  for (const m of messages) {
    await pool.query(
      `INSERT INTO messages (forum_id, user_id, content) VALUES ($1, $2, $3)`,
      [m.forumId, m.userId, m.content]
    );
  }
  console.log(`  → Seeded ${messages.length} messages`);

  await pool.end();
  console.log(`\n✅ Seeding complete!`);
  console.log(`   Default password for all users: ${DEFAULT_PASSWORD}`);
  console.log(`   Quick login: admin@tech4um.com / ${DEFAULT_PASSWORD}`);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
