const Announcement = require('../models/Announcement');

// Create announcement (Admin only)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    const announcement = new Announcement({
      title,
      message,
      createdBy: req.user._id
    });
    await announcement.save();
    
    // Broadcast to all users (simplified - in production use WebSockets)
    io.emit('new_announcement', announcement);
    
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get active announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Toggle announcement status
exports.toggleAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    announcement.isActive = !announcement.isActive;
    await announcement.save();
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const TelegramNotifier = require('../services/telegramService');

// Create announcement with Telegram DM
exports.createAnnouncement = async (req, res) => {
  const { title, message } = req.body;
  
  // 1. Create announcement
  const announcement = new Announcement({ title, message });
  
  // 2. Get all active users
  const users = await User.find({ telegramId: { $exists: true } });
  
  // 3. Send Telegram DMs (rate-limited to comply with Telegram rules)
  const BATCH_SIZE = 30; // Telegram allows ~30 messages/sec
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (user) => {
      const telegramMsgId = await TelegramNotifier.sendDM(user.telegramId, announcement);
      announcement.recipients.push({
        userId: user._id,
        telegramMsgId
      });
    }));
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }
  
  await announcement.save();
  res.status(201).json(announcement);
};

// Mark as read from Telegram DM
exports.markAsRead = async (req, res) => {
  await TelegramNotifier.markAsRead(req.params.id, req.user._id);
  res.json({ success: true });
};