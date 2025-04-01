const User = require('../models/User');
const Game = require('../models/Game');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

const gameController = {
  // Get game session
  getGameSession: async (req, res) => {
    const { gameType } = req.params;
    
    try {
      let gameSession = await Game.findOne({ 
        user: req.user.id, 
        gameType 
      });
      
      if (!gameSession) {
        // Create new game session
        gameSession = await Game.create({
          user: req.user.id,
          gameType,
          attempts: 10
        });
      }
      
      res.json({ success: true, gameSession });
    } catch (error) {
      logger.error(`Get game session error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Update game session (after playing)
  updateGameSession: async (req, res) => {
    const { gameType } = req.params;
    const { attempts, wins, earnings } = req.body;
    
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Find or create game session
      let gameSession = await Game.findOne({ 
        user: user._id, 
        gameType 
      });
      
      if (!gameSession) {
        gameSession = new Game({
          user: user._id,
          gameType,
          attempts: 10
        });
      }
      
      // Update game session
      gameSession.attempts = attempts;
      gameSession.wins = wins;
      gameSession.earnings += earnings;
      gameSession.lastPlayed = new Date();
      await gameSession.save();
      
      // Update user balance or trading capital
      if (user.tradingActive) {
        user.tradingCapital += earnings;
      } else {
        user.balance += earnings;
      }
      await user.save();
      
      // Create transaction
      const transaction = new Transaction({
        user: user._id,
        amount: earnings,
        type: 'game',
        description: `Earnings from ${gameType} game`,
        status: 'completed'
      });
      await transaction.save();
      
      res.json({ success: true, gameSession });
    } catch (error) {
      logger.error(`Update game session error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Reset game attempts (after 1 hour)
  resetGameAttempts: async (req, res) => {
    const { gameType } = req.params;
    
    try {
      const gameSession = await Game.findOneAndUpdate(
        { user: req.user.id, gameType },
        { attempts: 10 },
        { new: true }
      );
      
      if (!gameSession) {
        return res.status(404).json({ success: false, message: 'Game session not found' });
      }
      
      res.json({ success: true, gameSession });
    } catch (error) {
      logger.error(`Reset game attempts error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Get all game sessions for user
  getUserGameSessions: async (req, res) => {
    try {
      const gameSessions = await Game.find({ user: req.user.id });
      res.json({ success: true, count: gameSessions.length, gameSessions });
    } catch (error) {
      logger.error(`Get game sessions error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Simulate trading (cron job)
  simulateTrading: async (req, res) => {
    try {
      const users = await User.find({ tradingActive: true });
      
      for (const user of users) {
        // Calculate daily profit (20-50% of capital)
        const dailyReturn = Math.random() * (0.5 - 0.2) + 0.2;
        const dailyProfit = user.tradingCapital * dailyReturn;
        
        // Update user data
        user.dailyProfit = dailyProfit;
        user.totalProfit += dailyProfit;
        user.withdrawableProfit += dailyProfit * 0.7; // User gets 70%
        await user.save();
        
        // Create transaction
        const transaction = new Transaction({
          user: user._id,
          amount: dailyProfit * 0.7,
          type: 'trading',
          description: `Daily trading profit`,
          status: 'completed'
        });
        await transaction.save();
      }
      
      res.json({ 
        success: true, 
        message: `Trading simulated for ${users.length} users` 
      });
    } catch (error) {
      logger.error(`Simulate trading error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = gameController;
const User = require('../models/User');

exports.handleGameResult = async (req, res) => {
  const { userId, gameType, amount } = req.body;
  const user = await User.findOne({ telegramId: userId });
  
  // Add to capital if trading active, else to balance
  if (user.tradingActive) {
    user.tradingCapital += amount;
  } else {
    user.balance += amount;
  }
  
  await user.save();
  res.json({
    balance: user.balance,
    capital: user.tradingCapital
  });
};
const GameService = require('../services/gameService');

exports.playMemoryMatch = async (req, res, next) => {
  try {
    const result = await GameService.playMemoryMatch(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Similar methods for other games...
// Add response format matching frontend expectations
exports.playMemoryMatch = async (req, res) => {
  try {
    const result = await GameService.playMemoryMatch(req.user.id);
    res.json({
      success: true,
      matchedPairs: result.matchedPairs,
      earnings: result.earnings,
      newBalance: await User.getBalance(req.user.id) // Add this method to User model
    });
  } catch (err) {
    res.status(400).json({ 
      error: err.message,
      requiresAd: err.requiresAd || false 
    });
  }
};
