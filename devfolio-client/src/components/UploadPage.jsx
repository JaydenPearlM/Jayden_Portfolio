import React, { useState, useEffect } from 'react';
import AddProjectForm from '../components/AddProjectForm';
import ProjectCard from '../components/ProjectCard';
import axios from 'axios';

export default function UploadPage() {
  const initialForm = {
    title: '',
    skills: '',
    goal: '',
    blocker: '',
    solution: '',
    githubLink: '',
    linkedinLink: '',
    tags: '',
    description: '',
    images: [],
    videos: [],
    demoLink: '',
    demoZip: null,
  };

  // URL validation patterns
  // allow optional "http://" or "https://", optional "www."
  // allow optional protocol, optional www., and be case-insensitive
  const githubPattern   = /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/i;
  const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/i;

  const [formData, setFormData] = useState(initialForm);
  const [projects,  setProjects]  = useState([]);
  const [preview,   setPreview]   = useState(null);
  const [error,     setError]     = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({
        ...prev,
        [name]: Array.from(files)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // clear any prior error when user types
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Validation ---
    if (formData.githubLink && !githubPattern.test(formData.githubLink)) {
      setError('Only GitHub URLs are accepted (e.g. https://github.com/yourUsername).');
      return;
    }
    if (formData.linkedinLink && !linkedinPattern.test(formData.linkedinLink)) {
      setError('Only LinkedIn URLs are accepted (e.g. https://www.linkedin.com/in/yourProfile).');
      return;
    }

    // --- Prepare multipart/form-data ---
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(file => data.append(key, file));
      } else if (value !== null && value !== '') {
        data.append(key, value);
      }
    });

    try {
      const res = await axios.post('/api/projects', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newProject = res.data.project || res.data;
      handleSave(newProject);
    } catch (err) {
      console.error('Error uploading project:', err);
      setError('Server error when uploading project. Please try again.');
    }
  };

  const loadProjects = () => {
    axios
      .get('/api/projects')
      .then(res => setProjects(res.data))
      .catch(err => console.error('Load projects error:', err));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSave = (newProject) => {
    setFormData(initialForm);
    setPreview(newProject);
    loadProjects();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Upload Projects</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {preview && (
        <div className="mb-6">
          <h2 className="font-medium mb-2">Preview</h2>
          <ProjectCard
            project={preview}
            onView={() => window.open(preview.demoLink, '_blank')}
            onDelete={null}
          />
        </div>
      )}

      <AddProjectForm
        formData={formData}
        setFormData={setFormData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        onSave={handleSave}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {projects.map(project => (
          <ProjectCard
            key={project._id}
            project={project}
            onView={() => window.open(project.demoLink, '_blank')}
            onDelete={() =>
              axios
                .delete(`/api/projects/${project._id}`)
                .then(loadProjects)
                .catch(err => console.error('Delete error:', err))
            }
          />
        ))}
      </div>
    </div>
  );
}
