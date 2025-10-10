// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Sidebar      from './components/Sidebar';
import AdminPage    from './components/AdminPage';
import ProjectsPage from './components/ProjectsPage';
import HomePage     from './components/HomePage';
import LifeHub      from './personal-projects/LifeHub';
import TCCGRetail   from './personal-projects/TcgRetail';
import DemoPage     from './pages/DemoPage';
import AdminLogin   from './pages/AdminLogin';
import CodePreview  from './pages/CodePreview'; // 👈 NEW
import { isAuthed } from "./pages/lib/auth";
import './App.css';
import Footer from "./components/footer";

// NEW: install non-visual analytics beacons (load time, session end, client errors)
import { initAnalyticsBeacons } from './analytics/beacons';

// PrivateRoute: blocks unless token present
const PrivateRoute = ({ children }) => (
  isAuthed() ? children : <Navigate to="/home" replace />
);

// Keyboard chord for secret login (Ctrl+Alt+A)
function SecretListener() {
  const nav = useNavigate();
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.altKey && (e.key === 'a' || e.key === 'A')) {
        nav('/_/login');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nav]);
  return null;
}

// Fire pageview once per session, only on "/" or "/home"
function PageviewBeacon() {
  const { pathname } = useLocation();
  useEffect(() => {
    const onHome = pathname === '/' || pathname === '/home';
    if (!onHome) return;

    const key = `pv:${pathname}`;
    if (!sessionStorage.getItem(key)) {
      fetch('/api/analytics/pageview', { method: 'POST' })
        .catch(() => {}) // silent
        .finally(() => sessionStorage.setItem(key, '1'));
    }
  }, [pathname]);
  return null;
}

// NEW: one-time installer for the additional analytics beacons
function BeaconInstaller() {
  useEffect(() => {
    initAnalyticsBeacons();
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <BeaconInstaller />   {/* non-visual analytics listeners */}
      <SecretListener />
      <PageviewBeacon />
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex">
        <Sidebar />

        <div className="flex-1 bg-gray-50 min-h-screen p-4">
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/demo/:id" element={<DemoPage />} />
            <Route path="/LifeHub" element={<LifeHub />} />
            <Route path="/TCGRetail" element={<TCCGRetail />} />
            <Route path="/view/code/:id" element={<CodePreview />} /> {/* 👈 NEW */}
            {/* SECRET login (no nav link) */}
            <Route path="/_/login" element={<AdminLogin />} />

            {/* ADMIN-ONLY */}
            <Route path="/_/admin" element={
              <PrivateRoute><AdminPage /></PrivateRoute>
            } />
            <Route path="/_/admin/projects" element={
              <PrivateRoute><ProjectsPage /></PrivateRoute>
            } />

            {/* Everything else → public home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
         <Footer /> {/* always visible */}
  </div>
</BrowserRouter>
  );
}
