const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { verifyToken } = require('../middleware/auth');

router.get('/me', verifyToken, authController.getMe);

module.exports = router;