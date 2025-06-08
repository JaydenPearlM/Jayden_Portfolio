const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  skills: [String],
  description: String,
  goal: String,
  blocker: String,
  solution: String,
  imagePaths:[String],
  videoPaths: [String],
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);

