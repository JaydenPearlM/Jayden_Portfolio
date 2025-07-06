// src/components/HomePage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ProjectCard from './ProjectCard'
import AboutJayden from './AboutJayden'
import '../pages/homePage.css'

export default function HomePage() {
  const [projects, setProjects] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios
      .get('/api/projects')
      .then(res => setProjects(res.data))
      .catch(err => console.error('Error loading projects:', err))
  }, [])

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="w-11/12 md:w-3/4 lg:w-2/3 mx-auto bg-gradient-to-r from-green-200 via-teal-200 to-blue-200 py-6 mb-6 text-center rounded-2xl shadow-inner">
        <h1 className="text-4xl font-extrabold text-blue-700">
          Jayden's Devfolio
        </h1>
        <p className="mt-2 text-base italic text-blue-600">
          Full-Stack Software Engineer plus AI &amp; Machine Learning
        </p>
      </div>

      {/* Main: About (left) & Projects (right) */}
      <div className="flex max-w-7xl mx-auto p-8 bg-white bg-opacity-80 rounded-lg shadow-lg">
        {/* About section: wider */}
        <aside className="w-1/2 flex items-center pr-8">
          <AboutJayden />
        </aside>

        {/* Divider */}
        <div className="w-px bg-blue-200 mx-6" />

        {/* Projects grid */}
        <section className="w-3/5">
          <h2 className="text-3xl font-oswald font-bold mb-4 text-blue-700">
            Projects
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
            {projects.map(proj => (
              <ProjectCard
                key={proj._id}
                project={proj}
                onView={() => navigate(`/demo/${proj._id}`)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
