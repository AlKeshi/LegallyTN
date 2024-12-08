const express = require('express');
const { signup, login, logout, authStatus } = require('../controllers/authController');
const { checkNotAuthenticated } = require('../middlewares/authentication');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', checkNotAuthenticated, login);
router.post('/logout', logout);
router.get('/status', authStatus);

module.exports = router;
