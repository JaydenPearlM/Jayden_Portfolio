// server/routes/projectRoutes.js
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

// storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// allow code files and one thumbnail image
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // allow HTML, CSS, JS, Python, Java, ZIP
    if (['.html', '.css', '.js', '.py', '.java', '.zip'].includes(ext)) {
      return cb(null, true);
    }
    // allow a single thumbnail image
    if (file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    return cb(new Error('Unsupported file type'), false);
  }
});

// accept exactly these two fields
const cpUpload = upload.fields([
  { name: 'fileUploads', maxCount: 5 },
  { name: 'thumbnail',   maxCount: 1 }
]);

// Routes
router.post('/',    cpUpload,     createProject);
router.put('/:id',  cpUpload,     updateProject);
router.get('/',     getProjects);
router.delete('/:id', deleteProject);

module.exports = router;
