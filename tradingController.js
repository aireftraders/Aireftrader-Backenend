const User = require('../models/User');

exports.simulateTrading = async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findOne({ telegramId: userId });
  
  if (!user.tradingActive) {
    return res.status(400).json({ error: "Complete 6 referrals first" });
  }

  // Simulate profit (20-50% of capital)
  const profit = user.tradingCapital * (0.2 + Math.random() * 0.3);
  user.dailyProfit = profit;
  user.totalProfit += profit;
  user.withdrawableProfit += profit * 0.7; // 70% to user
  
  await user.save();
  res.json({
    capital: user.tradingCapital,
    profit: user.dailyProfit
  });
};