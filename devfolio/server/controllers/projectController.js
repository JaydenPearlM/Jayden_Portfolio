// devfolio/server/controllers/projectController.js
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const unzipper = require('unzipper'); // make sure installed: npm i unzipper
const Project = require('../models/Project');

const ROOT_DIR   = path.join(__dirname, '..');
const UPLOAD_DIR = path.join(ROOT_DIR, 'uploads');
const DEMOS_DIR  = path.join(ROOT_DIR, 'public', 'demos');

// ensure demos dir exists
(async () => {
  try { await fsp.mkdir(DEMOS_DIR, { recursive: true }); } catch {}
})();

// --- helpers ---------------------------------------------------------------

// split "a, b, c" -> ["a","b","c"]
function splitList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
  return String(val).split(',').map(s => s.trim()).filter(Boolean);
}

// recursively find first index.html under root; returns relative path using forward slashes
async function findIndexHtmlRelative(root) {
  const stack = ['']; // relative paths to visit; '' = root itself
  while (stack.length) {
    const rel = stack.pop();
    const dir = path.join(root, rel);
    let entries = [];
    try {
      entries = await fsp.readdir(dir, { withFileTypes: true });
    } catch { continue; }

    for (const ent of entries) {
      const entRel = path.join(rel, ent.name);
      if (ent.isDirectory()) {
        stack.push(entRel);
      } else if (ent.isFile()) {
        if (ent.name.toLowerCase() === 'index.html') {
          // return forward-slash path for URLs
          return entRel.split(path.sep).join('/');
        }
      }
    }
  }
  return null;
}

// unzip a file to destination, returns relative path to located index.html (or null)
async function unzipAndLocateIndex(zipFileFullPath, destDir) {
  await fsp.mkdir(destDir, { recursive: true });

  await new Promise((resolve, reject) => {
    fs.createReadStream(zipFileFullPath)
      .pipe(unzipper.Extract({ path: destDir }))
      .on('close', resolve)
      .on('error', reject);
  });

  return await findIndexHtmlRelative(destDir);
}

// build a public URL for demos with a given projectId and relative index path
function demoUrl(projectId, relIndexPath) {
  // ensure forward slashes
  const rel = (relIndexPath || 'index.html').replace(/\\/g, '/');
  return `/demos/${projectId}/${rel}`;
}

// --- controllers -----------------------------------------------------------

// GET all projects
exports.getProjects = async (_req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    console.error('getProjects error:', err);
    res.status(500).json({ error: 'Failed to get projects' });
  }
};

// POST new project (ZIP assets + optional thumbnail)
exports.createProject = async (req, res) => {
  try {
    const {
      title = '',
      description = '',
      skills = '',
      githubLink = '',
      linkedinLink = '',
      tags = '',
      demoLink = ''
    } = req.body || {};

    if (!title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const assetsZip = req.files?.assets?.[0] || null;
    const thumbFile = req.files?.thumbnail?.[0] || null;

    // Prepare project (need _id up front)
    const project = new Project({
      title: title.trim(),
      description,
      skills: splitList(skills),
      tags: splitList(tags),
      githubLink: githubLink || '',
      linkedinLink: linkedinLink || '',
      thumbnail: '',
      fileUploads: [],
      demoLink: demoLink || ''
    });

    const projectId = project._id.toString();

    // Save thumbnail path if provided
    if (thumbFile) {
      project.thumbnail = `uploads/${thumbFile.filename}`;
    }

    // Handle the ZIP (more tolerant: index.html can be nested)
    if (assetsZip) {
      const zipFull = path.join(UPLOAD_DIR, assetsZip.filename);
      const dest    = path.join(DEMOS_DIR, projectId);

      const relIndex = await unzipAndLocateIndex(zipFull, dest);
      if (!relIndex) {
        return res.status(400).json({ error: 'ZIP must contain an index.html (root or any subfolder)' });
      }

      project.fileUploads = [`uploads/${assetsZip.filename}`]; // keep original zip path if you want
      project.demoLink = demoUrl(projectId, relIndex);
    }

    const saved = await project.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('createProject error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT update project (accept new ZIP or new thumbnail)
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // text fields
    if (req.body.title != null)        project.title = String(req.body.title);
    if (req.body.description != null)  project.description = String(req.body.description);
    if (req.body.githubLink != null)   project.githubLink = String(req.body.githubLink);
    if (req.body.linkedinLink != null) project.linkedinLink = String(req.body.linkedinLink);
    if (req.body.skills != null)       project.skills = splitList(req.body.skills);
    if (req.body.tags != null)         project.tags   = splitList(req.body.tags);

    const assetsZip = req.files?.assets?.[0] || null;
    const thumbFile = req.files?.thumbnail?.[0] || null;

    // replace thumbnail if provided
    if (thumbFile) {
      project.thumbnail = `uploads/${thumbFile.filename}`;
    }

    // new ZIP → wipe old extracted files and re-unzip
    if (assetsZip) {
      const zipFull = path.join(UPLOAD_DIR, assetsZip.filename);
      const dest    = path.join(DEMOS_DIR, id);

      // clean dest (ignore errors)
      try {
        const entries = await fsp.readdir(dest, { withFileTypes: true });
        await Promise.all(entries.map(ent => fsp.rm(path.join(dest, ent.name), { recursive: true, force: true })));
      } catch {}

      const relIndex = await unzipAndLocateIndex(zipFull, dest);
      if (!relIndex) {
        return res.status(400).json({ error: 'ZIP must contain an index.html (root or any subfolder)' });
      }

      project.demoLink = demoUrl(id, relIndex);
      project.fileUploads = project.fileUploads || [];
      project.fileUploads.push(`uploads/${assetsZip.filename}`);
    }

    const updated = await project.save();
    res.json(updated);
  } catch (err) {
    console.error('updateProject error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE project + its files (remove extracted demo & uploaded zips/thumbnail)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // remove extracted demo folder
    const demoFolder = path.join(DEMOS_DIR, String(project._id));
    try {
      await fsp.rm(demoFolder, { recursive: true, force: true });
    } catch {}

    // remove uploaded files we tracked
    const removeFile = async (rel) => {
      try { await fsp.rm(path.join(ROOT_DIR, rel), { force: true }); } catch {}
    };
    if (project.fileUploads?.length) {
      await Promise.all(project.fileUploads.map(removeFile));
    }
    if (project.thumbnail) {
      await removeFile(project.thumbnail);
    }

    await project.deleteOne();
    res.json({ message: 'Project and files deleted' });
  } catch (err) {
    console.error('deleteProject error:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};
