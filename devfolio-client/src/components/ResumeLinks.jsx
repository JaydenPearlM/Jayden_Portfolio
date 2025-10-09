// src/components/ResumeLinks.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import resumePdf from "../assets/resume.pdf";
import resumePreview from "../assets/resume-preview.jpg";

export default function ResumeLinks() {
  const [resumeOpen, setResumeOpen] = useState(false);

  return (
    <>
      {/* Top-aligned row */}
      <div className="w-full max-w-5xl mx-auto flex items-start gap-4">
        {/* Left: label + preview */}
        <div className="flex-1 self-start">
          <h3 className="text-medium md:text-base font-oswald font-bold text-blue-700 tracking-wide mb-2">
            Click Below For Resume!
          </h3>

          <div
            className="overflow-hidden cursor-pointer hover:shadow-xl transition rounded-2xl"
            onClick={() => setResumeOpen(true)}
            title="Click to open resume"
          >
            <img
              src={resumePreview}
              alt="Resume preview"
              className="block w-full h-auto max-h-[78vh] object-contain object-top bg-white"
              loading="lazy"
            />
          </div>
        </div>

        {/* Middle: light blue vertical bar */}
        <div className="w-1 bg-blue-200 rounded-full self-stretch" />

        {/* Right: Social + divider + Personal Projects */}
        <div className="w-64 flex flex-col gap-3 self-start">
          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/jaydenmaxwell"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
          >
            LinkedIn
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/JaydenPearlM"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center px-5 py-3 bg-gray-900 text-white font-semibold rounded-xl shadow hover:bg-gray-800 transition"
          >
            GitHub
          </a>

          {/* Horizontal blue bar */}
          <div className="h-1 w-full bg-blue-200 rounded-full mt-1" />

          {/* Label under the bar */}
          <p className="text-sm md:text-base font-oswald font-semibold text-blue-700 tracking-wide">
            Personal Projects
          </p>

          {/* LifeHub (internal route) */}
          <Link
            to="/lifehub"
            className="w-full text-center px-5 py-3 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 transition"
          >
            LifeHub™
          </Link>
          <p className="text-xs text-blue-700/70 -mt-2">
            My daily Full Stack Software Engineer roadmap tracker: Progress updated every Week!
          </p>

          {/* TCG retail project (internal route) */}
          <Link
            to="/TcgRetail"
            className="w-full text-center px-5 py-3 bg-orange-500 text-white font-semibold rounded-xl shadow hover:bg-orange-600 transition"
          >
            PackPal™
          </Link>
          <p className="text-xs text-blue-700/70 -mt-2">
            For Gameing Shops: inventory, Retail Prices, Store Prices.
          </p>
        </div>
      </div>

      {/* Full-screen popup with the actual PDF */}
      {resumeOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setResumeOpen(false)}
        >
          <div
            className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h3 className="text-lg font-semibold">Resume</h3>
              <button
                onClick={() => setResumeOpen(false)}
                className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
            <iframe
              src={`${resumePdf}#view=FitH&zoom=135`}
              className="w-full h-full"
              title="Full resume"
            />
          </div>
        </div>
      )}
    </>
  );
}
