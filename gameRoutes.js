const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protected routes
router.use(authMiddleware.protect);
router.get('/:gameType', gameController.getGameSession);
router.put('/:gameType', gameController.updateGameSession);
router.post('/:gameType/reset', gameController.resetGameAttempts);
router.get('/', gameController.getUserGameSessions);

// Admin route for simulating trading (would typically be called by a cron job)
router.post('/simulate-trading', authMiddleware.admin, gameController.simulateTrading);

module.exports = router;