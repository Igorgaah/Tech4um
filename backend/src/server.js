require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./socket/socketManager');
const { pool } = require('./config/database');

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

async function start() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected');

    server.listen(PORT, () => {
      console.log(`🚀 Tech4um API running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 WebSocket server ready`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});

start();

module.exports = server;
