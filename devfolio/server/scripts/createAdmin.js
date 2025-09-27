// server/scripts/createAdmin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js'; // make sure this exports the Admin model
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URI not set');
    await mongoose.connect(MONGO_URI);

    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
      console.log('ADMIN_USERNAME or ADMIN_PASSWORD missing in env — aborting');
      process.exit(1);
    }

    const existing = await Admin.findOne({ username });
    if (existing) {
      console.log(`Admin "${username}" already exists — exiting`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await Admin.create({
      username,
      passwordHash,         // <- your model field
      roles: ['admin'],     // <- your model field
    });

    console.log('Admin created:', username);
    process.exit(0);
  } catch (err) {
    console.error('createAdmin error:', err);
    process.exit(1);
  } finally {
    try { await mongoose.disconnect(); } catch {}
  }
}

run();
