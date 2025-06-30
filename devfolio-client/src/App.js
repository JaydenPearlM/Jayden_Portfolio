// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Sidebar      from './components/Sidebar';
import AdminPage    from './components/AdminPage';
import ProjectsPage from './components/ProjectsPage';
import UploadPage   from './components/UploadPage';
import HomePage     from './components/HomePage';
import DemoPage     from './pages/DemoPage';    // ← new import

import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex">
        <Sidebar />

        <div className="flex-1 bg-gray-50 min-h-screen p-4">
          <Routes>
            {/* Admin dashboard as main entry */}
            <Route path="/" element={<AdminPage />} />

            {/* Upload page now auto-loads the form */}
            <Route path="/upload" element={<UploadPage />} />

            {/* Projects manager (could be public or private) */}
            <Route path="/projects" element={<ProjectsPage />} />

            {/* Home page shows gallery of live projects */}
            <Route path="/home" element={<HomePage />} />

            {/* Demo page for interactive previews */}
            <Route path="/demo/:id" element={<DemoPage />} />  {/* ← new */}

            {/* Redirect any unknown URL back to admin */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
