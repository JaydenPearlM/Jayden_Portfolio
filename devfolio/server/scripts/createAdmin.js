// server/scripts/createAdmin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGO = process.env.MONGO_URI;
if(!MONGO){ console.error('Set MONGO_URI in env'); process.exit(1); }

await mongoose.connect(MONGO, {});

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: ['admin'] }
});
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

const username = process.env.NEW_ADMIN_USER || 'admin';
const password = process.env.NEW_ADMIN_PASS || 'changeme123';

const exists = await Admin.findOne({ username });
if (exists) {
  console.log(`Admin "${username}" already exists. Exiting.`);
  process.exit(0);
}

const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash(password, salt);

const a = await Admin.create({ username, passwordHash });
console.log('Created admin:', a.username);
process.exit(0);
