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

router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/login', authLimiter, loginRules, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
