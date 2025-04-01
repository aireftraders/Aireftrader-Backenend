const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const logger = require('../utils/logger');

const authMiddleware = {
  // General authentication (for all logged-in users)
  protect: async (req, res, next) => {
    let token;
    
    // Check for token in both Authorization header and cookies
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      logger.warn('Authentication attempt without token');
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        logger.warn(`Token valid but user not found: ${decoded.id}`);
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      req.user = user;
      logger.info(`Authenticated user: ${user._id}`);
      next();
    } catch (error) {
      logger.error(`Authentication failed: ${error.message}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }
  },

  // Admin-specific middleware
  admin: async (req, res, next) => {
    try {
      if (!req.user?.isAdmin) {
        logger.warn(`Admin access denied for user: ${req.user?._id || 'unknown'}`);
        return res.status(403).json({ 
          success: false, 
          message: 'Admin privileges required' 
        });
      }
      logger.info(`Admin access granted: ${req.user._id}`);
      next();
    } catch (error) {
      logger.error(`Admin verification error: ${error.message}`);
      res.status(500).json({ 
        success: false, 
        message: 'Admin verification failed' 
      });
    }
  },

  // Telegram authentication
  telegramAuth: async (req, res, next) => {
    const initData = req.headers['telegram-init-data'];
    
    if (!initData) {
      logger.warn('Telegram authentication attempt without init data');
      return res.status(401).json({ 
        success: false, 
        message: 'Telegram authentication required' 
      });
    }
    
    try {
      const telegramService = require('../services/telegramService');
      const isValid = await telegramService.verifyWebAppData(initData);
      
      if (!isValid) {
        logger.warn('Invalid Telegram authentication data');
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid Telegram authentication' 
        });
      }
      
      logger.info('Successful Telegram authentication');
      next();
    } catch (error) {
      logger.error(`Telegram auth error: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Error verifying Telegram authentication' 
      });
    }
  },

  // Optional: Role-based access control
  role: (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user?.role)) {
        logger.warn(`Role ${req.user?.role} not authorized for this route`);
        return res.status(403).json({
          success: false,
          message: `User role not authorized`
        });
      }
      next();
    };
  }
};

module.exports = authMiddleware;
admin: async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required'
      });
    }

    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
}
module.exports = (req, res, next) => {
  // Check if user is admin (from JWT)
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};