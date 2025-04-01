require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/game-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB!'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: ['https://web.telegram.org', process.env.FRONTEND_DOMAIN]
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Route imports
const gameRoutes = require('./routes/gameRoutes');
const adRoutes = require('./routes/ads');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Routes
app.use('/api/games', gameRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

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
                        .update(process.env.BOT_TOKEN)
                        .digest();
  return crypto.createHmac('sha256', secretKey)
              .update(dataCheckString)
              .digest('hex') === hash;
}

// API Endpoints
app.get('/status', (req, res) => {
  res.json({ 
    status: 'running', 
    port: PORT,
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// User management endpoints
app.post('/api/user', (req, res) => {
  const { initData } = req.body;
  
  if (!validateWebAppData(initData)) {
    return res.status(403).json({ error: 'Invalid Telegram WebApp data' });
  }
  
  const params = new URLSearchParams(initData);
  const userId = params.get('user')?.id || 'demo';
  
  // In a real app, you'd fetch from database
  const user = {
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
  
  // Update login streak
  const today = new Date().toDateString();
  if (user.lastLogin !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (user.lastLogin === yesterday.toDateString()) {
      user.streak++;
    } else {
      user.streak = 1;
    }
    
    user.streakBonus = 500 + (Math.min(user.streak, 7) - 1) * 100;
    user.lastLogin = today;
  }
  
  res.json(user);
});

// WebApp initData validation endpoint
app.post('/api/validate-initdata', (req, res) => {
  try {
    const isValid = validateWebAppData(req.body.initData);
    res.json({ valid: isValid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Additional CORS headers for Telegram WebApp
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://web.telegram.org');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <h1>AI Ref-Traders Backend</h1>
    <p>Server is running</p>
    <ul>
      <li><a href="/status">/status</a> - Health check</li>
      <li><a href="/api/announcements">/api/announcements</a> - Get announcements</li>
      <li>POST /api/user - Create user</li>
      <li>GET /api/games - Game endpoints</li>
      <li>POST /api/ads - Ad endpoints</li>
    </ul>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`MongoDB status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});
