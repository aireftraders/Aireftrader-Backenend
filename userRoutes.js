const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many ad watch requests from this IP, please try again after 15 minutes'
});

// User routes (protected)
router.use(authMiddleware.protect);
router.get('/referrals', userController.getUserReferrals);
router.post('/verify-bank', userController.verifyBankAccount);
router.post('/watch-ad', limiter, userController.watchAd); // Add rate limiter here

// ... rest of the routes