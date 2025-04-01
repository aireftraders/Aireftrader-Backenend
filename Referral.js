const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  earnings: { type: Number, default: 5000 },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);