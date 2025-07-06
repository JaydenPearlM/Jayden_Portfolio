// src/components/AboutJayden.jsx
import React from 'react';

export default function AboutJayden() {
  return (
    <section id="about" className="w-full p-6 bg-blue-50 rounded-lg">
      <h2 className="text-3xl font-oswald font-bold mb-6 text-blue-700 text-center">
        About Jayden
      </h2>

      <div className="space-y-4 text-gray-800 leading-relaxed">
        <p>
          Welcome to my portfolio website! My name is Jayden Maxwell and I am a versatile Full Stack Software Developer fluent in JavaScript (ES6+), HTML5, CSS3, Python, and Java, with a dash of C++. Front-end UIs come to life with React and Tailwind CSS; on the back end, Django or Node.js/Express pairs with MongoDB or PostgreSQL to build robust, scalable systems. A very fast learner, I thrive on mastering new tools and best practices, for example from CI/CD pipelines to Agile workflows.
        </p>

        <p>
          Collaboration and attention to detail make me who I am today, whether mentoring teammates, refining UI interactions with my design background, or leveraging AI as a collaborator (not a creator) to streamline brainstorming and automate routine tasks. I’m actively deepening my machine learning and DevOps expertise to ensure end-to-end project excellence.
        </p>

        <p>
          Beyond code, I’m a passionate Pokémon trainer, Magic: The Gathering strategist, and avid gamer. During my free time I can be seen forming hackathon teams, pair-program weekend projects. I am on the lookout for remote Full Stack or Data Science roles where I can contribute my skills, learn from an innovative team, and build solutions that make a real impact.
        </p>
      </div>
    </section>
  );
}
