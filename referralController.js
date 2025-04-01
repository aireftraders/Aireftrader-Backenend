const User = require('../models/User');
const Referral = require('../models/Referral');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

const referralController = {
  // Get referral link
  getReferralLink: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const referralLink = `https://t.me/yourbot?startref=${user.telegramId || user._id}`;
      
      res.json({ success: true, referralLink });
    } catch (error) {
      logger.error(`Get referral link error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Process referral
  processReferral: async (req, res) => {
    const { referrerId } = req.params;
    
    try {
      // Check if referrer exists
      const referrer = await User.findOne({ 
        $or: [{ telegramId: referrerId }, { _id: referrerId }] 
      });
      
      if (!referrer) {
        return res.status(404).json({ success: false, message: 'Referrer not found' });
      }
      
      // Check if referee exists (current user)
      const referee = await User.findById(req.user.id);
      
      if (!referee) {
        return res.status(404).json({ success: false, message: 'Referee not found' });
      }
      
      // Check if referral already exists
      const existingReferral = await Referral.findOne({ 
        referrer: referrer._id, 
        referee: referee._id 
      });
      
      if (existingReferral) {
        return res.status(400).json({ success: false, message: 'Referral already processed' });
      }
      
      // Create referral
      const referral = await Referral.create({
        referrer: referrer._id,
        referee: referee._id,
        earnings: 5000
      });
      
      // Update referrer's balance and referral count
      referrer.balance += 5000;
      referrer.referralEarnings += 5000;
      await referrer.save();
      
      // Create transaction for referrer
      const transaction = new Transaction({
        user: referrer._id,
        amount: 5000,
        type: 'referral',
        description: `Referral bonus for ${referee.username}`,
        status: 'completed'
      });
      await transaction.save();
      
      res.json({ 
        success: true, 
        message: 'Referral processed successfully',
        referral
      });
    } catch (error) {
      logger.error(`Process referral error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Get all referrals (admin only)
  getReferrals: async (req, res) => {
    try {
      const referrals = await Referral.find()
        .populate('referrer', 'username email')
        .populate('referee', 'username email');
      
      res.json({ success: true, count: referrals.length, referrals });
    } catch (error) {
      logger.error(`Get referrals error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = referralController;