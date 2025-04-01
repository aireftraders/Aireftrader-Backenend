const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  reference: { type: String, required: true, unique: true },
  paymentMethod: { type: String, enum: ['bank', 'crypto'], required: true },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String
  },
  cryptoDetails: {
    walletAddress: String,
    network: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);