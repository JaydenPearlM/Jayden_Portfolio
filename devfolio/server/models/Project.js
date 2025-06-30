// server/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  // now store skills as an array of strings
  skills:      { type: [String], default: [] },
  fileUploads: [String],
  demoLink:    { type: String },
  githubLink: {
    type: String,
    validate: {
      // only validate non-empty values
      validator: v => !v || /^https?:\/\/(www\.)?github\.com\/.+$/.test(v),
      message:  'Only GitHub URLs are accepted (e.g. https://github.com/yourUsername/repo)'
    }
  },
  // thumbnail path
  thumbnail:   { type: String },
  // tags as an array of strings
  tags:        { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
