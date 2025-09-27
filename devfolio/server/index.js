// devfolio/server/index.js
const path     = require('path');
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');

require('dotenv').config({ path: path.join(__dirname, '.env') });


const PORT = process.env.PORT || 5000;
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/admin'); // path/casing must match exactly on Linux

const app = express();

app.use(express.json()); // <-- required so req.body has username/password
// If frontend is on a different origin (separate service), enable CORS:
// app.use(cors({ origin: ['https://YOUR-FRONTEND.onrender.com'], credentials: true }));

app.use('/api/admin', adminRoutes);

// ── Security & parsing
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── CORS
// Allow a comma-separated list in CLIENT_ORIGIN, default to localhost for dev
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(s => s.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// ── Static (thumbnails/uploads + extracted demos + SPA build)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/demos',   express.static(path.join(__dirname, 'public', 'demos')));

// mount API routes
app.use('/api/admin',     require('./routes/adminAuth'));
app.use('/api/projects',  require('./routes/projects'));
app.use('/api/analytics', require('./routes/analytics'));

// ── Serve React build if copied into server/public/app
const appBuild = path.join(__dirname, 'public', 'app');
app.use(express.static(appBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(appBuild, 'index.html'));
});

// ── Error handler
app.use((err, req, res, next) => {
  console.error('‼️ Server error:', err);
  res.status(500).json({ error: 'Server error' });
});

// ── Connect DB & start
mongoose.connect(process.env.MONGODB_URI, { })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
