const express = require('express');
const cors = require('cors');
const useragent = require('express-useragent');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const folderRoutes = require('./routes/folderRoutes');
const tagRoutes = require('./routes/tagRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { redirectShortUrl } = require('./controllers/urlController');

// Initialize app
const app = express();

// Middlewares
const allowedOrigins = [
  process.env.FRONTEND_URL,           // Explicit Vercel URL from env var (most secure)
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    // Allow explicitly listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Allow any Vercel preview/production deployment (*.vercel.app)
    if (origin.endsWith('.vercel.app')) return callback(null, true);

    // Block everything else
    console.warn(`CORS blocked request from: ${origin}`);
    callback(new Error(`CORS blocked: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(useragent.express());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Redirection service (must be placed at the bottom so it doesn't hijack other APIs)
app.get('/:shortCode', redirectShortUrl);

// Base route health check
app.get('/', (req, res) => {
  res.json({ message: 'SmartLink AI URL Shortener API is running', status: 'ok' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Connect to Database (called from index.js, not here, so server can bind port fast)
app.connectDB = connectDB;

module.exports = app;
