// devfolio/server/routes/adminAuth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // DB fallback
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this';

// ---------- DEBUG: remove after you confirm envs ----------
router.get('/env-check', (req, res) => {
  res.json({
    has_USER: !!(process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL),
    has_PASS: !!process.env.ADMIN_PASSWORD,
    user_key: process.env.ADMIN_USERNAME ? 'ADMIN_USERNAME'
             : process.env.ADMIN_EMAIL ? 'ADMIN_EMAIL'
             : null,
  });
});

router.post('/login', (req, res, next) => {
  console.log('LOGIN attempt', {
    u: (req.body.username || req.body.email || '').toString(),
    hasEnvUser: !!(process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL),
    hasEnvPass: !!process.env.ADMIN_PASSWORD,
  });
  next();
});
// -----------------------------------------------------------

// Hybrid login: ENV first, DB fallback
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const input = (username || email || '').trim().toLowerCase();

    const envUser = (process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envPass = process.env.ADMIN_PASSWORD || '';

    // ENV-first
    if (envUser && envPass && input === envUser && password === envPass) {
      const token = jwt.sign({ sub: 'admin', user: envUser }, JWT_SECRET, { expiresIn: '12h' });
      return res.json({ token });
    }

    // DB fallback
    if (!input || !password) return res.status(400).json({ error: 'Missing credentials' });

    const admin = await Admin.findOne({ $or: [{ username: input }, { email: input }] }).lean(false);
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ sub: String(admin._id), user: admin.username || admin.email }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  } catch (e) {
    console.error('admin login error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
