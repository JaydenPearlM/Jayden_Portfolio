// src/components/TopNavbar.jsx
import React from 'react';
import { UserCircle } from 'lucide-react';

export default function TopNavbar() {
  return (
    <header className="relative bg-white border-b shadow">

      {/* Thicker gradient bar */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-t-md"></div>

      {/* Navbar content */}
      <div className="px-6 py-4 flex justify-between items-center">
        <div></div>
        <div className="flex items-center space-x-3 relative group">
          <UserCircle className="w-8 h-8 text-gray-500 hover:text-indigo-600 cursor-pointer" />
          <span className="font-semibold text-gray-700 text-sm">Jayden 2025</span>
          <div className="absolute right-0 top-10 opacity-0 group-hover:opacity-100 transition bg-white text-sm shadow-md p-2 rounded z-10">
            Settings & Profile
          </div>
        </div>
      </div>
    </header>
  );
}
