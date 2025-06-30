// devfolio-client/src/pages/ProjectsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddProjectForm from './AddProjectForm';
import ProjectCard from './ProjectCard';

export default function ProjectsPage() {
  const initialForm = {
    title: '',
    description: '',
    githubLink: '',
    linkedin: '',
    tags: '',
    images: [],
    videos: [],
    demoLink: '',
    demoZip: null,
  };

  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(fd => ({ ...fd, [name]: Array.from(files) }));
    } else {
      setFormData(fd => ({ ...fd, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach(v => data.append(key, v));
      } else if (val != null) {
        data.append(key, val);
      }
    });

    try {
      if (editId) {
        await axios.put(`/api/projects/${editId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('/api/projects', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setFormData(initialForm);
      setEditId(null);
      loadProjects();
    } catch (error) {
      console.error('Error uploading project:', error);
    }
  };

  const loadProjects = () => {
    axios
      .get('/api/projects')
      .then(res => setProjects(res.data))
      .catch(err => console.error('Failed to load projects:', err));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleEdit = project => {
    setFormData({
      ...project,
      images: [],
      videos: [],
      demoZip: null,
    });
    setEditId(project._id);
  };

  const handleDelete = id => {
    // Ask for confirmation before deleting
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    axios
      .delete(`/api/projects/${id}`)
      .then(() => loadProjects())
      .catch(err => console.error('Failed to delete project:', err));
  };

  const filteredProjects = projects
    .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 10);

  return (
    <div className="flex gap-8 p-6">
      {/* Upload Form */}
      <div className="w-1/3">
        <AddProjectForm
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
      </div>

      {/* Project List and Grid */}
      <div className="w-2/3">
        <h2 className="text-2xl font-semibold mb-4">Project Gallery</h2>

        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="mb-4 w-full p-2 border rounded"
        />

        <table className="w-full text-left mb-6">
          <thead>
            <tr className="border-b">
              <th className="p-2">Title</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(proj => (
              <tr key={proj._id} className="border-b hover:bg-gray-100">
                <td className="p-2">{proj.title}</td>
                <td className="p-2 space-x-2">
                  <button
                    className="bg-yellow-400 text-white px-3 py-1 rounded"
                    onClick={() => handleEdit(proj)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(proj._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
