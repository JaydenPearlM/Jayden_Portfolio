// server/middleware/auth.js
const jwt   = require('jsonwebtoken');
const Admin = require('../models/Admin');
const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this';

async function verifyAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing token' });
    }
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(payload.id);
    if (!admin) {
      return res.status(403).json({ error: 'Forbidden: admins only' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { verifyAdmin };
