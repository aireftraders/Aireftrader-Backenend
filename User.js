const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  telegramId: { type: String, unique: true },
  username: String,
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  balance: { type: Number, default: 5000 }, // Signup bonus
  tradingCapital: { type: Number, default: 0 },
  dailyProfit: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  withdrawableProfit: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String
  },
  adsWatched: { type: Number, default: 0 },
  tradingActive: { type: Boolean, default: false },
  streak: {
    days: { type: Number, default: 0 },
    lastLogin: Date
  },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  telegramId: { type: String, unique: true },
  balance: { type: Number, default: 5000 },
  tradingCapital: { type: Number, default: 0 },
  referrals: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String
  },
  streak: { type: Number, default: 0 },
  lastLogin: Date
});

module.exports = mongoose.model('User', UserSchema);