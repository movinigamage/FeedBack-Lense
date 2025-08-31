const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const authController = require('../controllers/authController');

// Public
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected
router.get('/me', requireAuth, authController.me);

module.exports = router;
