const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protected routes
router.use(authMiddleware.protect);
router.get('/link', referralController.getReferralLink);
router.post('/process/:referrerId', referralController.processReferral);

// Admin routes
router.use(authMiddleware.admin);
router.get('/', referralController.getReferrals);

module.exports = router;