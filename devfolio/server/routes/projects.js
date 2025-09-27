// devfolio/server/routes/projects.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const {
  createProject,
  getProjects,
  getProjectById,   // ← make sure your controller exports this
  updateProject,
  deleteProject
} = require('../controllers/projectController');

const router = express.Router();

// ensure upload dir exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// storage: save with a timestamp prefix to avoid collisions
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-z0-9.\-_]/gi, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

// allow one .zip for assets and one image for thumbnail
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isZip = ext === '.zip';
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    if (isZip || isImage) return cb(null, true);
    return cb(new Error('Unsupported file type (only .zip for assets and images for thumbnail)'), false);
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

const cpUpload = upload.fields([
  { name: 'assets',    maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

// REST routes
router.get('.',       getProjects);        // list all
router.get('/:id',    getProjectById);     // get one (needed by DemoPage)
router.post('/',      cpUpload, createProject);
router.put('/:id',    cpUpload, updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
