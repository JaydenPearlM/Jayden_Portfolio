// devfolio/server/index.js (CommonJS)
const path     = require('path');
const fs       = require('fs');
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');

// ── Load .env (prefer repo root: devfolio/.env; fallback: devfolio/server/.env)
const ROOT_ENV   = path.join(__dirname, '..', '.env');
const SERVER_ENV = path.join(__dirname, '.env');
let ENV_TO_LOAD  = null;

app.get('/', (req, res) => {
  res.type('text/plain').send('Backend working fine');
});
app.use((req, res) => {
  res.status(404).type('text/plain').send('Not found');
});


if (fs.existsSync(ROOT_ENV)) {
  ENV_TO_LOAD = ROOT_ENV;
} else if (fs.existsSync(SERVER_ENV)) {
  ENV_TO_LOAD = SERVER_ENV;
}

if (ENV_TO_LOAD) {
  const res = require('dotenv').config({ path: ENV_TO_LOAD });
  console.log(`[env] Loaded ${ENV_TO_LOAD}`);
  console.log(`[env] Keys:`, res.parsed ? Object.keys(res.parsed) : '(none parsed)');
} else {
  console.warn('[env] No .env file found (root or server). Using process environment only.');
}


const Project = require('./models/Project'); // for code viewer

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security & parsing
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── CORS (dev: local; prod: your domain[s])
// Support single origin or comma-separated list in CLIENT_ORIGIN
const clientOriginRaw = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const allowedOrigins = clientOriginRaw.split(',').map(s => s.trim()).filter(Boolean);




app.use(cors({
  origin: function (origin, cb) {
    // allow same-origin (no Origin header) and allowed list
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin} not in ${allowedOrigins.join(', ')}`));
  },
  credentials: true
}));

// ── Ensure static dirs exist (won’t crash if missing)
function ensureDir(p) { try { fs.mkdirSync(p, { recursive: true }); } catch (_) {} }
ensureDir(path.join(__dirname, 'uploads'));
ensureDir(path.join(__dirname, 'uploads', 'code'));
ensureDir(path.join(__dirname, 'public', 'demos'));

// ── Static (thumbnails/uploads + demos + code)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/demos',   express.static(path.join(__dirname, 'public', 'demos')));
app.use('/code',    express.static(path.join(__dirname, 'uploads', 'code'))); // serve code dir

// ── Routers
const adminAuth       = require('./routes/adminAuth');
const projectRoutes   = require('./routes/project');
const analyticsRoutes = require('./routes/analytics');

// Public routes
app.use('/api/admin',    adminAuth);      // POST /api/admin/login
app.use('/api/projects', projectRoutes);  // GET public; POST/PUT/DELETE protected inside router
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
const MONGO_URI = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim();
console.log('[env] Using CLIENT_ORIGIN(s):', allowedOrigins);
console.log('[env] MONGO_URI present?', MONGO_URI ? 'yes' : 'no');
if (!MONGO_URI) {
  console.error('❌ Mongo URI not found. Expected MONGO_URI or MONGODB_URI in the loaded .env or process env.');
  console.error('   process.env.MONGO_URI   =', process.env.MONGO_URI);
  console.error('   process.env.MONGODB_URI =', process.env.MONGODB_URI);
  process.exit(1);
}

// With Mongoose 7+, these legacy options are not required.
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '..', '..', 'devfolio-client', 'build');
  app.use(express.static(clientPath));
  app.get('*', (req, res) => {
   if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/demos') ||
      req.path.startsWith('/code')
    ) return res.status(404).end();
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}
