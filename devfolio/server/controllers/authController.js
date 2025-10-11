// server/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

// Seed from env if empty or username changed
async function ensureInitialAdmin() {
  const envUser = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
  const envPass = (process.env.ADMIN_PASSWORD || '').trim();

  if (!envUser || !envPass) return; // skip if not provided

  const existing = await AdminUser.findOne({ username: envUser });
  if (existing) return;

  const count = await AdminUser.countDocuments();
  const passwordHash = await bcrypt.hash(envPass, 12);

  if (count === 0) {
    await AdminUser.create({ username: envUser, passwordHash });
  } else {
    // username changed: update first admin to new username/pass
    const first = await AdminUser.findOne();
    first.username = envUser;
    first.passwordHash = passwordHash;
    await first.save();
  }
}

// POST /api/admin/login
async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  const user = await AdminUser.findOne({ username: String(username).toLowerCase().trim() });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ sub: 'admin', user: user.username }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
}

// POST /api/admin/change-password  (auth required)
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing currentPassword or newPassword' });
  }

  const user = await AdminUser.findOne(); // single-admin
  if (!user) return res.status(404).json({ error: 'Admin not found' });

  const ok = await bcrypt.compare(String(currentPassword), user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Current password incorrect' });

  user.passwordHash = await bcrypt.hash(String(newPassword), 12);
  await user.save();
  res.json({ ok: true });
}

module.exports = { ensureInitialAdmin, login, changePassword };
