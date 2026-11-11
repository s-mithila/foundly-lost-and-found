// server/server.js
// Foundly Backend - Express REST API & Session Server

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

// Initialize database & tables
require('./database/db');

// Middleware & Routes
const { attachUser } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const claimsRoutes = require('./routes/claims');
const matchesRoutes = require('./routes/matches');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5002;

// Enable CORS for Vite frontend dev server
app.use(
  cors({
    origin: ['http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session config
app.use(
  session({
    name: 'foundly.sid',
    secret: process.env.SESSION_SECRET || 'foundly_smart_campus_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Local HTTP development
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Attach authenticated user to req.user if session exists
app.use(attachUser);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Foundly — Lost & Found Management Platform',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend production build if available
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Foundly API Server running on http://localhost:${PORT}`);
  console.log(`📡 Frontend dev proxy configured for http://localhost:5174`);
  console.log(`====================================================`);
});

module.exports = app;
