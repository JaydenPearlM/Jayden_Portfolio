import React, { useEffect, useState } from "react";
import AddProjectForm from "../components/AddProjectForm";
import ProjectCard from "../components/ProjectCard"; // keep if you already have it

export default function UploadPage() {
  const initialForm = {
    title: "",
    skills: "",
    goal: "",
    blocker: "",
    solution: "",
    githubLink: "",
    linkedinLink: "",
    tags: "",
    description: "",
    thumbnail: null,
    images: [],
    demoLink: "",
  };

  const githubPattern =
    /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_.-]+(\/[A-Za-z0-9_.-]+)?\/?$/i;
  const linkedinPattern =
    /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_.-]+\/?$/i;
  const demoPattern = /^https?:\/\/.+$/i;

  const [formData, setFormData] = useState(initialForm);
  const [projects, setProjects] = useState([]);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0); // force-reset to clear file inputs after save

  const handleChange = (e) => {
    const { name, value, files, multiple } = e.target;
    if (files) {
      const arr = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        [name]: multiple ? arr : arr[0] ?? null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError("");
  };

  const handleSubmit = async () => {
    // optional URLs may be blank
    if (formData.githubLink && !githubPattern.test(formData.githubLink)) {
      setError(
        "GitHub must be a profile or repo URL (e.g. https://github.com/you or https://github.com/you/repo)."
      );
      return;
    }
    if (formData.linkedinLink && !linkedinPattern.test(formData.linkedinLink)) {
      setError("LinkedIn must look like https://www.linkedin.com/in/yourProfile");
      return;
    }
    if (formData.demoLink && !demoPattern.test(formData.demoLink)) {
      setError("Demo link must start with http:// or https://");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val == null || val === "") return;
      if (Array.isArray(val)) {
        val.forEach((v) => data.append(key, v));
      } else {
        data.append(key, val);
      }
    });

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        body: data,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Server error when uploading project.");
      }
      const json = await res.json();
      const newProject = json.project || json;

      handleSave(newProject);
    } catch (err) {
      console.error("Error uploading project:", err);
      setError(
        err?.message || "Server error when uploading project. Please try again."
      );
    }
  };

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      setProjects(Array.isArray(json) ? json : json.projects || []);
    } catch (err) {
      console.error("Load projects error:", err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSave = (newProject) => {
    setFormData(initialForm);
    setPreview(newProject);
    setFormKey((k) => k + 1); // clear file inputs
    loadProjects();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Upload Projects</h1>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {preview && (
        <div className="mb-6">
          <h2 className="font-medium mb-2">Preview</h2>
          {/* If you don't have ProjectCard, replace with your own preview markup */}
          <ProjectCard
            project={preview}
            onView={() => {
              if (preview.demoLink) window.open(preview.demoLink, "_blank");
            }}
          />
        </div>
      )}

      <AddProjectForm
        key={formKey}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        onSave={() => {}}
      />

      {/* Your uploaded projects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {projects.map((project) => (
          <ProjectCard key={project._id || project.id} project={project} />
        ))}
        {projects.length === 0 && (
          <div className="text-gray-500">No projects yet.</div>
        )}
      </div>
    </div>
  );
}
