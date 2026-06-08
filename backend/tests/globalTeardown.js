// Closes the pg pool after all test suites finish
module.exports = async () => {
  const { pool } = require('../src/config/database');
  await pool.end().catch(() => {});
};
