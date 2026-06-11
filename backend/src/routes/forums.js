const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const forumController = require('../controllers/forumController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

const createRules = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome do fórum deve ter entre 3 e 100 caracteres.'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres.'),
];

router.use(authenticate);

/**
 * @swagger
 * /api/forums:
 *   get:
 *     tags: [Forums]
 *     summary: List all forums
 *     description: Returns a paginated, searchable list of forum boards. Supports full-text search via PostgreSQL GIN index.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Full-text search term (searches name and description)
 *         example: javascript
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of forums to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of forums to skip (for pagination)
 *     responses:
 *       200:
 *         description: Paginated list of forums
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedForums'
 *             example:
 *               forums:
 *                 - id: 1
 *                   name: General Discussion
 *                   description: Talk about anything tech.
 *                   created_by: 1
 *                   creator_username: alice
 *                   created_at: '2024-01-15T10:30:00.000Z'
 *                 - id: 2
 *                   name: JavaScript
 *                   description: All things JS.
 *                   created_by: 2
 *                   creator_username: bob
 *                   created_at: '2024-01-15T11:00:00.000Z'
 *               total: 8
 *               limit: 20
 *               offset: 0
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', forumController.list);

/**
 * @swagger
 * /api/forums/{id}:
 *   get:
 *     tags: [Forums]
 *     summary: Get a forum by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Forum ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Forum details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 forum:
 *                   $ref: '#/components/schemas/Forum'
 *             example:
 *               forum:
 *                 id: 1
 *                 name: General Discussion
 *                 description: Talk about anything tech.
 *                 created_by: 1
 *                 creator_username: alice
 *                 created_at: '2024-01-15T10:30:00.000Z'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Forum not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Fórum não encontrado.
 */
router.get('/:id', forumController.getOne);

/**
 * @swagger
 * /api/forums:
 *   post:
 *     tags: [Forums]
 *     summary: Create a new forum
 *     description: Creates a new forum board. The authenticated user becomes the creator.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: React & Next.js
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 example: Discussion about React and Next.js ecosystem.
 *     responses:
 *       201:
 *         description: Forum created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fórum criado com sucesso!
 *                 forum:
 *                   $ref: '#/components/schemas/Forum'
 *             example:
 *               message: Fórum criado com sucesso!
 *               forum:
 *                 id: 9
 *                 name: React & Next.js
 *                 description: Discussion about React and Next.js ecosystem.
 *                 created_by: 1
 *                 creator_username: alice
 *                 created_at: '2024-06-11T12:00:00.000Z'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Forum name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Já existe um fórum com esse nome.
 */
router.post('/', createRules, validate, forumController.create);

module.exports = router;
