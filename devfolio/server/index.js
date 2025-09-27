// devfolio/server/index.js (CommonJS)

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); // load devfolio/.env

// --- Config ---
const PORT = process.env.PORT || 5000;
// Accept either MONGO_URI or MONGODB_URI
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Allow comma-separated origins, default to localhost:3000
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// --- App ---
const app = express();
app.set('trust proxy', 1); // needed for Render/Heroku

// Security & parsing
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Static (uploads, extracted demos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/demos', express.static(path.join(__dirname, 'public', 'demos')));

// --- Routes ---
app.use('/api/admin', require('./routes/admin'));       // login/JWT routes
app.use('/api/projects', require('./routes/projects')); // projects CRUD
app.use('/api/analytics', require('./routes/analytics'));// analytics

// --- OPTIONAL: Serve React build if copied to server/public/app ---
// const appBuild = path.join(__dirname, 'public', 'app');
// app.use(express.static(appBuild));
// app.get('*', (_req, res) => res.sendFile(path.join(appBuild, 'index.html')));


// --- Start ---
(async () => {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URI (or MONGODB_URI) not set');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
})();
