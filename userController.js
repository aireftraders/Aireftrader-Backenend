const User = require('../models/User');
const Referral = require('../models/Referral');
const logger = require('../utils/logger');
exports.verifyBankAccount = async (req, res) => {
  const { bankName, accountNumber, accountName } = req.body;

  // Add input validation here
  if (!bankName || !accountNumber || !accountName) {
    return res.status(400).json({ 
      success: false, 
      message: 'All bank details are required' 
    });
  }

  // Rest of the existing implementation...
  try {
    const user = await User.findById(req.user.id);
    // ... rest of the code
  } catch (error) {
    // ... error handling
  }
};
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    logger.error(`Get users error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user.id })
      .populate('referee', 'username email createdAt');
    res.json({ success: true, count: referrals.length, referrals });
  } catch (error) {
    logger.error(`Get referrals error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyBankAccount = async (req, res) => {
  const { bankName, accountNumber, accountName } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.balance < 550) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance for verification fee (₦550 required)' 
      });
    }
    
    user.balance -= 550;
    user.bankDetails = { bankName, accountNumber, accountName };
    user.verified = true;
    
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Bank account verified successfully',
      user: {
        id: user._id,
        verified: user.verified,
        balance: user.balance
      }
    });
  } catch (error) {
    logger.error(`Verify bank error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.watchAd = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.adsWatched += 1;
    
    if (user.adsWatched >= 10) {
      const referralCount = await Referral.countDocuments({ 
        referrer: user._id, 
        completed: true 
      });
      
      if (referralCount >= 6) {
        user.tradingActive = true;
        user.tradingCapital = 30000 + (referralCount * 5000);
      }
    }
    
    await user.save();
    
    res.json({ 
      success: true, 
      adsWatched: user.adsWatched,
      tradingActive: user.tradingActive,
      tradingCapital: user.tradingCapital
    });
  } catch (error) {
    logger.error(`Watch ad error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};