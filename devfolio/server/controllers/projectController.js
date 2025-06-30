// devfolio/server/controllers/projectController.js

const fs     = require('fs');
const path   = require('path');
const Project = require('../models/Project');

// ── GET all projects ───────────────────────────────────────────────────────────
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    console.error('getProjects error:', err);
    res.status(500).json({ error: 'Failed to get projects' });
  }
};

// ── POST new project with fileUploads + thumbnail ─────────────────────────────
exports.createProject = async (req, res) => {
  try {
    // Text fields
    const {
      title = '',
      description = '',
      skills = '',
      demoLink = '',
      githubLink = '',
      tags = ''
    } = req.body;

    // Gather fileUploads (up to 5) and thumbnail (single)
    const fileUploadPaths = (req.files.fileUploads || [])
      .map(f => `uploads/${f.filename}`);

    const thumbnailPath = req.files.thumbnail?.[0]
      ? `uploads/${req.files.thumbnail[0].filename}`
      : '';

    // Build and save
    const project = await Project.create({
      title,
      description,
      skills,
      demoLink,
      githubLink,
      tags,
      fileUploads: fileUploadPaths,
      thumbnail: thumbnailPath
    });

    res.status(201).json(project);
  } catch (err) {
    console.error('createProject error:', err);
    res.status(400).json({ error: err.message });
  }
};

// ── PUT update project ─────────────────────────────────────────────────────────
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Project.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update text fields if provided
    ['title','description','skills','demoLink','githubLink','tags']
      .forEach(field => {
        if (req.body[field] != null) {
          existing[field] = req.body[field];
        }
      });

    // Append any newly uploaded fileUploads
    if (req.files.fileUploads) {
      const newPaths = req.files.fileUploads.map(f => `uploads/${f.filename}`);
      existing.fileUploads = [...(existing.fileUploads || []), ...newPaths];
    }

    // Replace thumbnail if a new one was uploaded
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      existing.thumbnail = `uploads/${req.files.thumbnail[0].filename}`;
    }

    const updated = await existing.save();
    res.json(updated);
  } catch (err) {
    console.error('updateProject error:', err);
    res.status(400).json({ error: err.message });
  }
};

// ── DELETE project + its files ────────────────────────────────────────────────
exports.deleteProject = async (req, res) => {
  try {
    const existing = await Project.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Helper to remove a file if it exists
    const removeFile = rel => {
      const full = path.join(__dirname, '..', rel);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    };

    // Delete uploaded files
    (existing.fileUploads || []).forEach(removeFile);
    if (existing.thumbnail) removeFile(existing.thumbnail);

    // Delete the document
    await existing.deleteOne();
    res.json({ message: 'Project and files deleted' });
  } catch (err) {
    console.error('deleteProject error:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};
