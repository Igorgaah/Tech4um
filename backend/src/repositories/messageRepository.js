const db = require('../config/database');

async function findByForum(forumId, { limit = 100, offset = 0, userId } = {}) {
  // Returns public messages + private messages where current user is sender or recipient
  const result = await db.query(
    `SELECT
       m.id, m.forum_id, m.content, m.is_private, m.created_at,
       sender.id   AS user_id,       sender.username   AS username,
       sender.avatar_url             AS avatar_url,
       recipient.id AS recipient_id, recipient.username AS recipient_username
     FROM messages m
     JOIN users sender ON sender.id = m.user_id
     LEFT JOIN users recipient ON recipient.id = m.recipient_id
     WHERE m.forum_id = $1
       AND (
         m.is_private = FALSE
         OR (m.is_private = TRUE AND (m.user_id = $4 OR m.recipient_id = $4))
       )
     ORDER BY m.created_at ASC
     LIMIT $2 OFFSET $3`,
    [forumId, limit, offset, userId]
  );
  return result.rows;
}

async function create({ forumId, userId, content, isPrivate = false, recipientId = null }) {
  const result = await db.query(
    `INSERT INTO messages (forum_id, user_id, content, is_private, recipient_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, forum_id, user_id, content, is_private, recipient_id, created_at`,
    [forumId, userId, content, isPrivate, recipientId || null]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await db.query(
    `SELECT
       m.id, m.forum_id, m.content, m.is_private, m.created_at,
       sender.id   AS user_id,       sender.username   AS username,
       sender.avatar_url             AS avatar_url,
       recipient.id AS recipient_id, recipient.username AS recipient_username
     FROM messages m
     JOIN users sender ON sender.id = m.user_id
     LEFT JOIN users recipient ON recipient.id = m.recipient_id
     WHERE m.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function countByForum(forumId) {
  const result = await db.query(
    'SELECT COUNT(*)::int AS total FROM messages WHERE forum_id = $1 AND is_private = FALSE',
    [forumId]
  );
  return result.rows[0].total;
}

module.exports = { findByForum, create, findById, countByForum };
