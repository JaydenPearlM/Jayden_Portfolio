// devfolio/server/index.js

const path     = require('path');
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
require('dotenv').config({ debug: true, path: path.join(__dirname, '.env') });

//— your routers
const projectRoutes   = require('./routes/project');
const analyticsRoutes = require('./routes/analytics');
const testRouter      = express.Router().post('/upload', (req, res) => {
  console.log('Received payload:', req.body);
  res.json({ message: 'Hello from /api/upload!', received: req.body });
});

const app  = express();
const PORT = process.env.PORT || 5000;

//— Global middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//— Serve everything under ./uploads as static files
//   → now both images **and** any uploaded HTML/CSS/JS are publicly reachable at
//     http://localhost:5000/uploads/<projectId>/index.html, style.css, etc.
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

//— API mounts
app.use('/api/projects', projectRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api', testRouter);

//— Root sanity-check
app.get('/', (req, res) =>
  res.send('✅ Devfolio backend up! Use /api/projects or /api/admin/analytics\n')
);

//— 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

//— Error handler
app.use((err, req, res, next) => {
  console.error('‼️ Server error:', err);
  res.status(500).json({ error: 'Server error' });
});

//— Connect to Mongo and start server
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () =>
      console.log(`🚀 Server listening on http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
