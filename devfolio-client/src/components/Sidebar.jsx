import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, Home, Menu, X } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const linkClass = ({ isActive }) =>
    `flex items-center px-3 py-2 mb-2 rounded ${
      isActive ? 'bg-blue-200 font-semibold' : 'hover:bg-gray-100'
    }`;

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
          Admin Navigator
        </h2>

        <nav className="space-y-1">
          {/* Dashboard */}
          <NavLink to="/" end className={linkClass}>
            <LayoutDashboard className="w-5 h-5 mr-2" /> Dashboard
          </NavLink>

          {/* Upload Projects */}
          <NavLink to="/projects" className={linkClass}>
            <UploadCloud className="w-5 h-5 mr-2" /> Upload Projects
          </NavLink>

          {/* Home Page (public) */}
          <NavLink to="/home" className={linkClass}>
            <Home className="w-5 h-5 mr-2" /> Home Page
          </NavLink>
        </nav>

        {/* Bottom Bar for contact/copyright */}
        <div className="mt-auto border-t-4 border-pink-200 pt-4 text-sm text-center text-gray-500">
          © 2025 Devfolio • <a href="mailto:contact@devfolio.com" className="underline">Contact</a>
        </div>
      </aside>
    </>
  );
}
