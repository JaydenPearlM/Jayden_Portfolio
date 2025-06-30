// src/components/AddProjectForm.js
import React from 'react';

export default function AddProjectForm({
  formData,
  setFormData,
  handleSubmit,
  onSave
}) {
  const MAX_DESC = 500;
  const MAX_TEXT = 100;
  const DEMO_LINK_REGEX = /^https?:\/\/.+$/;

  // only validate demoLink (optional)
  const isURLValid = () => {
    const { demoLink } = formData;
    return !demoLink || DEMO_LINK_REGEX.test(demoLink);
  };

  const handleTextChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const { name, files } = e.target;
    if (name === 'fileUploads') {
      // allow up to 5 code/HTML/CSS/JS/Python files
      const sliced = Array.from(files).slice(0, 5);
      setFormData(prev => ({ ...prev, fileUploads: sliced }));
    } else if (name === 'thumbnail') {
      // single thumbnail
      setFormData(prev => ({ ...prev, thumbnail: files[0] }));
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!isURLValid()) {
      alert('Please enter a valid Demo Link URL');
      return;
    }
    await handleSubmit(e);
    if (onSave) onSave();
  };

  return (
    <div className="form-container bg-white/90 border-2 border-blue-400 border-opacity-60 shadow-lg p-6 rounded-lg max-w-4xl mx-auto mb-8">
      <h1 className="text-4xl font-bold text-indigo-700 mb-8">Jayden’s Devfolio</h1>
      <form onSubmit={onSubmit} className="space-y-3">

        {/* Title */}
        <div>
          <label htmlFor="title" className="font-medium mb-1 block">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            maxLength={MAX_TEXT}
            required
            value={formData.title || ''}
            onChange={handleTextChange}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="font-medium mb-1 block">Description</label>
          <textarea
            id="description"
            name="description"
            maxLength={MAX_DESC}
            rows={4}
            value={formData.description || ''}
            onChange={handleTextChange}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Skills */}
        <div>
          <label htmlFor="skills" className="font-medium mb-1 block">Skills</label>
          <input
            id="skills"
            name="skills"
            type="text"
            maxLength={MAX_TEXT}
            value={formData.skills || ''}
            onChange={handleTextChange}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* File Uploads */}
        <div>
          <label htmlFor="fileUploads" className="font-medium mb-1 block">File Uploads</label>
          <input
            id="fileUploads"
            name="fileUploads"
            type="file"
            accept=".html,.css,.js,.py"
            multiple
            onChange={handleFileChange}
            className="w-full"
          />
        </div>

        {/* Demo Link */}
        <div>
          <label htmlFor="demoLink" className="font-medium mb-1 block">Demo Link</label>
          <input
            id="demoLink"
            name="demoLink"
            type="url"
            maxLength={MAX_TEXT}
            value={formData.demoLink || ''}
            onChange={handleTextChange}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Github */}
        <div>
          <label htmlFor="githubLink" className="font-medium mb-1 block">Github</label>
          <input
            id="githubLink"
            name="githubLink"
            type="text"
            maxLength={MAX_TEXT}
            value={formData.githubLink || ''}
            onChange={handleTextChange}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label htmlFor="thumbnail" className="font-medium mb-1 block">Thumbnail</label>
          <input
            id="thumbnail"
            name="thumbnail"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="font-medium mb-1 block">Tags</label>
          <input
            id="tags"
            name="tags"
            type="text"
            maxLength={MAX_TEXT}
            value={formData.tags || ''}
            onChange={handleTextChange}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Project
        </button>
      </form>
    </div>
  );
}
