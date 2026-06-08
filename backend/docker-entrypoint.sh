#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USER:-tech4um_user}" 2>/dev/null; do
  sleep 1
done
echo "✅ PostgreSQL is ready"

echo "🔄 Running migrations..."
node database/migrate.js

echo "🌱 Running seeds..."
node database/seed.js

echo "🚀 Starting Tech4um API..."
exec node src/server.js
