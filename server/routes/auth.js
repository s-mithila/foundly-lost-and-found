// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  res.json({ user: req.user });
});

// GET /api/auth/demo-users (For quick viva/demo login selection)
router.get('/demo-users', (req, res) => {
  const users = db
    .prepare('SELECT id, name, email, role, student_id, department, avatar_url FROM users ORDER BY id ASC')
    .all();
  res.json({ users });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
  }

  // Set session
  req.session.userId = user.id;

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    student_id: user.student_id,
    phone: user.phone,
    department: user.department,
    avatar_url: user.avatar_url,
  };

  res.json({ message: 'Login successful', user: safeUser });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role = 'student', student_id, phone, department } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

  try {
    const info = db
      .prepare(`
        INSERT INTO users (name, email, password_hash, role, student_id, phone, department, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        name.trim(),
        email.trim().toLowerCase(),
        passwordHash,
        ['student', 'staff', 'security', 'admin'].includes(role) ? role : 'student',
        student_id || null,
        phone || null,
        department || null,
        avatarUrl
      );

    req.session.userId = info.lastInsertRowid;

    const newUser = db
      .prepare('SELECT id, name, email, role, student_id, phone, department, avatar_url FROM users WHERE id = ?')
      .get(info.lastInsertRowid);

    res.status(201).json({ message: 'Account created successfully', user: newUser });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out.' });
    }
    res.clearCookie('foundly.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
