const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all ad routes
router.use(authMiddleware.protect);

router.post('/watch', adController.watchAd);
router.get('/status', adController.getAdStatus);

module.exports = router;