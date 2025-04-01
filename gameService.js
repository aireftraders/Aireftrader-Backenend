const GameStat = require('../models/GameStat');
const User = require('../models/User');
const gameConfig = require('../config/gameConfig');

class GameService {
  static async playMemoryMatch(userId) {
    // Game logic and reward calculation
    const matchedPairs = Math.floor(Math.random() * 5); // Example
    const earnings = matchedPairs * gameConfig.MEMORY_MATCH_REWARD;
    
    // Update user balance and stats
    await User.updateOne({ _id: userId }, { $inc: { balance: earnings } });
    await GameStat.updateOne(
      { userId, gameType: 'memory_match' },
      { 
        $inc: { 
          plays: 1,
          wins: matchedPairs,
          earnings: earnings,
          adsWatched: -2 // Deduct watched ads
        }
      }
    );
    
    return { earnings, matchedPairs };
  }
  
  // Other game methods...
}

module.exports = GameService;