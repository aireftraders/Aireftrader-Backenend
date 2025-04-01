const Ad = require('../models/Ad');

module.exports = {
  watchAd: async (req, res) => {
    try {
      // Simulate 3-second ad view
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update user's ad count
      const user = await User.findById(req.user.id);
      user.adsWatched += 1;
      await user.save();

      res.json({ 
        success: true,
        adsWatched: user.adsWatched,
        tradingActive: user.adsWatched >= 10 
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  adStatus: (req, res) => {
    res.json({ 
      adsRequired: 10,
      watched: req.user.adsWatched 
    });
  }
};
const AdService = require('../services/adService');
const User = require('../models/User');

module.exports = {
  watchAd: async (req, res) => {
    try {
      // 1. Serve ad
      const ad = await AdService.serveAd(req.user.id);
      
      // 2. Simulate viewing delay
      await new Promise(resolve => setTimeout(resolve, ad.duration * 1000));
      
      // 3. Reward user
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { 
          $inc: { 
            adsWatched: 1,
            balance: ad.earnings 
          } 
        },
        { new: true }
      );

      res.json({
        success: true,
        ad,
        balance: user.balance
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getAdStatus: async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({
      adsWatched: user.adsWatched,
      adsRequired: 10,
      tradingActive: user.adsWatched >= 10
    });
  }
};
