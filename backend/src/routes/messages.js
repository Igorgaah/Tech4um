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

router.get('/forums/:forumId', messageController.getForumMessages);
router.post('/forums/:forumId', messageRules, validate, messageController.createMessage);

module.exports = router;
