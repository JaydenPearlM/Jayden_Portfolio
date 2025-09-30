// src/components/ProjectCard.jsx
import React from "react";

export default function ProjectCard({ project }) {
  const {
    _id,
    title,
    description,
    thumbnail,
    demoLink,
    githubLink,
    tags = [],
    colabLink,     // NEW
    notebookLink,  // NEW
    modelLink,     // NEW
  } = project;

  const imgSrc = thumbnail
    ? (thumbnail.startsWith("/") ? thumbnail : `/${thumbnail}`)
    : null;

  const API_BASE = "http://localhost:5000";

  const handleViewDemo = (e) => {
    e.stopPropagation();
    if (!demoLink) return;

    const isHttp = /^https?:\/\//i.test(demoLink);
    const path = isHttp
      ? demoLink
      : `${API_BASE}${demoLink.startsWith("/") ? demoLink : `/${demoLink}`}`;

    window.open(
      path,
      `demo-${_id}`,
      "width=500,height=500,resizable,scrollbars"
    );
  };

  // Generic opener for Colab/Notebook/Model links
  const openLink = (e, url) => {
    e.stopPropagation();
    if (!url) return;
    const isHttp = /^https?:\/\//i.test(url);
    const path = isHttp
      ? url
      : `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;
    window.open(path, "_blank", "noopener,noreferrer");
  };

  // Normalize tags to an array of trimmed strings
  const tagList = Array.isArray(tags)
    ? tags
    : String(tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

  return (
    <div
      className="
      bg-orange-100 border-2 border-blue-200 rounded-xl shadow-md p-4 flex flex-col
        transform transition-transform duration-200 ease-out
        hover:scale-105 hover:shadow-lg hover:z-20
      "
      style={{ width: 270, height: 370, fontFamily: '"Montserrat", "sans-serif"' }}
      title={title}
    >
      {/* Thumbnail */}
      <div className="w-full h-44 overflow-hidden rounded border-2 border-blue-200 mb-4">
        {imgSrc ? (
          <img src={imgSrc} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Content zone */}
      <div className="flex flex-col flex-1">
        {/* Row 1: Title | GitHub | View */}
        <div className="grid grid-cols-3 items-center gap-2">
          {/* Title (left) */}
          <h3
            className="text-base font-semibold text-blue-700 leading-tight truncate"
            title={title || "Untitled"}
          >
            {title || "Untitled"}
          </h3>

          {/* GitHub (center) */}
          {githubLink ? (
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="justify-self-center text-xs underline"
              style={{ color: "#1E3A8A" }}
              onClick={(e) => e.stopPropagation()}
              aria-label="GitHub Link"
              title="Open GitHub"
            >
              GitHub
            </a>
          ) : (
            <span className="justify-self-center text-xs text-gray-400 select-none">
              GitHub
            </span>
          )}

          {/* View (right) — same color as Title + subtle orange border */}
          <button
            onClick={handleViewDemo}
            disabled={!demoLink}
            className="
              justify-self-end px-3 py-1 rounded-full text-xs font-semibold
              border disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
            style={{
              color: "#1E3A8A",       // same deep blue as Title
              borderColor: "#F97316", // orange-500
              borderWidth: "2px",
              backgroundColor: "transparent",
            }}
            aria-label="View"
            title={demoLink ? "Open demo" : "No demo available"}
          >
            View
          </button>
        </div>

        {/* Row 2: Description (full width) */}
        <p className="mt-2 text-gray-700 text-sm leading-snug line-clamp-3">
          {description || "No description."}
        </p>

        {/* ML actions (render only what exists) */}
        {(colabLink || notebookLink || modelLink) && (
          <div className="mt-2 flex items-center justify-end gap-2">
            {colabLink && (
              <button
                onClick={(e) => openLink(e, colabLink)}
                className="px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
                style={{
                  color: "#1E3A8A",       // same blue as Title
                  borderColor: "#F97316", // subtle orange border to match View
                  borderWidth: "2px",
                  backgroundColor: "transparent",
                }}
                title="Open in Google Colab"
              >
                Colab
              </button>
            )}

            {notebookLink && (
              <button
                onClick={(e) => openLink(e, notebookLink)}
                className="text-xs underline"
                style={{ color: "#1E3A8A" }}
                title="View Notebook"
              >
                Notebook
              </button>
            )}

            {modelLink && (
              <a
                href={modelLink}
                onClick={(e) => e.stopPropagation()}
                className="text-xs underline"
                style={{ color: "#1E3A8A" }}
                title="Download Model"
                target="_blank"
                rel="noopener noreferrer"
              >
                Model
              </a>
            )}
          </div>
        )}

        {/* Bottom-right: Tags */}
        {tagList.length > 0 && (
          <div className="mt-auto pt-2 flex justify-end">
            <div className="flex flex-wrap gap-2">
              {tagList.map((tag, idx) => (
                <span
                  key={`${tag}-${idx}`}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
