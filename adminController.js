const User = require('../models/User');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const Referral = require('../models/Referral');
const Game = require('../models/Game');
const logger = require('../utils/logger');
const { generateAdminToken } = require('../utils/auth');

const adminController = {
  // User Management
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({}, '-password');
      res.json({ success: true, users });
    } catch (error) {
      logger.error(`Get all users error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getUserDetails: async (req, res) => {
    try {
      const user = await User.findById(req.params.id, '-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user });
    } catch (error) {
      logger.error(`Get user details error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  verifyUser: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { verified: true },
        { new: true }
      );
      res.json({ success: true, user });
    } catch (error) {
      logger.error(`Verify user error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Payment Management
  getPayments: async (req, res) => {
    try {
      const payments = await Payment.find()
        .sort('-createdAt')
        .populate('user', 'username');
      res.json({ success: true, payments });
    } catch (error) {
      logger.error(`Get payments error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  updatePaymentStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const payment = await Payment.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      res.json({ success: true, payment });
    } catch (error) {
      logger.error(`Update payment status error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Admin Auth
  login: async (req, res) => {
    try {
      const { password } = req.body;
      
      // Debug logging
      console.log('Login attempt with password:', password);
      console.log('Expected password:', process.env.ADMIN_PASSWORD);
      
      if (password !== process.env.ADMIN_PASSWORD) {
        console.log('Password comparison failed');
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      const token = generateAdminToken({ 
        role: 'admin',
        expiresIn: '24h' // Token expires in 24 hours
      });
      
      console.log('Generated token:', token);
      res.json({ 
        success: true, 
        token,
        expiresIn: 86400 // 24 hours in seconds
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
};

module.exports = adminController;
login: async (req, res) => {
  try {
    const { password } = req.body;
    
    // Enhanced debugging
    console.log('\n=== ADMIN LOGIN ATTEMPT ===');
    console.log('Received password:', password);
    console.log('Expected password:', process.env.ADMIN_PASSWORD);
    console.log('Comparison result:', password === process.env.ADMIN_PASSWORD);
    
    if (password !== process.env.ADMIN_PASSWORD) {
      console.log('Password comparison failed - character codes:');
      console.log('Received:', [...password].map(c => c.charCodeAt(0)));
      console.log('Expected:', [...process.env.ADMIN_PASSWORD].map(c => c.charCodeAt(0)));
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    const token = generateAdminToken({ role: 'admin' });
    console.log('Login successful. Generated token:', token);
    
    res.json({ 
      success: true, 
      token,
      expiresIn: 86400 // 24 hours in seconds
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}
login: async (req, res) => {
  try {
    const { password } = req.body;
    
    console.log('\n=== AUTH DEBUG ===');
    console.log('Received:', password);
    console.log('Expected:', process.env.ADMIN_PASSWORD);
    
    // Trim and compare raw values
    if (password.trim() !== process.env.ADMIN_PASSWORD.trim()) {
      console.log('Comparison failed - character codes:');
      console.log('Received:', [...password].map(c => c.charCodeAt(0)));
      console.log('Expected:', [...process.env.ADMIN_PASSWORD].map(c => c.charCodeAt(0)));
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    const token = generateAdminToken({ role: 'admin' });
    res.json({ success: true, token });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}