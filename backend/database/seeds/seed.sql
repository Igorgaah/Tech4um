-- Tech4um Seed Data (Docker init version)
-- Password for all demo users: "senha@123"
-- Hash below is bcrypt(10) for "senha@123" generated with node -e "console.log(require('bcrypt').hashSync('senha@123',10))"
-- To regenerate: cd backend && node -e "const b=require('bcrypt');console.log(b.hashSync('senha@123',10))"
--
-- NOTE: For local dev, prefer running: npm run seed
-- which generates fresh hashes programmatically via bcrypt.

BEGIN;

-- Demo users (password: senha@123)
INSERT INTO users (username, email, password) VALUES
  ('admin', 'admin@tech4um.com',
   '$2b$10$YmVzZW5oYUAxMjMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA.placeholder'),
  ('alice', 'alice@example.com',
   '$2b$10$YmVzZW5oYUAxMjMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA.placeholder'),
  ('bob',   'bob@example.com',
   '$2b$10$YmVzZW5oYUAxMjMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA.placeholder'),
  ('carol', 'carol@example.com',
   '$2b$10$YmVzZW5oYUAxMjMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA.placeholder'),
  ('dave',  'dave@example.com',
   '$2b$10$YmVzZW5oYUAxMjMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA.placeholder')
ON CONFLICT (email) DO NOTHING;

-- Demo forums
INSERT INTO forums (name, description, created_by) VALUES
  ('Geral',          'Discussões gerais sobre tecnologia e programação.',       (SELECT id FROM users WHERE username='admin')),
  ('JavaScript',     'Tudo sobre JS, Node.js, React e o ecossistema frontend.', (SELECT id FROM users WHERE username='admin')),
  ('Python',         'Python, Django, Flask e ciência de dados.',               (SELECT id FROM users WHERE username='alice')),
  ('DevOps',         'Docker, Kubernetes, CI/CD e infraestrutura.',             (SELECT id FROM users WHERE username='admin')),
  ('Banco de Dados', 'SQL, NoSQL, performance e modelagem de dados.',           (SELECT id FROM users WHERE username='bob')),
  ('Segurança',      'Cybersecurity, boas práticas e vulnerabilidades.',        (SELECT id FROM users WHERE username='admin')),
  ('Mobile',         'Android, iOS, React Native e Flutter.',                  (SELECT id FROM users WHERE username='carol')),
  ('Open Source',    'Contribuição em projetos open source.',                  (SELECT id FROM users WHERE username='alice'))
ON CONFLICT (name) DO NOTHING;

-- Demo messages
DO $$
DECLARE
  v_admin  INTEGER := (SELECT id FROM users WHERE username = 'admin');
  v_alice  INTEGER := (SELECT id FROM users WHERE username = 'alice');
  v_bob    INTEGER := (SELECT id FROM users WHERE username = 'bob');
  v_carol  INTEGER := (SELECT id FROM users WHERE username = 'carol');
  v_geral  INTEGER := (SELECT id FROM forums WHERE name = 'Geral');
  v_js     INTEGER := (SELECT id FROM forums WHERE name = 'JavaScript');
  v_py     INTEGER := (SELECT id FROM forums WHERE name = 'Python');
  v_devops INTEGER := (SELECT id FROM forums WHERE name = 'DevOps');
BEGIN
  INSERT INTO messages (forum_id, user_id, content) VALUES
    (v_geral,  v_admin, 'Bem-vindos ao Tech4um! Este é um espaço para compartilhar conhecimento.'),
    (v_geral,  v_alice, 'Olá a todos! Feliz em fazer parte desta comunidade.'),
    (v_geral,  v_bob,   'Alguém tem dicas de recursos para aprender TypeScript?'),
    (v_geral,  v_carol, 'Recomendo o handbook oficial e o canal do Fireship no YouTube!'),
    (v_geral,  v_admin, 'Ótima dica, Carol! Também tem o curso do Rocketseat.'),
    (v_js,     v_alice, 'Alguém está usando Vite nos projetos? Qual a opinião?'),
    (v_js,     v_bob,   'Sim! Vite é incrível, muito mais rápido que o webpack.'),
    (v_js,     v_admin, 'Migrei todos os meus projetos React para Vite. Vale muito a pena.'),
    (v_py,     v_carol, 'Alguma recomendação de lib para validação de dados em Python?'),
    (v_py,     v_alice, 'Pydantic é excelente! Especialmente para APIs com FastAPI.'),
    (v_devops, v_bob,   'Alguém usa Docker Compose em produção? Quais são as limitações?'),
    (v_devops, v_admin, 'Para múltiplas réplicas, vale a pena migrar para Kubernetes.');
END;
$$ LANGUAGE plpgsql;

COMMIT;
