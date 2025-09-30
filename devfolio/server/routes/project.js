// devfolio/server/routes/project.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const {
  createProject,
  getProjects,
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

// fileFilter: allow ZIP for project files, plus images for thumbnail
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
<<<<<<< HEAD
    const isZip   = ext === '.zip';
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    if (isZip || isImage) return cb(null, true);
    return cb(new Error('Unsupported file type (only .zip for assets/code and images for thumbnail)'), false);
=======
    const isZip = ext === '.zip';
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    if (isZip || isImage) return cb(null, true);
    return cb(new Error('Unsupported file type (only .zip for assets and images for thumbnail)'), false);
>>>>>>> baa6666 (Fix upload)
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB per file
  }
});

<<<<<<< HEAD
// accept: thumbnail, project files, and optional code zip
const cpUpload = upload.fields([
  { name: 'thumbnail',    maxCount: 1 },
  { name: 'projectFiles', maxCount: 20 }, // multi-file assets
  { name: 'codeZip',      maxCount: 1 }   // NEW: single zip for extracted code
=======
// accept: assets (single ZIP) & thumbnail (single image)
const cpUpload = upload.fields([
  { name: 'assets',    maxCount: 1 }, // NEW: one .zip
  { name: 'thumbnail', maxCount: 1 }
>>>>>>> baa6666 (Fix upload)
]);

// Routes
router.post('/',      cpUpload, createProject);
router.put('/:id',    cpUpload, updateProject);
router.get('/',       getProjects);
router.delete('/:id', deleteProject);

module.exports = router;
