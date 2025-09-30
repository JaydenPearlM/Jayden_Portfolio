// src/components/ProjectsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import AddProjectForm from "./AddProjectForm";

export default function ProjectsPage() {
  const initialForm = {
    title: "",
    description: "",
    skills: "",
    tags: "",
    demoLink: "",
    githubLink: "",
    linkedinLink: "",
    thumbnail: null,
    images: [],
  };

  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files, multiple } = e.target;
    if (files) {
      const arr = Array.from(files || []);
      setFormData((fd) => ({ ...fd, [name]: multiple ? arr : (arr[0] ?? null) }));
    } else {
      setFormData((fd) => ({ ...fd, [name]: value }));
    }
    setError("");
  };

  const buildFormData = () => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val == null || val === "") return;
      if (Array.isArray(val)) {
        val.forEach((v) => data.append(key, v));
      } else {
        data.append(key, val);
      }
    });
    return data;
  };

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      setProjects(Array.isArray(json) ? json : json.projects || []);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSubmit = async () => {
    try {
      const data = buildFormData();
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/projects/${editId}` : "/api/projects";

      const res = await fetch(url, { method, body: data });
      if (!res.ok) throw new Error(await res.text());

      setFormData(initialForm);
      setEditId(null);
      await loadProjects();
    } catch (err) {
      console.error("Error uploading project:", err);
      setError("Upload failed. Check console for details.");
    }
  };

  const handleEdit = (project) => {
    setFormData({
      title: project.title || "",
      description: project.description || "",
      skills: Array.isArray(project.skills) ? project.skills.join(", ") : (project.skills || ""),
      tags: Array.isArray(project.tags) ? project.tags.join(", ") : (project.tags || ""),
      demoLink: project.demoLink || "",
      githubLink: project.githubLink || "",
      linkedinLink: project.linkedinLink || "",
      thumbnail: null,
      images: [],
    });
    setEditId(project._id || project.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await loadProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 10);
  }, [projects, searchTerm]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6">
      <div className="lg:w-1/3 w-full">
        {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
        <AddProjectForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onSave={() => {}}
        />
      </div>

      <div className="lg:w-2/3 w-full">
        <h2 className="text-2xl font-semibold mb-4">Project Gallery</h2>

        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
            {filteredProjects.map((proj) => (
              <tr key={proj._id || proj.id} className="border-b hover:bg-gray-100">
                <td className="p-2">{proj.title}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => handleEdit(proj)}
                    className="px-3 py-1 bg-blue-200 text-blue-800 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(proj._id || proj.id)}
                    className="px-3 py-1 bg-red-200 text-red-800 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={2} className="p-2 text-gray-500">
                  No projects yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
