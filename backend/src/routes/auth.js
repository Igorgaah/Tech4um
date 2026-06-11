const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimiter');

const registerRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Nome de usuário deve ter entre 3 e 30 caracteres.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Nome de usuário só pode conter letras, números e underscores.'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('E-mail inválido.'),
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Senha deve ter no mínimo 6 caracteres.'),
];

const loginRules = [
  body('email').trim().isEmail().normalizeEmail().withMessage('E-mail inválido.'),
  body('password').notEmpty().withMessage('Senha é obrigatória.'),
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a new user account and returns a JWT token. Rate-limited to 20 requests per 15 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 pattern: '^[a-zA-Z0-9_]+$'
 *                 example: alice_dev
 *               email:
 *                 type: string
 *                 format: email
 *                 example: alice@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 maxLength: 100
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthToken'
 *             example:
 *               message: Usuário registrado com sucesso!
 *               user:
 *                 id: 6
 *                 username: alice_dev
 *                 email: alice@example.com
 *                 avatar_url: null
 *                 created_at: '2024-06-11T12:00:00.000Z'
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Username or email already taken
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Nome de usuário ou e-mail já está em uso.
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', authLimiter, registerRules, validate, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     description: Authenticates a user and returns a JWT token. Rate-limited to 20 requests per 15 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: alice@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthToken'
 *             example:
 *               message: Login realizado com sucesso!
 *               user:
 *                 id: 1
 *                 username: alice
 *                 email: alice@example.com
 *                 avatar_url: null
 *                 created_at: '2024-01-15T10:30:00.000Z'
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Credenciais inválidas.
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', authLimiter, loginRules, validate, authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current user
 *     description: >
 *       Stateless logout — the server does not maintain a token blocklist.
 *       The client is responsible for discarding the JWT token.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout acknowledged
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout realizado com sucesso.
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     description: Returns the profile of the user identified by the Bearer token.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               user:
 *                 id: 1
 *                 username: alice
 *                 email: alice@example.com
 *                 avatar_url: null
 *                 created_at: '2024-01-15T10:30:00.000Z'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', authenticate, authController.me);

module.exports = router;
