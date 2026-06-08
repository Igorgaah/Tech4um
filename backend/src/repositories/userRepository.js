const db = require('../config/database');

async function findById(id) {
  const result = await db.query(
    'SELECT id, username, email, avatar_url, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function findByEmail(email) {
  const result = await db.query(
    'SELECT id, username, email, password, avatar_url, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

async function findByUsername(username) {
  const result = await db.query(
    'SELECT id, username, email, avatar_url, created_at FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0] || null;
}

async function create({ username, email, password }) {
  const result = await db.query(
    `INSERT INTO users (username, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, avatar_url, created_at`,
    [username, email, password]
  );
  return result.rows[0];
}

async function findManyByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const result = await db.query(
    'SELECT id, username, avatar_url FROM users WHERE id = ANY($1::int[])',
    [ids]
  );
  return result.rows;
}

async function searchByUsername(query, limit = 20) {
  const result = await db.query(
    `SELECT id, username, avatar_url FROM users
     WHERE username ILIKE $1
     ORDER BY username
     LIMIT $2`,
    [`%${query}%`, limit]
  );
  return result.rows;
}

module.exports = { findById, findByEmail, findByUsername, create, findManyByIds, searchByUsername };
