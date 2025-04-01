const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protected routes
router.use(authMiddleware.protect);

// Payment routes
router.post('/initialize', paymentController.initializePayment);
router.get('/verify/:reference', paymentController.verifyPayment);
router.get('/history', paymentController.getPaymentHistory);
router.post('/withdraw', paymentController.requestWithdrawal);
router.get('/banks', paymentController.getBanks);

// Webhook (no auth)
router.post('/webhook', paymentController.verifyPaymentWebhook);

module.exports = router;