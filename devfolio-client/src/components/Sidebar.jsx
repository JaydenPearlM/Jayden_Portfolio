// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, Menu, X } from 'lucide-react';
import { isAuthed, logout } from "../pages/lib/auth";


export default function Sidebar({ isOpen, onClose }) {
  const loc = useLocation();
  const authed = isAuthed();

  const linkClass = (target) => {
    const active = loc.pathname === target;
    return `flex items-center px-3 py-2 mb-2 rounded ${
      active ? 'bg-blue-200 font-semibold' : 'hover:bg-gray-100'
    }`;
  };

  return (
    <>
      {/* Toggle Button (Mobile only) */}
      <button
        onClick={onClose}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow border"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      <aside
        className={`w-64 bg-white border-4 border-blue-300 min-h-screen p-6 space-y-6 transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-50`}
      >
        {/* Close Button (Mobile only) */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Centered Header with solid blue background */}
        <h2 className="text-2xl font-bold text-center text-white px-4 py-3 rounded-md bg-blue-500">
          Welcome!
        </h2>

        <nav className="space-y-1">
          {/* Home Page (public) */}
          <NavLink to="/home" className={linkClass('/home')}>
            <Home className="w-5 h-5 mr-2" /> Home Page
          </NavLink>

          {/* Admin-only links */}
          {authed && (
            <>
              <Link to="/_/admin" className={linkClass('/_/admin')}>
                <LayoutDashboard className="w-5 h-5 mr-2" /> Analytics
              </Link>
              <Link to="/_/admin/projects" className={linkClass('/_/admin/projects')}>
                <LayoutDashboard className="w-5 h-5 mr-2" /> Manage Projects
              </Link>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 mb-2 rounded text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          )}
        </nav>

        {/* Bottom Bar */}
        <div className="mt-auto border-t-4 border-pink-200 pt-4 text-sm text-center text-gray-500">
          © 2025 Devfolio •{' '}
          <a href="mailto:jaydenmaxwell6790@outlook.com" className="underline">
            Contact
          </a>
        </div>
      </aside>
    </>
  );
}
