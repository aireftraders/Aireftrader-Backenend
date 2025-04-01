const User = require('../models/User');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

module.exports = {
  initializePayment: async (req, res) => {
    /* existing implementation */
  },
  
  verifyPaymentWebhook: async (req, res) => {
    /* existing implementation */
  },
  
  requestWithdrawal: async (req, res) => {
    /* existing implementation */
  },
  
  getBanks: async (req, res) => {
    /* existing implementation */
  },
  
  verifyPayment: async (req, res) => {
    try {
      const { reference } = req.params;
      const payment = await Payment.findOne({ reference });
      
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }
      
      if (payment.status === 'completed') {
        return res.json({ success: true, status: 'completed', payment });
      }
      
      res.json({ success: true, status: payment.status, payment });
    } catch (error) {
      logger.error(`Verify payment error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  getPaymentHistory: async (req, res) => {
    try {
      const payments = await Payment.find({ user: req.user.id })
        .sort('-createdAt')
        .limit(20);
        
      res.json({ success: true, payments });
    } catch (error) {
      logger.error(`Get payment history error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};