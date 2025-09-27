// devfolio/server/index.js (CommonJS)

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.PORT || 5000;
// prefer the standard name first
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',').map(s => s.trim()).filter(Boolean);

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get('/health', (_req, res) => res.json({ ok: true }));

// static assets for uploads/demos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/demos',   express.static(path.join(__dirname, 'public', 'demos')));

// --- APIs ---
app.use('/api/admin', require('./routes/admin'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/analytics', require('./routes/analytics'));

// --- React build (SPA) ---
const appBuild = path.join(__dirname, 'public', 'app');
app.use(express.static(appBuild));
// send index.html for any non-API route (keeps /api/* working)
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(appBuild, 'index.html'));
});

// --- Start ---
(async () => {
  try {
    if (!MONGO_URI) throw new Error('MONGODB_URI (or MONGO_URI) not set');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
})();
