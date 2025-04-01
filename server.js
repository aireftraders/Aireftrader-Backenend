require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');
// Add these after other route imports
const gameRoutes = require('./routes/games');
const adRoutes = require('./routes/ads');

// Add these before error handlers
app.use('/api/games', gameRoutes);
app.use('/api/ads', adRoutes);
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Telegram Bot Token from environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;

// In-memory database
const users = {};
const announcements = [];
let paymentCircle = { current: 742, total: 1000 };

// Telegram WebApp validation
function validateWebAppData(initData) {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    const dataToCheck = [];
    
    params.sort();
    params.forEach((val, key) => {
        if (key !== 'hash') dataToCheck.push(`${key}=${val}`);
    });
    
    const dataCheckString = dataToCheck.join('\n');
    const secretKey = crypto.createHmac('sha256', 'WebAppData')
                          .update(BOT_TOKEN)
                          .digest();
    return crypto.createHmac('sha256', secretKey)
                .update(dataCheckString)
                .digest('hex') === hash;
}

// API Routes

// Health check
app.get('/status', (req, res) => {
    res.json({ 
        status: 'running', 
        port: PORT,
        users: Object.keys(users).length
    });
});

// User management
app.post('/api/user', (req, res) => {
    const { initData } = req.body;
    
    if (!validateWebAppData(initData)) {
        return res.status(403).json({ error: 'Invalid Telegram WebApp data' });
    }
    
    const params = new URLSearchParams(initData);
    const userId = params.get('user')?.id || 'demo';
    
    if (!users[userId]) {
        users[userId] = {
            userId,
            balance: 5000,
            referrals: 0,
            referralEarnings: 0,
            adsWatched: 0,
            tradingActive: false,
            verified: false,
            tradingCapital: 0,
            dailyProfit: 0,
            totalProfit: 0,
            withdrawableProfit: 0,
            bankDetails: null,
            streak: 0,
            streakBonus: 0,
            lastLogin: new Date().toISOString()
        };
    }
    
    // Update login streak
    const today = new Date().toDateString();
    if (users[userId].lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (users[userId].lastLogin === yesterday.toDateString()) {
            users[userId].streak++;
        } else {
            users[userId].streak = 1;
        }
        
        users[userId].streakBonus = 500 + (Math.min(users[userId].streak, 7) - 1) * 100;
        users[userId].lastLogin = today;
    }
    
    res.json(users[userId]);
});

app.post('/api/user/update', (req, res) => {
    const { initData, userData } = req.body;
    
    if (!validateWebAppData(initData)) {
        return res.status(403).json({ error: 'Invalid Telegram WebApp data' });
    }
    
    const params = new URLSearchParams(initData);
    const userId = params.get('user')?.id || 'demo';
    
    if (users[userId]) {
        users[userId] = { ...users[userId], ...userData };
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Bank verification
app.post('/api/user/verify', (req, res) => {
    const { initData, bankDetails } = req.body;
    
    if (!validateWebAppData(initData)) {
        return res.status(403).json({ error: 'Invalid Telegram WebApp data' });
    }
    
    const params = new URLSearchParams(initData);
    const userId = params.get('user')?.id || 'demo';
    
    if (users[userId]) {
        users[userId].bankDetails = bankDetails;
        users[userId].verified = true;
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Withdrawals
app.post('/api/withdraw', (req, res) => {
    const { initData, amount } = req.body;
    
    if (!validateWebAppData(initData)) {
        return res.status(403).json({ error: 'Invalid Telegram WebApp data' });
    }
    
    const params = new URLSearchParams(initData);
    const userId = params.get('user')?.id || 'demo';
    
    if (!users[userId] || !users[userId].verified) {
        return res.status(400).json({ error: 'Account not verified' });
    }
    
    if (amount < 5000) {
        return res.status(400).json({ error: 'Minimum withdrawal is ₦5000' });
    }
    
    if (amount > users[userId].withdrawableProfit) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    users[userId].withdrawableProfit -= amount;
    paymentCircle.current++;
    
    res.json({ 
        success: true,
        newBalance: users[userId].withdrawableProfit,
        paymentCircle
    });
});

// Announcements
app.get('/api/announcements', (req, res) => {
    res.json(announcements);
});

app.post('/api/announcements', (req, res) => {
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Announcement text required' });
    }
    
    const announcement = {
        text,
        time: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    announcements.unshift(announcement);
    res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
    console.log(`AI Ref-Traders backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/status`);
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Handle root route
app.get('/', (req, res) => {
  res.send(`
    <h1>AI Ref-Traders Backend</h1>
    <p>Server is running</p>
    <ul>
      <li><a href="/status">/status</a> - Health check</li>
      <li><a href="/api/announcements">/api/announcements</a> - Get announcements</li>
      <li>POST /api/user - Create user</li>
    </ul>
  `);
});
