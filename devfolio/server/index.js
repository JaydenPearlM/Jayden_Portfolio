// devfolio/server/index.js (CommonJS)
const path     = require('path');
const fs       = require('fs');
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');

const ROOT_ENV   = path.join(__dirname, '..', '.env');
const SERVER_ENV = path.join(__dirname, '.env');
let ENV_TO_LOAD  = fs.existsSync(ROOT_ENV) ? ROOT_ENV : (fs.existsSync(SERVER_ENV) ? SERVER_ENV : null);
if (ENV_TO_LOAD) {
  const res = require('dotenv').config({ path: ENV_TO_LOAD });
  console.log(`[env] Loaded ${ENV_TO_LOAD}`);
  console.log(`[env] Keys:`, res.parsed ? Object.keys(res.parsed) : '(none parsed)');
} else {
  console.warn('[env] No .env file found (root or server). Using process environment only.');
}

const Project = require('./models/Project');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
const clientOriginRaw = process.env.CLIENT_ORIGIN || 'http://localhost:3000,https://<your-client>.onrender.com';
const allowedOrigins  = clientOriginRaw.split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin} not in ${allowedOrigins.join(', ')}`));
  }
}));

// Static asset mounts (uploads only; NOT serving the React app here)
function ensureDir(p){ try{ fs.mkdirSync(p,{recursive:true}); } catch(_){} }
ensureDir(path.join(__dirname, 'uploads'));
ensureDir(path.join(__dirname, 'uploads','code'));
ensureDir(path.join(__dirname, 'public','demos'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/demos',   express.static(path.join(__dirname, 'public','demos')));
app.use('/code',    express.static(path.join(__dirname, 'uploads','code')));

// Routers (API first)
const adminAuth       = require('./routes/adminAuth');
const projectRoutes   = require('./routes/project');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/admin',     adminAuth);
app.use('/api/projects',  projectRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health + visible root
app.get('/api/health', (_req,res)=>res.json({ok:true}));
app.get('/', (_req,res)=>res.type('text/plain').send('Backend OK'));

// Code viewer helpers
const CODE_FS_ROOT = path.join(__dirname, 'uploads', 'code');

app.get('/api/projects/:id/code/files', async (req,res)=>{
  try{
    const p = await Project.findById(req.params.id).lean();
    if(!p?.codeRootDir) return res.json({ files: [], rootUrl: null });

    const diskRoot = path.join(CODE_FS_ROOT, String(p._id));
    if(!fs.existsSync(diskRoot)) return res.json({ files: [], rootUrl: p.codeRootDir });

    const files = (function list(root){
      const out=[];
      (function walk(dir){
        for(const e of fs.readdirSync(dir,{withFileTypes:true})){
          const full=path.join(dir,e.name);
          const rel =path.relative(root,full).replace(/\\/g,'/');
          e.isDirectory()? walk(full) : out.push(rel);
        }
      })(root);
      return out;
    })(diskRoot);

    res.json({ files, rootUrl: p.codeRootDir });
  }catch(err){
    console.error('code/files error:',err);
    res.status(500).json({ error:'Failed to list code files' });
  }
});

app.get('/api/projects/:id/code/raw', async (req,res)=>{
  try{
    const id = String(req.params.id);
    const rel = String(req.query.path||'').replace(/^\//,'');
    if(!rel || rel.includes('..')) return res.status(400).json({ error:'Invalid path' });

    const projectDir = path.join(CODE_FS_ROOT, id);
    const filePath   = path.join(projectDir, rel);
    const norm       = path.normalize(filePath);

    if(!norm.startsWith(projectDir)) return res.status(400).json({ error:'Invalid path' });
    if(!fs.existsSync(norm) || !fs.statSync(norm).isFile()) return res.status(404).send('Not found');

    res.type('text/plain');
    fs.createReadStream(norm).pipe(res);
  }catch(err){
    console.error('code/raw error:',err);
    res.status(500).json({ error:'Failed to read file' });
  }
});

// DB connect then start
const MONGO_URI = (process.env.MONGODB_URI || '').trim();
console.log('[env] Using CLIENT_ORIGIN(s):', allowedOrigins);
console.log('[env] MONGODB_URI present?', MONGO_URI ? 'yes' : 'no');
if(!MONGO_URI){
  console.error('Mongo URI not found. Expected MONGODB_URI in env.');
  process.exit(1);
}

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 })
  .then(()=>{
    console.log('MongoDB connected');
    // 404 + error handlers LAST
    app.use((req,res)=>res.status(404).type('text/plain').send('Not found'));
    app.use((err,req,res,_next)=>{
      console.error('Server error:',err);
      res.status(500).json({ error:'Server error' });
    });

    app.listen(PORT, ()=>console.log(`Server listening on http://localhost:${PORT}`));
  })
  .catch(err=>{
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
