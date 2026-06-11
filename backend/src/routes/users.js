const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     tags: [Users]
 *     summary: Search users by username
 *     description: Returns up to 20 users whose username contains the search term (case-insensitive). Useful for selecting a private message recipient.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Username search term
 *         example: ali
 *     responses:
 *       200:
 *         description: List of matching users (max 20)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *             example:
 *               users:
 *                 - id: 1
 *                   username: alice
 *                   email: alice@example.com
 *                   avatar_url: null
 *                   created_at: '2024-01-15T10:30:00.000Z'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', userController.search);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User profile
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
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Usuário não encontrado.
 */
router.get('/:id', userController.getById);

module.exports = router;
