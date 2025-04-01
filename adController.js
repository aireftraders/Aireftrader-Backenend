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