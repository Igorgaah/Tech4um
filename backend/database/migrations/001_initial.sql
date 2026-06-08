-- Tech4um Database Schema
-- Migration 001 - Initial Schema

BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(30)  UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forums (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id           SERIAL PRIMARY KEY,
    forum_id     INTEGER NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
    user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content      TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
    is_private   BOOLEAN NOT NULL DEFAULT FALSE,
    recipient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Private message constraint: recipient required when private
ALTER TABLE messages ADD CONSTRAINT chk_private_has_recipient
    CHECK (is_private = FALSE OR recipient_id IS NOT NULL);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_forum_id    ON messages(forum_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id     ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at  ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forums_name          ON forums USING gin(to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_users_email          ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username       ON users(username);

COMMIT;
