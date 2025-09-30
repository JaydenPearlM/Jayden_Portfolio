// devfolio/server/index.js
const path     = require('path');
const fs       = require('fs');
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const Project = require('./models/Project'); // 👈 for code viewer

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security & parsing
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── CORS (dev: local; prod: your Netlify/Vercel domain)
const allowed = [ process.env.CLIENT_ORIGIN || 'http://localhost:3000' ];
app.use(cors({ origin: allowed, credentials: true }));

// ── Static (thumbnails/uploads + demos + code)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/demos',   express.static(path.join(__dirname, 'public', 'demos')));
app.use('/code',    express.static(path.join(__dirname, 'uploads', 'code'))); // 👈 serve code dir

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

// ── Code viewer helpers/endpoints
const CODE_FS_ROOT = path.join(__dirname, 'uploads', 'code');

// GET list of code files for a project
app.get('/api/projects/:id/code/files', async (req, res) => {
  try {
    const p = await Project.findById(req.params.id).lean();
    if (!p?.codeRootDir) return res.json({ files: [], rootUrl: null });

    const diskRoot = path.join(CODE_FS_ROOT, String(p._id));
    if (!fs.existsSync(diskRoot)) return res.json({ files: [], rootUrl: p.codeRootDir });

    function listFilesRecursively(root) {
      const out = [];
      (function walk(dir) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, e.name);
          const rel  = path.relative(root, full).replace(/\\/g, '/');
          if (e.isDirectory()) walk(full);
          else out.push(rel);
        }
      })(root);
      return out;
    }

    const files = listFilesRecursively(diskRoot);
    return res.json({ files, rootUrl: p.codeRootDir });
  } catch (err) {
    console.error('code/files error:', err);
    return res.status(500).json({ error: 'Failed to list code files' });
  }
});

// GET raw contents of a specific code file
app.get('/api/projects/:id/code/raw', async (req, res) => {
  try {
    const id = String(req.params.id);
    const relParam = String(req.query.path || '').replace(/^\//, '');

    // guard against traversal
    if (!relParam || relParam.includes('..')) {
      return res.status(400).json({ error: 'Invalid path' });
    }

    const projectDir = path.join(CODE_FS_ROOT, id);
    const filePath   = path.join(projectDir, relParam);
    const normalized = path.normalize(filePath);

    if (!normalized.startsWith(projectDir)) {
      return res.status(400).json({ error: 'Invalid path' });
    }
    if (!fs.existsSync(normalized) || !fs.statSync(normalized).isFile()) {
      return res.status(404).send('Not found');
    }

    res.type('text/plain');
    fs.createReadStream(normalized).pipe(res);
  } catch (err) {
    console.error('code/raw error:', err);
    return res.status(500).json({ error: 'Failed to read file' });
  }
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
