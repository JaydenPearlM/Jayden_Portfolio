// devfolio/server/index.js
const path     = require('path');
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security & parsing
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── CORS (dev: local; prod: your Netlify/Vercel domain)
const allowed = [ process.env.DEVFOLIO-CLIENT_ORIGIN || 'http://localhost:3000' ];
app.use(cors({ origin: allowed, credentials: true }));

// ── Static (thumbnails/uploads + demos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/demos',   express.static(path.join(__dirname, 'public', 'demos')));
app.use(express.static(path.join(__dirname, '..', 'devfolio-client', 'build')));

// ── Routers
const adminAuth       = require('./routes/adminAuth');
const projectRoutes   = require('./routes/project');
const analyticsRoutes = require('./routes/analytics');

// Public:
app.use('/api/admin',    adminAuth);        // POST /api/admin/login
app.use('/api/projects', projectRoutes);    // GET public; POST/PUT/DELETE protected inside the router

// Analytics: mount at /api/analytics
//   POSTs are public (in the router); GETs are verifyAdmin-protected (in the router)
app.use('/api/analytics', analyticsRoutes);

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'devfolio-client', 'build', 'index.html'));
});

// Healthcheck
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Error handler (last)
app.use((err, req, res, _next) => {
  console.error('‼️ Server error:', err);
  res.status(500).json({ error: 'Server error' });
});

// ── Connect DB & start
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
