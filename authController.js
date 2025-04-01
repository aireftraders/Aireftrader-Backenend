const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const emailService = require('../services/emailService');
const authMiddleware = require('../middlewares/authMiddleware');
const logger = require('../utils/logger');

const authController = {
  // Register a new user
  register: async (req, res) => {
    const { username, email, password, telegramId } = req.body;
    
    try {
      // Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
      
      // Create user
      const user = await User.create({
        username,
        email,
        password,
        telegramId,
        balance: 5000 // Signup bonus
      });
      
      // Generate token
      const token = generateToken(user._id);
      
      // Send verification email
      await emailService.sendVerificationEmail(email, token);
      
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          verified: user.verified
        }
      });
    } catch (error) {
      logger.error(`Register error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Login user
  login: async (req, res) => {
    const { email, password } = req.body;
    
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      // Update login streak
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (user.streak.lastLogin !== today) {
        if (user.streak.lastLogin === yesterday.toDateString()) {
          user.streak.days += 1;
        } else {
          user.streak.days = 1;
        }
        user.streak.lastLogin = today;
        await user.save();
      }
      
      // Generate token
      const token = generateToken(user._id);
      
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          verified: user.verified,
          streak: user.streak.days
        }
      });
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Telegram login/register
  telegramAuth: async (req, res) => {
    const { id, first_name, last_name, username } = req.body;
    
    try {
      let user = await User.findOne({ telegramId: id });
      
      if (!user) {
        // Create new user
        user = await User.create({
          telegramId: id,
          firstName: first_name,
          lastName: last_name,
          username: username,
          balance: 5000 // Signup bonus
        });
      }
      
      // Update login streak
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (user.streak.lastLogin !== today) {
        if (user.streak.lastLogin === yesterday.toDateString()) {
          user.streak.days += 1;
        } else {
          user.streak.days = 1;
        }
        user.streak.lastLogin = today;
        await user.save();
      }
      
      // Generate token
      const token = generateToken(user._id);
      
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          telegramId: user.telegramId,
          username: user.username,
          balance: user.balance,
          verified: user.verified,
          streak: user.streak.days
        }
      });
    } catch (error) {
      logger.error(`Telegram auth error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Get current user
  getMe: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      
      res.json({
        success: true,
        user
      });
    } catch (error) {
      logger.error(`Get user error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.user.id, req.body, {
        new: true,
        runValidators: true
      }).select('-password');
      
      res.json({
        success: true,
        user
      });
    } catch (error) {
      logger.error(`Update profile error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Change password
  changePassword: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      const { currentPassword, newPassword } = req.body;
      
      // Check current password
      if (!(await user.matchPassword(currentPassword))) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }
      
      user.password = newPassword;
      await user.save();
      
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      logger.error(`Change password error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Forgot password
  forgotPassword: async (req, res) => {
    const { email } = req.body;
    
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Generate token
      const token = generateToken(user._id);
      
      // Send email
      await emailService.sendPasswordResetEmail(email, token);
      
      res.json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
      logger.error(`Forgot password error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Reset password
  resetPassword: async (req, res) => {
    const { token, newPassword } = req.body;
    
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      user.password = newPassword;
      await user.save();
      
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      logger.error(`Reset password error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = authController;
const User = require('../models/User');

exports.telegramAuth = async (req, res) => {
  const { id, username, first_name, last_name } = req.body.user;
  
  // Find or create user
  let user = await User.findOne({ telegramId: id });
  if (!user) {
    user = new User({
      telegramId: id,
      username,
      firstName: first_name,
      lastName: last_name,
      balance: 5000, // Signup bonus
      lastLogin: new Date()
    });
  } else {
    // Update login streak
    const today = new Date();
    if (user.lastLogin.toDateString() !== today.toDateString()) {
      user.streak = (user.streak || 0) + 1;
      user.streakBonus = 500 + (Math.min(user.streak, 7) - 1) * 100;
      user.lastLogin = today;
    }
  }
  
  await user.save();
  res.json(user);
};