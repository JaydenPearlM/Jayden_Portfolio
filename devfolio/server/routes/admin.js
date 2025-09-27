// server/routes/admin.js (CommonJS)
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this';

// --- TEMP DEBUG: remove after it works ---
router.get('/health', (req, res) => res.json({ ok: true, t: Date.now() }));
router.get('/debug', (req, res) => {
  res.json({
    hasUser: !!process.env.ADMIN_USERNAME,
    hasPass: !!process.env.ADMIN_PASSWORD,
    hasJwt:  !!process.env.JWT_SECRET
  });
});
// -----------------------------------------

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  console.log('[ADMIN LOGIN] body keys:', Object.keys(req.body || {}));

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'Server not configured: JWT_SECRET missing' });
  }

  // 1) Env-based one-user login (preferred for your case)
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
      const token = jwt.sign({ user: username, roles: ['admin'] }, JWT_SECRET, { expiresIn: '2h' });
      return res.json({ token });
    }
    // If env creds exist but didn't match, we still try DB below in case you keep a DB admin too.
  }

  // 2) Fallback to DB user (supports comparePassword() or passwordHash + bcrypt)
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    let ok = false;
    if (typeof admin.comparePassword === 'function') {
      ok = await admin.comparePassword(password);
    } else if (admin.passwordHash) {
      ok = await bcrypt.compare(password, admin.passwordHash);
    }

    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, username: admin.username, roles: admin.roles || ['admin'] },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    return res.json({ token });
  } catch (err) {
    console.error('[ADMIN LOGIN] error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
