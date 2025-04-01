const router = require('express').Router();

// Auth
router.post('/auth/telegram', require('../controllers/authController').telegramAuth);

// Trading
router.get('/simulate-trading/:userId', require('../controllers/tradingController').simulateTrading);

// Games
router.post('/game-result', require('../controllers/gameController').handleGameResult);

// Withdrawals
router.post('/withdraw', require('../controllers/withdrawalController').requestWithdrawal);

module.exports = router;