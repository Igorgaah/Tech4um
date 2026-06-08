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

router.get('/', forumController.list);
router.get('/:id', forumController.getOne);
router.post('/', createRules, validate, forumController.create);

module.exports = router;
