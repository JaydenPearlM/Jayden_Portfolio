const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  skills: [String],
  description: String,
  goal: String,
  blocker: String,
  solution: String,  
  githubLink: String,
  demoLink: String,
  //demoZipPath: String,
  tags: [String],
  imagePaths:[String],
  videoPaths: [String],
}, {
  timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model("Project", projectSchema);


