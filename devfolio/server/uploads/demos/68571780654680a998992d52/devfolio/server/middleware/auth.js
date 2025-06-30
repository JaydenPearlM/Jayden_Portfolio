// server/middleware/auth.js
const jwt   = require('jsonwebtoken');
const Admin = require('../models/Admin');
const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this';

/**
 * verifyAdmin
 * 1. Reads a Bearer token from Authorization header.
 * 2. Verifies it against your JWT_SECRET.
 * 3. Loads the Admin by ID from the payload.
 * 4. If found, attaches it to req.admin and calls next().
 * 5. Otherwise returns 401 or 403.
 */
async function verifyAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = auth.split(' ')[1];
  try {
    // 1. Verify & decode
    const payload = jwt.verify(token, JWT_SECRET);

    // 2. Lookup admin user
    const admin = await Admin.findById(payload.id);
    if (!admin) {
      // valid token but no such admin
      return res.status(403).json({ error: 'Forbidden: admins only' });
    }

    // 3. Attach to request and proceed
    req.admin = admin;
    next();

  } catch (err) {
    // token bad or expired
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { verifyAdmin };
