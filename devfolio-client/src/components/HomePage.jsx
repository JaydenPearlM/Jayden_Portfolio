// src/components/HomePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import ProjectCard from "./ProjectCard";
import AboutJayden from "./AboutJayden";      // ✅ relative import
import ResumeLinks from "./ResumeLinks";      // ✅ make sure file exists at src/components/ResumeLinks.jsx

import "../pages/homePage.css";

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("projects")
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Error loading projects:", err));
  }, []);

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto bg-gradient-to-r from-green-200 via-teal-200 to-blue-200 py-6 mb-6 text-center rounded-2xl shadow-inner">
        <h1 className="text-4xl font-extrabold text-blue-700">Jayden's Devfolio</h1>
        <p className="mt-2 text-base italic text-blue-600">
          Full-Stack Software Engineer plus AI &amp; Machine Learning
        </p>
      </div>

      {/* Main: About (left) & Projects (right) */}
      <div className="flex items-start gap-6 max-w-[1500px] mx-auto p-8 bg-white bg-opacity-80 rounded-lg shadow-lg">
        {/* Left column */}
        <aside className="basis-2/5 pr-2">
          <div className="w-full space-y-8">
            <AboutJayden />
            <ResumeLinks /> {/* 👈 renders right under About Jayden */}
          </div>
        </aside>

        {/* Divider */}
        <div className="self-stretch w-px bg-blue-200" />

        {/* Right column: Projects */}
        <section className="basis-3/5">
          <h2 className="text-3xl font-oswald font-bold mb-4 text-blue-700">Projects</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <ProjectCard
                key={proj._id || proj.id}
                project={proj}
                onView={() => navigate(`/demo/${proj._id || proj.id}`)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
