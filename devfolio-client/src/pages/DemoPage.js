// src/pages/DemoPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from './lib/api';

export default function DemoPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { data } = await api.get(`/api/projects/${id}`);
        if (!ignore) setProject(data);
      } catch (e) {
        console.error('Failed to load project', e);
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  if (!project) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Loading demo…</h2>
      </div>
    );
  }

  // Your server will serve extracted demo files under /demos/:id/
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: 16, borderBottom: '1px solid #eee' }}>
        <h2>{project.title} — Demo</h2>
      </header>
      <iframe
        title={`Demo: ${project.title}`}
        src={`/demos/${project._id || id}/index.html`}
        style={{ flexGrow: 1, border: 'none' }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
