const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true // Enable polling if not using webhooks
});

// Start command handler
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    // Save/update user in database
    await User.findOneAndUpdate(
      { telegramId: userId.toString() },
      { 
        $setOnInsert: {
          telegramId: userId.toString(),
          username: msg.from.username,
          firstName: msg.from.first_name,
          lastName: msg.from.last_name,
          balance: 5000 // Initial bonus
        }
      },
      { upsert: true, new: true }
    );

    // Send welcome message
    await bot.sendMessage(
      chatId,
      `🎉 Welcome to AI REF-TRADERS!\n\n` +
      `You'll now receive:\n` +
      `• Account notifications\n` +
      `• Withdrawal alerts\n` +
      `• Important announcements\n\n` +
      `Type /help for commands`,
      { parse_mode: 'Markdown' }
    );

    // Send quick reply buttons
    await bot.sendMessage(chatId, 'Quick actions:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '💰 Check Balance', callback_data: 'check_balance' }],
          [{ text: '🔄 Refresh', callback_data: 'refresh' }]
        ]
      }
    });

  } catch (error) {
    console.error('Start command error:', error);
    bot.sendMessage(chatId, '❌ Failed to setup notifications. Please try again.');
  }
});

// Export for use in other files if needed
module.exports = bot;
// Help command
bot.onText(/\/help/, (msg) => {
       bot.sendMessage(msg.chat.id, `Available commands:\n\n/start - Setup notifications\n/balance - Check your earnings\n/support - Contact team`);
     });
     
     // Handle button clicks
     bot.on('callback_query', async (query) => {
       const chatId = query.message.chat.id;
       
       if (query.data === 'check_balance') {
         const user = await User.findOne({ telegramId: chatId.toString() });
         bot.sendMessage(chatId, `💰 Your balance: ₦${user.balance.toLocaleString()}`);
       }
     });