import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ProjectCard from './ProjectCard'
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
      <div className="w-11/12 md:w-3/4 lg:w-2/3 mx-auto bg-gradient-to-r from-green-200 via-teal-200 to-blue-200 py-6 mb-6 text-center rounded-2xl shadow-inner">
        <h1 className="text-4xl font-extrabold text-blue-700">
          Jayden's Devfolio
        </h1>
        {/* Professional Tagline */}
        <p className="mt-2 text-base italic text-blue-600">
          Full-Stack Software Engineer plus AI &amp; Machine Learning
        </p>
      </div>

      {/* Main Content */}
      <div className="flex max-w-7xl mx-auto p-8 bg-white bg-opacity-80 rounded-lg shadow-lg">
        {/* About Me Section with Action Buttons Above */}
        <aside className="w-1/3 pr-8">
          {/* Action Buttons */}
          <div className="flex space-x-4 mb-6">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener"
              className="px-4 py-2 bg-green-200 hover:bg-green-300 text-green-800 rounded"
            >
              Resume
            </a>
            <a
              href="/cv.pdf"
              target="_blank"
              rel="noopener"
              className="px-4 py-2 bg-teal-200 hover:bg-teal-300 text-teal-800 rounded"
            >
              CV
            </a>
            <button
              onClick={() => window.open('https://linkedin.com/in/your-profile', '_blank')}
              className="px-4 py-2 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded"
            >
              LinkedIn
            </button>
          </div>

          <h2 className="text-3xl font-bold mb-4 text-blue-700">About Me</h2>
          <p className="text-gray-700">
            Hi, I’m Jayden Maxwell, a full-stack software engineer passionate about
            building clean, user-friendly web applications and exploring new tech.
          </p>
        </aside>

        {/* Divider Bar */}
        <div className="w-px bg-blue-200 mx-6" />

        {/* Projects Grid */}
        <section className="w-2/3">
          <h2 className="text-3xl font-bold mb-4 text-blue-700">Projects</h2>
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
