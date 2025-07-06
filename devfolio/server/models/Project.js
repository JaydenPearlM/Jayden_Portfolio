// server/models/Project.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema({
  title:       { type: String, required: true },
  description: { type: String },

  // now store skills as an array of strings
  skills:      { type: [String], default: [] },

  // raw uploaded files (HTML, CSS, JS, Python, notebooks, specs, etc.)
  fileUploads: { type: [String], default: [] },

  // thumbnail path
  thumbnail:   { type: String },

  // single HTML entry point for live demo
  demoLink:    { type: String },

  // categorized uploads
  codeFiles:    { type: [String], default: [] }, // .js, .css, .py
  notebookFiles:{ type: [String], default: [] }, // converted .ipynb → .html
  apiSpecs:     { type: [String], default: [] }, // .json/.yaml OpenAPI specs

  // optional direct Colab URL
  colabLink:   { type: String },

  // GitHub repository link
  githubLink: {
    type: String,
    validate: {
      // only validate non-empty values
      validator: v => !v || /^https?:\/\/(www\.)?github\.com\/.+$/.test(v),
      message:  'Only GitHub URLs are accepted (e.g. https://github.com/yourUsername/repo)'
    }
  },

  // tags as an array of strings
  tags:        { type: [String], default: [] }

}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
