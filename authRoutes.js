const adminController = require('../controllers/adminController');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/telegram-auth', authController.telegramAuth);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password', authController.resetPassword);

// Protected routes
router.use(authMiddleware.protect);
router.get('/me', authController.getMe);
router.put('/update-profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);

module.exports = router;
// Admin login route
router.post('/admin/login', adminController.login);