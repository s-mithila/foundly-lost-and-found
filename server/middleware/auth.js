// server/middleware/auth.js
const db = require('../database/db');

function attachUser(req, res, next) {
  if (req.session && req.session.userId) {
    const user = db
      .prepare('SELECT id, name, email, role, student_id, phone, department, avatar_url FROM users WHERE id = ?')
      .get(req.session.userId);
    req.user = user || null;
  } else {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

function requireSecurityOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role !== 'security' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Campus Security or Admin privilege required.' });
  }
  next();
}

module.exports = {
  attachUser,
  requireAuth,
  requireSecurityOrAdmin,
};
