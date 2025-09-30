// src/components/AboutJayden.jsx
import React from "react";

export default function AboutJayden() {
  return (
    <section
      id="about"
      className="w-full bg-gradient-to-r from-blue-100  to-blue-200
                 rounded-2xl shadow-lg p-8 border border-blue-200"
    >
      <h2 className="text-3xl font-oswald font-bold mb-6 text-blue-700 text-left">
        About Jayden
      </h2>

      <div className="text-gray-800 leading-relaxed font-montserrat text-lg space-y-3">
        <p>Hello!</p>
        <p>
          I am a Full Stack Software Engineer who builds clean, user-focused
          applications. I create smooth front-end experiences with React and Tailwind
          CSS, and develop reliable back-end systems with Node.js/Express, Django,
          MongoDB, and PostgreSQL. With a design background and collaborative
          mindset, I bring creativity, adaptability, and impact to every project.
        </p>
      </div>
    </section>
  );
}
