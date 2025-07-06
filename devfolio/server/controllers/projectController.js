// devfolio/server/controllers/projectController.js
const fs = require('fs');
const path = require('path');
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
      githubLink = '',
      tags = []
    } = req.body;

    // Gather fileUploads
    const fileUploadFiles = req.files.fileUploads || [];
    const fileUploadPaths = fileUploadFiles.map(f => `uploads/${f.filename}`);

    // Pick the HTML entry-point for demo
    const htmlFile = fileUploadFiles.find(f =>
      path.extname(f.originalname).toLowerCase() === '.html'
    );
    const demoLink = htmlFile ? `/uploads/${htmlFile.filename}` : '';

    // Single thumbnail (optional)
    const thumbnailPath = req.files.thumbnail?.[0]
      ? `uploads/${req.files.thumbnail[0].filename}`
      : '';

    const project = await Project.create({
      title,
      description,
      skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean),
      githubLink,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean),
      fileUploads: fileUploadPaths,
      thumbnail: thumbnailPath,
      demoLink
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
    if (!existing) return res.status(404).json({ error: 'Project not found' });

    // Update text fields
    ['title','description','githubLink'].forEach(f => {
      if (req.body[f] != null) existing[f] = req.body[f];
    });
    // Update skills & tags if present
    if (req.body.skills) existing.skills = req.body.skills.split(',').map(s => s.trim());
    if (req.body.tags)   existing.tags   = req.body.tags.split(',').map(t => t.trim());

    // Append new fileUploads & possibly update demoLink
    if (req.files.fileUploads) {
      const newPaths = req.files.fileUploads.map(f => `uploads/${f.filename}`);
      existing.fileUploads = [...existing.fileUploads, ...newPaths];
      const newHtml = req.files.fileUploads.find(f =>
        path.extname(f.originalname).toLowerCase() === '.html'
      );
      if (newHtml) existing.demoLink = `/uploads/${newHtml.filename}`;
    }

    // Replace thumbnail if uploaded
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
    if (!existing) return res.status(404).json({ error: 'Project not found' });

    // Helper to remove a file if it exists
    const removeFile = rel => {
      const full = path.join(__dirname, '..', rel);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    };

    (existing.fileUploads || []).forEach(removeFile);
    if (existing.thumbnail) removeFile(existing.thumbnail);

    await existing.deleteOne();
    res.json({ message: 'Project and files deleted' });
  } catch (err) {
    console.error('deleteProject error:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};
