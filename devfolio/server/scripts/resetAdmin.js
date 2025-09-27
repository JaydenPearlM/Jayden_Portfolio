// server/scripts/resetAdmin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGO = process.env.MONGO_URI;
if (!MONGO) { console.error('MONGO_URI env var is missing'); process.exit(1); }
await mongoose.connect(MONGO, {});

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: ['admin'] }
});
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

const username = process.env.NEW_ADMIN_USER || 'admin';
const newPass  = process.env.NEW_ADMIN_PASS || 'changeme123';

let admin = await Admin.findOne({ username });
const passwordHash = await bcrypt.hash(newPass, 10);

if (!admin) {
  admin = await Admin.create({ username, passwordHash, roles: ['admin'] });
  console.log(`Created admin "${username}" with a new password.`);
} else {
  admin.passwordHash = passwordHash;
  await admin.save();
  console.log(`Reset password for "${username}".`);
}

console.log('Done.');
process.exit(0);
