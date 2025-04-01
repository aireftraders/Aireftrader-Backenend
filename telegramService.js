const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/config');
const TelegramBot = require('node-telegram-bot-api');

// Initialize bot if token exists
const bot = process.env.TELEGRAM_BOT_TOKEN 
  ? new TelegramBot(process.env.TELEGRAM_BOT_TOKEN) 
  : null;

class TelegramService {
  // ===== WEBAPP VALIDATION =====
  static verifyWebAppData(initData) {
    try {
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      const dataToCheck = [];
      
      // Proper parameter sorting as per Telegram docs
      params.sort();
      params.forEach((val, key) => {
        if (key !== 'hash') dataToCheck.push(`${key}=${val}`);
      });
      
      // Correct key derivation
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(config.TELEGRAM_BOT_TOKEN)
        .digest();
      
      return crypto
        .createHmac('sha256', secretKey)
        .update(dataToCheck.join('\n'))
        .digest('hex') === hash;
    } catch (error) {
      console.error('[Telegram] Validation error:', error);
      return false;
    }
  }

  // ===== MESSAGING =====
  static async sendMessage(chatId, text, options = {}) {
    try {
      if (!bot) throw new Error('Bot token not configured');
      
      const response = await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        ...options
      });
      
      return {
        success: true,
        messageId: response.message_id
      };
    } catch (error) {
      console.error(`[Telegram] Message failed to ${chatId}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== NOTIFICATIONS =====
  static async sendAnnouncement(userId, announcement) {
    try {
      if (!process.env.BOT_LINK) {
        throw new Error('BOT_LINK env variable required');
      }

      const message = `📢 <b>${announcement.title}</b>\n\n` +
                     `${announcement.message}\n\n` +
                     `<a href="${process.env.BOT_LINK}/read/${announcement._id}">` +
                     `Mark as read</a>`;

      return this.sendMessage(userId, message);
    } catch (error) {
      console.error('[Telegram] Announcement failed:', error);
      return { success: false };
    }
  }

  // ===== USER DATA EXTRACTION =====
  static parseInitData(initData) {
    try {
      const params = new URLSearchParams(initData);
      return {
        userId: params.get('user.id'),
        firstName: params.get('user.first_name'),
        lastName: params.get('user.last_name'),
        username: params.get('user.username'),
        language: params.get('user.language_code')
      };
    } catch (error) {
      console.error('[Telegram] InitData parsing failed:', error);
      return null;
    }
  }
}

module.exports = TelegramService;
