const db = require('../config/database');

async function findAll({ search = '', limit = 50, offset = 0 } = {}) {
  const result = await db.query(
    `SELECT
       f.id, f.name, f.description, f.created_at,
       u.id AS creator_id, u.username AS creator_username,
       COUNT(DISTINCT m.id)::int AS message_count
     FROM forums f
     LEFT JOIN users u ON u.id = f.created_by
     LEFT JOIN messages m ON m.forum_id = f.id
     WHERE ($1 = '' OR f.name ILIKE $1 OR f.description ILIKE $1)
     GROUP BY f.id, u.id, u.username
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [search ? `%${search}%` : '', limit, offset]
  );
  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    `SELECT
       f.id, f.name, f.description, f.created_at,
       u.id AS creator_id, u.username AS creator_username,
       COUNT(DISTINCT m.id)::int AS message_count
     FROM forums f
     LEFT JOIN users u ON u.id = f.created_by
     LEFT JOIN messages m ON m.forum_id = f.id
     WHERE f.id = $1
     GROUP BY f.id, u.id, u.username`,
    [id]
  );
  return result.rows[0] || null;
}

async function findByName(name) {
  const result = await db.query('SELECT id FROM forums WHERE LOWER(name) = LOWER($1)', [name]);
  return result.rows[0] || null;
}

async function create({ name, description, createdBy }) {
  const result = await db.query(
    `INSERT INTO forums (name, description, created_by)
     VALUES ($1, $2, $3)
     RETURNING id, name, description, created_at`,
    [name, description || null, createdBy]
  );
  return result.rows[0];
}

async function count(search = '') {
  const result = await db.query(
    `SELECT COUNT(*)::int AS total FROM forums
     WHERE ($1 = '' OR name ILIKE $1 OR description ILIKE $1)`,
    [search ? `%${search}%` : '']
  );
  return result.rows[0].total;
}

module.exports = { findAll, findById, findByName, create, count };
