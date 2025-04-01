const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameType: { 
    type: String, 
    enum: ['memory_match', 'lucky_dice', 'snake', 'trivia', 'lucky_wheel'], // Fixed: Added missing opening quote and brackets
    required: true 
  },
  attempts: { type: Number, default: 10 },
  wins: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  adsWatched: { type: Number, default: 0 }, // Added to track ads watched per game
  lastPlayed: { type: Date, default: Date.now } // Added default value
}, { timestamps: true });

module.exports = mongoose.model('GameSession', gameSessionSchema); // Changed model name to be more specific
