require('dotenv').config({ path: '.env.test' });
// Use test database or same db with test prefix
process.env.NODE_ENV = 'test';
