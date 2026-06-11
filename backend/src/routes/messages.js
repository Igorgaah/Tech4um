const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const messageController = require('../controllers/messageController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

const messageRules = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Mensagem deve ter entre 1 e 2000 caracteres.'),
  body('isPrivate').optional().isBoolean(),
  body('recipientId').optional({ nullable: true }).isInt({ min: 1 }),
];

router.use(authenticate);

/**
 * @swagger
 * /api/messages/forums/{forumId}:
 *   get:
 *     tags: [Messages]
 *     summary: Get message history for a forum
 *     description: >
 *       Returns paginated messages for a forum. Private messages are filtered:
 *       a user only sees private messages where they are the sender or recipient.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Forum ID
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 200
 *           default: 50
 *         description: Maximum number of messages to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of messages to skip (for pagination)
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *             example:
 *               messages:
 *                 - id: 1
 *                   forum_id: 1
 *                   user_id: 1
 *                   username: alice
 *                   avatar_url: null
 *                   content: Welcome to the forum!
 *                   is_private: false
 *                   recipient_id: null
 *                   recipient_username: null
 *                   created_at: '2024-01-15T10:35:00.000Z'
 *                 - id: 2
 *                   forum_id: 1
 *                   user_id: 2
 *                   username: bob
 *                   avatar_url: null
 *                   content: Hey alice, nice to be here!
 *                   is_private: true
 *                   recipient_id: 1
 *                   recipient_username: alice
 *                   created_at: '2024-01-15T10:36:00.000Z'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/forums/:forumId', messageController.getForumMessages);

/**
 * @swagger
 * /api/messages/forums/{forumId}:
 *   post:
 *     tags: [Messages]
 *     summary: Send a message to a forum
 *     description: >
 *       Persists a message and broadcasts it via Socket.IO.
 *       For **public messages** omit `isPrivate` (or set to `false`) and leave `recipientId` null.
 *       For **private messages** set `isPrivate: true` and provide a valid `recipientId`.
 *       The DB constraint enforces that private messages must have a recipient.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Forum ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *                 example: Hello everyone!
 *               isPrivate:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *               recipientId:
 *                 type: integer
 *                 nullable: true
 *                 description: Required when isPrivate is true
 *                 example: null
 *           examples:
 *             public:
 *               summary: Public message
 *               value:
 *                 content: Hello everyone!
 *                 isPrivate: false
 *             private:
 *               summary: Private message to user #3
 *               value:
 *                 content: Hey, can we talk privately?
 *                 isPrivate: true
 *                 recipientId: 3
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mensagem enviada!
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *             example:
 *               message: Mensagem enviada!
 *               data:
 *                 id: 42
 *                 forum_id: 1
 *                 user_id: 1
 *                 username: alice
 *                 avatar_url: null
 *                 content: Hello everyone!
 *                 is_private: false
 *                 recipient_id: null
 *                 recipient_username: null
 *                 created_at: '2024-06-11T12:05:00.000Z'
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
 */
router.post('/forums/:forumId', messageRules, validate, messageController.createMessage);

module.exports = router;
