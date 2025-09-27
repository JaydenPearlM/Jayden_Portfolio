// devfolio/server/index.js
import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env (Render injects env automatically; this also supports local .env files)
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Try server/.env first (local dev), then fall back to root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // no-op if already loaded

// --- Config ---
const PORT = process.env.PORT || 5000;
// Accept either MONGO_URI or MONGODB_URI to avoid mismatch bugs
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Allow a comma-separated list, default to localhost for dev
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// --- App ---
const app = express();
app.set('trust proxy', 1); // helpful on Render/Heroku

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
app.use('/demos',   express.static(path.join(__dirname, 'public', 'demos')));

// --- Routes (ESM default exports expected) ---
import adminRoutes from './routes/admin.js';        // login/JWT routes
import projectRoutes from './routes/projects.js';   // projects CRUD
import analyticsRoutes from './routes/analytics.js';

app.use('/api/admin', adminRoutes);        // NOTE: mount once (no duplicates)
app.use('/api/projects', projectRoutes);
app.use('/api/analytics', analyticsRoutes);

// --- OPTIONAL: Serve your React build if you copy it to server/public/app ---
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
