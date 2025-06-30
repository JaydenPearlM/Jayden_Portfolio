// src/components/ProjectCard.jsx
import React from 'react'

export default function ProjectCard({ project }) {
  const {
    _id,
    title,
    description,
    thumbnail,
    fileUploads = [],
    githubLink,
    tags = []
  } = project

  // Determine image source
  const src = thumbnail
    ? thumbnail.startsWith('/')
      ? thumbnail
      : `/${thumbnail}`
    : null

  // Open HTML demo in a fixed-size popup
  const handleViewDemo = e => {
    e.stopPropagation()
    // Find HTML file among uploads or fall back to index.html
    const htmlObj = fileUploads.find(f => {
      const url = typeof f === 'string' ? f : f.url || f.path || ''
      return url.toLowerCase().endsWith('.html')
    })
    let url = htmlObj
      ? (typeof htmlObj === 'string' ? htmlObj : (htmlObj.url || htmlObj.path))
      : `/uploads/${_id}/index.html`
    if (!url.startsWith('/')) url = `/${url}`

    window.open(
      url,
      `demo-${_id}`,
      'width=500,height=500,resizable,scrollbars'
    )
  }

  return (
    <div
      className="
        bg-blue-50 rounded-xl shadow-md p-4 flex flex-col
        transform transition-transform duration-200 ease-out
        hover:scale-105 hover:shadow-lg hover:z-20
      "
      style={{ width: 350, height: 350, fontFamily: '"Montserrat", sans-serif' }}
    >
      {/* Thumbnail with pastel-blue border */}
      <div className="w-full h-44 overflow-hidden rounded border-2 border-blue-200 mb-4">
        {src ? (
          <img
            src={src}
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

      {/* Description with scrollbar up to 500px max height */}
      <div className="text-gray-700 text-sm mb-4 overflow-y-auto max-h-[500px]">
        {description || 'No description.'}
      </div>

      {/* Bottom row: View Demo | GitHub | Tags */}
      <div className="mt-auto grid grid-cols-3 items-center px-3 pb-2">
        {/* View Demo (left) */}
        <button
          onClick={handleViewDemo}
          className="justify-self-start px-3 py-1 rounded-full text-xs"
          style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}
        >
          View Demo
        </button>

        {/* GitHub Link (center) */}
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

        {/* Tags (right) */}
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
  )
}
