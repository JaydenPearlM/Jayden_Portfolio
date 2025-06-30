// src/pages/DemoPage.js
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export default function DemoPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 5
        return next < 100 ? next : 100
      })
    }, 100)

    axios.get(`/api/projects/${id}`)
      .then(res => {
        setProject(res.data)
        setProgress(100)
      })
      .catch(err => {
        console.error(err)
        setProgress(100)
      })

    return () => clearInterval(interval)
  }, [id])

  // loading screen with progress bar
  if (!project) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
      }}>
        <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          Loading Demo... {progress}%
        </p>
        <div style={{
          width: '80%',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#5b21b6',
            transition: 'width 0.1s linear'
          }} />
        </div>
      </div>
    )
  }

  // once loaded, show iframe demo
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: 16, borderBottom: '1px solid #eee' }}>
        <h2>{project.title} Demo</h2>
      </header>
      <iframe
        title={`Demo: ${project.title}`}
        src={`/uploads/${project._id}/index.html`}
        style={{ flexGrow: 1, border: 'none' }}
      />
    </div>
  )
}
