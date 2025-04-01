const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameType: { type: String, enum: ['memory', 'dice', 'bottle', 'snake', 'quiz'], required: true },
  attempts: { type: Number, default: 10 },
  wins: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  lastPlayed: Date
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSessionSchema);