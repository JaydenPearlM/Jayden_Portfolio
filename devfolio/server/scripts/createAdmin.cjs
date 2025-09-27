const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

(async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Set MONGODB_URI in devfolio/.env');

    console.log('[seed] using URI scheme:', uri.startsWith('mongodb+srv://') ? 'SRV' : 'standard');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });

    const username = (process.env.ADMIN_USERNAME || '').trim();
    const password = process.env.ADMIN_PASSWORD || '';
    if (!username || !password) throw new Error('ADMIN_USERNAME/ADMIN_PASSWORD not set');

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await Admin.findOneAndUpdate(
      { username: new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      { $set: { username, passwordHash } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✔ Admin ready: ${admin.username}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg.includes('ENODATA') || msg.includes('querySrv')) {
      console.error(
        '❌ DNS SRV lookup failed for mongodb+srv. Either:\n' +
        '  • Re-copy the Atlas SRV URL (hostname typo?), or\n' +
        '  • Use Atlas “Alternative connection string” (non-SRV mongodb://), or\n' +
        '  • Temporarily use local: MONGODB_URI=mongodb://127.0.0.1:27017/devfolio'
      );
    } else {
      console.error('createAdmin error:', e);
    }
    process.exit(1);
  }
})();
