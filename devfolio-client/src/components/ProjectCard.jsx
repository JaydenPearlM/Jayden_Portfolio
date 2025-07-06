// src/components/ProjectCard.jsx
import React from 'react';

export default function ProjectCard({ project }) {
  const {
    _id,
    title,
    description,
    thumbnail,
    demoLink,
    githubLink,
    tags = []
  } = project;

  // Serve thumbnail via React proxy at /uploads
  const imgSrc = thumbnail
    ? (thumbnail.startsWith('/') ? thumbnail : `/${thumbnail}`)
    : null;

  // Popup demo from Express (port 5000)
  const API_BASE = 'http://localhost:5000';
  const handleViewDemo = e => {
    e.stopPropagation();
    if (!demoLink) return;
    const path = demoLink.startsWith('/') ? demoLink : `/${demoLink}`;
    const url = `${API_BASE}${path}`;
    window.open(
      url,
      `demo-${_id}`,
      'width=500,height=500,resizable,scrollbars'
    );
  };

  return (
    <div
      className="
        bg-blue-50 rounded-xl shadow-md p-4 flex flex-col
        transform transition-transform duration-200 ease-out
        hover:scale-105 hover:shadow-lg hover:z-20
      "
      style={{ width: 350, height: 350, fontFamily: '"Montserrat", sans-serif' }}
    >
      {/* Thumbnail */}
      <div className="w-full h-44 overflow-hidden rounded border-2 border-blue-200 mb-4">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-blue-700 mb-2">
        {title}
      </h3>

      {/* Description */}
      <div className="text-gray-700 text-sm mb-4 overflow-y-auto max-h-[500px]">
        {description || 'No description.'}
      </div>

      {/* Footer */}
      <div className="mt-auto grid grid-cols-3 items-center px-3 pb-2">
        <button
          onClick={handleViewDemo}
          className="justify-self-start px-3 py-1 rounded-full text-xs"
          style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}
        >
          View Demo
        </button>

        {githubLink ? (
          <a
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="justify-self-center text-xs underline"
            style={{ color: '#1E3A8A' }}
            onClick={e => e.stopPropagation()}
          >
            GitHub
          </a>
        ) : (
          <div />
        )}

        <div className="justify-self-end flex space-x-1">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
