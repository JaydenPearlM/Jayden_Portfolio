import React, { useEffect, useState, useRef } from "react";
import AddProjectForm from "./AddProjectForm";
import { motion, AnimatePresence } from "framer-motion";
import './App.css';


function App() {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    skills: "",
    description: "",
    goal: "",
    blocker: "",
    solution: "",
    images: [],
    videos: [],
    githubLink: "",
    linkedin: "",
    tags: "",
  });

  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // --- Drag state ---
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    fetch("http://localhost:5000/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Fetch projects failed", err));
  }, []);

  // Reset position on open
  useEffect(() => {
    if (showForm) {
      setPosition({ x: 0, y: 0 });
    }
  }, [showForm]);

  // Drag handlers
  const onMouseDown = (e) => {
    // Only start drag if clicked on the modal itself (not inside the form inputs)
    if (e.target === dragRef.current) {
      dragging.current = true;
      const rect = dragRef.current.getBoundingClientRect();
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      e.preventDefault();
    }
  };

  const onMouseMove = (e) => {
    if (!dragging.current) return;
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const onMouseUp = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  const handleChange = (e) => {
    const { name, type, value, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      [
        "title",
        "skills",
        "description",
        "goal",
        "blocker",
        "solution",
        "githubLink",
        "linkedin",
      ].forEach((field) => {
        if (formData[field]) formDataToSend.append(field, formData[field]);
      });

      if (formData.tags) formDataToSend.append("tags", formData.tags);

      if (formData.images?.length > 0) {
        for (let i = 0; i < formData.images.length; i++) {
          formDataToSend.append("images", formData.images[i]);
        }
      }

      if (formData.videos?.length > 0) {
        for (let i = 0; i < formData.videos.length; i++) {
          formDataToSend.append("videos", formData.videos[i]);
        }
      }

      let res;
      if (editId) {
        res = await fetch(`http://localhost:5000/api/projects/${editId}`, {
          method: "PUT",
          body: formDataToSend,
        });
      } else {
        res = await fetch("http://localhost:5000/api/projects", {
          method: "POST",
          body: formDataToSend,
        });
      }

      if (!res.ok) throw new Error("Network response was not ok");

      const savedProject = await res.json();

      if (editId) {
        setProjects((prev) =>
          prev.map((p) => (p._id === editId ? savedProject : p))
        );
      } else {
        setProjects((prev) => [...prev, savedProject]);
      }

      setFormData({
        title: "",
        skills: "",
        description: "",
        goal: "",
        blocker: "",
        solution: "",
        images: [],
        videos: [],
        githubLink: "",
        linkedin: "",
        tags: "",
      });

      setEditId(null);
      setShowForm(false);
    } catch (error) {
      console.error("Failed to save project:", error);
      alert("Error saving project: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Delete failed: " + error.message);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      title: project.title || "",
      skills: project.skills || "",
      description: project.description || "",
      goal: project.goal || "",
      blocker: project.blocker || "",
      solution: project.solution || "",
      githubLink: project.githubLink || "",
      linkedin: project.linkedin || "",
      tags: project.tags ? project.tags.join(", ") : "",
      images: [],
      videos: [],
    });
    setEditId(project._id);
    setShowForm(true);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Devfolio</h1>
      <div className="text-3xl font-bold text-indigo-600 mb-6">
        Under Construction
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded"
        >
          + Add New Project
        </button>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            {/* Draggable modal container */}
            <motion.div
              className="relative bg-white p-6 rounded-md border border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] w-full max-w-2xl"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                top: position.y,
                left: position.x,
                cursor: dragging.current ? "grabbing" : "grab",
                touchAction: "none",
              }}
              ref={dragRef}
              onMouseDown={onMouseDown}
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-0.5 right-1 text-2xl text-gray-500 hover:text-black"
                aria-label="Close form"
              >
                &times;
              </button>

              <AddProjectForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <h2>Your Projects</h2>
      {projects.length === 0 && <p>No projects yet.</p>}
      {projects.map((p) => (
        <div key={p._id} style={{ marginBottom: "1rem" }}>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <a href={p.githubLink} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>{" "}
          |{" "}
          <a href={p.liveLink} target="_blank" rel="noopener noreferrer">
            Live
          </a>
          <p>Tags: {p.tags?.join(", ")}</p>
          <button onClick={() => handleEdit(p)}>✏️ Edit</button>
          <button onClick={() => handleDelete(p._id)}>🗑️ Delete</button>
        </div>
      ))}
    </div>
  );
}

export default App;
