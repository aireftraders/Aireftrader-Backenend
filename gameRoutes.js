const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const adMiddleware = require('../middleware/adMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all game routes
router.use(authMiddleware.protect);

// Gameplay endpoints with ad requirements
router.post('/memory-match', adMiddleware.checkGameAds(2), gameController.playMemoryMatch);
router.post('/lucky-dice', adMiddleware.checkGameAds(2), gameController.playLuckyDice);
router.post('/snake', adMiddleware.checkGameAds(2), gameController.playSnake);
router.post('/trivia', adMiddleware.checkGameAds(2), gameController.playTrivia);
router.post('/lucky-wheel', adMiddleware.checkGameAds(4), gameController.spinLuckyWheel);

// Game session management endpoints
router.get('/:gameType', gameController.getGameSession);
router.put('/:gameType', gameController.updateGameSession);
router.post('/:gameType/reset', gameController.resetGameAttempts);
router.get('/', gameController.getUserGameSessions);

// Admin-only endpoint for simulating trading
router.post('/simulate-trading', 
  authMiddleware.restrictTo('admin'), 
  gameController.simulateTrading
);

module.exports = router;
