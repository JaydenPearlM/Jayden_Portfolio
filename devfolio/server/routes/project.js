const express = require("express");
const router = express.Router();
const multer = require("multer");

const { createProject, getProjects, updateProject, deleteProject } = require("../controllers/projectController");

// Multer configuration
const upload = multer({ dest: 'uploads/' });
const cpUpload = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 }
]);

// Routes
router.post('/', cpUpload, createProject);       // POST new project with file uploads
router.get('/', getProjects);
router.put('/:id', cpUpload, updateProject);    // PUT update project with file uploads
router.delete('/:id', deleteProject);

module.exports = router;
