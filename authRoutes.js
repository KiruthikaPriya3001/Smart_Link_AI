const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/me', protect, getMe);

module.exports = router;
