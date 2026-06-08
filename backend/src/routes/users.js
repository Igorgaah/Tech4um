const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/search', userController.search);
router.get('/:id', userController.getById);

module.exports = router;
