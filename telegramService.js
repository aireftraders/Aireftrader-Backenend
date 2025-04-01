const axios = require('axios');
const config = require('../config/config');

const telegramService = {
  sendMessage: async (chatId, text) => {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending Telegram message:', error.message);
      throw error;
    }
  },

  verifyWebAppData: (initData) => {
    try {
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      const dataToCheck = initData.split('&hash=')[0];
      
      const secret = crypto.createHash('sha256')
        .update(config.TELEGRAM_BOT_TOKEN)
        .digest();
      
      const computedHash = crypto.createHmac('sha256', secret)
        .update(dataToCheck)
        .digest('hex');
      
      return computedHash === hash;
    } catch (error) {
      console.error('Error verifying Telegram data:', error);
      return false;
    }
  }
};

module.exports = telegramService;
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

class TelegramNotifier {
  static async sendDM(userTelegramId, announcement) {
    try {
      // Check if user has /started the bot (compliant with Telegram rules)
      const msg = await bot.sendMessage(
        userTelegramId,
        `📢 *${announcement.title}*\n\n${announcement.message}\n\n` +
        `_Mark as read: ${process.env.BOT_LINK}/read/${announcement._id}_`,
        { parse_mode: 'Markdown' }
      );
      
      return msg.message_id; // Return Telegram message ID
    } catch (error) {
      console.error(`Failed to send to ${userTelegramId}:`, error.message);
      return null;
    }
  }

  static async markAsRead(announcementId, userId) {
    await Announcement.updateOne(
      { _id: announcementId, 'recipients.userId': userId },
      { $set: { 'recipients.$.read': true } }
    );
  }
}

module.exports = TelegramNotifier;