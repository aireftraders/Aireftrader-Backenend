const axios = require('axios');
const config = require('../config/config');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

const paymentService = {
  // Initialize payment with Flutterwave
  initializePayment: async (email, amount, reference, userId) => {
    try {
      const response = await axios.post(
        'https://api.flutterwave.com/v3/payments',
        {
          tx_ref: reference,
          amount: amount,
          currency: 'NGN',
          redirect_url: `${config.FRONTEND_URL}/verify-payment`,
          payment_options: 'card, banktransfer, ussd',
          customer: {
            email: email,
          },
          customizations: {
            title: 'AI REF-TRADERS',
            description: 'Account funding',
            logo: `${config.FRONTEND_URL}/logo.png`,
          },
          meta: {
            userId: userId.toString(),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${config.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error(`Initialize payment error: ${error.message}`);
      throw error;
    }
  },

  // Verify payment with Flutterwave
  verifyPayment: async (transactionId) => {
    try {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${config.FLUTTERWAVE_SECRET_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error(`Verify payment error: ${error.message}`);
      throw error;
    }
  },

  // Create transaction record
  createTransaction: async (userId, amount, type, description) => {
    const transaction = new Transaction({
      user: userId,
      amount,
      type,
      description,
      reference: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'completed',
    });
    await transaction.save();
    return transaction;
  },

  // Transfer to bank account (for withdrawals)
  transferToBank: async (accountDetails, amount, reference) => {
    try {
      const response = await axios.post(
        'https://api.flutterwave.com/v3/transfers',
        {
          account_bank: accountDetails.bankCode,
          account_number: accountDetails.accountNumber,
          amount,
          narration: 'Withdrawal from AI REF-TRADERS',
          currency: 'NGN',
          reference,
          beneficiary_name: accountDetails.accountName,
        },
        {
          headers: {
            Authorization: `Bearer ${config.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error(`Bank transfer error: ${error.message}`);
      throw error;
    }
  },

  // Get bank list for Nigeria
  getBanks: async () => {
    try {
      const response = await axios.get(
        'https://api.flutterwave.com/v3/banks/NG',
        {
          headers: {
            Authorization: `Bearer ${config.FLUTTERWAVE_SECRET_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error(`Get banks error: ${error.message}`);
      throw error;
    }
  },
};

module.exports = paymentService;