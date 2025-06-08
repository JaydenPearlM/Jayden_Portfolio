import React from 'react';

function AddProjectForm({ formData, handleChange, handleSubmit }) {
  return (
    <div className="form-container bg-white/90 border-2 border-blue-400 border-opacity-60 shadow-lg p-6 rounded-lg max-w-4xl mx-auto mb-8">
      <h1 className="text-4xl font-bold text-indigo-700 mb-8">Devfolio</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { id: "title", label: "Project Title" },
          { id: "skill", label: "Skills Used" },
          { id: "goal", label: "The Goal" },
          { id: "blocker", label: "Any Blocker" },
          { id: "solution", label: "A Solution" },
          { id: "githubLink", label: "GitHub Link" },
          { id: "linkedin", label: "Linkedin Link"},
          { id: "tags", label: "Tags (comma-separated)" },
        ].map(({ id, label }) => (
          <div key={id} className="flex items-center">
            <label htmlFor={id} className="w-1/3 font-semibold text-gray-700">
              {label}
            </label>
            <input
              type="text"
              id={id}
              name={id}
              value={formData[id] || ""}
              onChange={handleChange}
              className="w-2/3 p-2 border rounded"
            />
          </div>
        ))}

        {/* Description Field (scrollable, 500 char max) */}
        <div className="flex items-start">
          <label htmlFor="description" className="w-1/3 font-semibold text-gray-700 mt-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={500}
            rows={4}
            className="w-2/3 p-2 border rounded resize-none overflow-y-scroll"
            placeholder="Max 500 characters..."
          />
        </div>

        {/* Image Upload */}
        <div className="flex items-center">
          <label htmlFor="images" className="w-1/3 font-semibold text-gray-700">
            Upload Images
          </label>
          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            multiple
            onChange={handleChange}
            className="w-2/3 p-2"
          />
        </div>

        {/* Video Upload */}
        <div className="flex items-center">
          <label htmlFor="videos" className="w-1/3 font-semibold text-gray-700">
            Upload Videos
          </label>
          <input
            type="file"
            id="videos"
            name="videos"
            accept="video/*"
            multiple
            onChange={handleChange}
            className="w-2/3 p-2"
          />
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            {formData._id ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProjectForm;
