const Project = require('../models/Project');

// GET all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get projects' });
  }
};

// POST new project with optional images and videos
const createProject = async (req, res) => {
  try {
    const {
      title = '',
      skills = '',
      description = '',
      goal = '',
      blocker = '',
      solution = '',
    } = req.body;

    const newProject = new Project({
      title,
      skills: skills.split(',').map(s => s.trim()),
      description,
      goal,
      blocker,
      solution,
      imagePaths: req.files?.['images']?.map(f => f.path) || [],
      videoPaths: req.files?.['videos']?.map(f => f.path) || [],
    });

    const saved = await newProject.save();
    res.status(201).json({ message: 'Project created', project: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating project', error: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};


// PUT update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      skills,
      description,
      goal,
      blocker,
      solution,
      } = req.body;

    const updatedFields = {
      ...(title && { title }),
      ...(skills && { skills: skills.split(',').map(s => s.trim()) }),
      ...(description && { description }),
      ...(goal && { goal }),
      ...(blocker && { blocker }),
      ...(solution && { solution }),
      };

    // Handle new file uploads (optional)
    if (req.files) {
      if (req.files['images']) {
        updatedFields.imagePaths = req.files['images'].map(f => f.path);
      }
      if (req.files['videos']) {
        updatedFields.videoPaths = req.files['videos'].map(f => f.path);
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project updated', project: updatedProject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating project', error: err.message });
  }
};

module.exports = {
  deleteProject,
  createProject,
  getProjects,
  updateProject,
};
