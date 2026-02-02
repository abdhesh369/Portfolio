// ============================================================
// FILE: src/seed.ts
// ============================================================
import { storage as storage2 } from "./storage.js";

function logSeed(message: string, level: "info" | "error" | "warn" = "info") {
  const timestamp = new Date().toISOString();
  const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✓";
  console.log(`${prefix} [${timestamp}] [SEED] ${message}`);
}

export async function seedDatabase() {
  try {
    let existingProjects: any[] = [];
    try {
      existingProjects = await storage2.getProjects();
    } catch (err) {
      logSeed("Tables don't exist yet or database empty, proceeding with seeding...");
    }

    if (existingProjects.length > 0) {
      logSeed("Database has existing projects, updating/merging data...");
    }

    logSeed("Starting database seed...");

    const projectList = [
      {
        title: "Portfolio Website",
        description: "Modern portfolio website built with React, TypeScript, and Express backend featuring a sci-fi themed UI with animated skill trees and glassmorphism effects.",
        techStack: ["React", "TypeScript", "Express", "MySQL", "TailwindCSS", "Framer Motion", "Drizzle ORM", "Three.js"],
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
        category: "Web",
        githubUrl: "https://github.com/abdhesh369/Frontend.git",
        liveUrl: "https://abdheshsah.com.np",
        problemStatement: "Needed a professional online presence to showcase projects and skills to potential employers and collaborators with a unique, memorable design.",
        motivation: "Create a modern, responsive portfolio that demonstrates full-stack development capabilities with cutting-edge UI/UX design principles.",
        systemDesign: "Full-stack application with React frontend using Framer Motion and Three.js for animations, Express REST API backend, MySQL database with Drizzle ORM for type-safe queries, and custom sci-fi themed component library.",
        challenges: "Implementing complex animations like the 3D plexus and skill tree without performance issues, creating a cohesive sci-fi design language, and ensuring responsive design across all devices.",
        learnings: "Advanced animation techniques, full-stack development workflow, API design patterns, and the importance of consistent design systems.",
      },
      {
        title: "AI Study Buddy",
        description: "A Monolithic Flask application integrated with OpenRouter API (GPT-4o-mini) to provide AI-powered study assistance. Features a modern glassmorphic UI.",
        techStack: ["Python", "Flask", "OpenRouter API", "Jinja2", "JavaScript", "Glassmorphism", "CSS3"],
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
        category: "Web",
        githubUrl: "https://github.com/abdhesh369/Projects",
        liveUrl: null,
        problemStatement: "Students often lack immediate access to tutoring or help when studying complex subjects, leading to frustration and slower learning.",
        motivation: "To leverage modern LLMs to provide a personal AI tutor that can answer questions and generate study materials in a visually appealing interface.",
        systemDesign: "Flask backend handling API requests to OpenRouter, using Jinja2 templates for dynamic content delivery. Frontend uses vanilla JavaScript for asynchronous communication and CSS for glassmorphism effects.",
        challenges: "Ensuring smooth API integration with error handling for rate limits or connectivity issues, and perfecting the glassmorphic UI without sacrificing readability.",
        learnings: "AI API integration, Flask web development, and advanced CSS styling techniques.",
      },
      {
        title: "Assistant (Edith)",
        description: "A modular Python-based desktop automation assistant with voice recognition and text-to-speech capabilities, designed to streamline daily tasks.",
        techStack: ["Python", "pyttsx3", "SpeechRecognition", "pyautogui", "pywhatkit", "psutil"],
        imageUrl: "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=800&auto=format&fit=crop",
        category: "System",
        githubUrl: "https://github.com/abdhesh369/Projects",
        liveUrl: null,
        problemStatement: "Interacting with computer systems manually for repetitive tasks like opening apps, searching YouTube, or taking notes can be inefficient.",
        motivation: "Created to experiment with desktop automation and voice-UI (VUI) to build a hands-free interactive layer for Windows.",
        systemDesign: "Modular architecture with dedicated command mapping for dispatcher efficiency. Uses pyttsx3 for offline TTS and Google Speech Recognition for STT. pyautogui handles hardware control.",
        challenges: "Improving the robustness of voice command detection and ensuring file-path automation (like video playback) works across different system environments.",
        learnings: "Automation scripting, speech processing, and modular software design in Python.",
      },
      {
        title: "Finance Tracker",
        description: "A secure personal finance management web application featuring user authentication and database persistence for transaction tracking.",
        techStack: ["Flask", "Flask-Login", "SQLAlchemy", "SQLite", "Flask-Migrate", "Flask-WTF", "Python"],
        imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop",
        category: "Web",
        githubUrl: "https://github.com/abdhesh369/Projects",
        liveUrl: null,
        problemStatement: "Managing personal expenses and budgets manually is tedious and often results in lost data or lack of financial insight.",
        motivation: "Demonstate secure development practices including password hashing, session management, and database migrations in a Flask environment.",
        systemDesign: "Application Factory pattern with Blueprints for authentication and main routes. Uses SQLAlchemy ORM for database abstraction and Flask-Login for session security.",
        challenges: "Implementing a clean authentication flow and setting up scalable database migrations for future feature expansions.",
        learnings: "Web security fundamentals, database design, and the Flask application factory pattern.",
      },
      {
        title: "Calculator Application",
        description: "A polished scientific calculator featuring a detailed dark-theme UI with ripple effects and comprehensive keyboard support.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Vanilla JS", "Regex"],
        imageUrl: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?q=80&w=800&auto=format&fit=crop",
        category: "Utility",
        githubUrl: "https://github.com/abdhesh369/Projects",
        liveUrl: null,
        problemStatement: "Most basic web calculators lack a premium feel and do not support keyboard navigation, making them less efficient for power users.",
        motivation: "To create a highly interactive and visually stunning utility tool that prioritizes user experience through micro-animations and responsive logic.",
        systemDesign: "Event-driven architecture using vanilla JS. Implements custom ripple animations via dynamic DOM manipulation and uses regex for real-time number formatting.",
        challenges: "Perfecting the CSS Grid layout for all screen sizes and implementing error-free keyboard event listeners for all math operations.",
        learnings: "Advanced DOM manipulation, event handling, and polished UI design using modern CSS.",
      },
      {
        title: "Flappy Bird",
        description: "A Python-based desktop game prototype using Pygame, demonstrating game loop fundamentals and collision detection concepts.",
        techStack: ["Python", "Pygame"],
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
        category: "Academic",
        githubUrl: "https://github.com/abdhesh369/Projects",
        liveUrl: null,
        problemStatement: "Understanding the complexities of game physics and state management can be difficult for beginners.",
        motivation: "Built as a skeleton project to explore the Pygame engine and set the foundation for more complex game development projects.",
        systemDesign: "Implements a standard game loop (Process Inputs -> Update State -> Render). Features a 1000x1000 game window with basic event polling.",
        challenges: "Setting up a stable frame-rate and preparing the architectural hooks for bird physics and pipe generation.",
        learnings: "Game development basics, 2D rendering, and event-driven programming.",
      },
    ];

    let successCount = 0;
    let failCount = 0;

    for (const proj of projectList) {
      try {
        const existing = existingProjects.find(p => p.title === proj.title);
        if (existing) {
          await storage2.updateProject(existing.id, proj);
          logSeed(`Updated project: ${proj.title}`);
        } else {
          await storage2.createProject(proj);
          logSeed(`Seeded project: ${proj.title}`);
        }
        successCount++;
      } catch (err) {
        logSeed(`Failed to process project: ${proj.title} - ${err}`, "error");
        failCount++;
      }
    }

    logSeed(`Projects: ${successCount} processed (${successCount - (projectList.length - failCount)} updated, ${projectList.length - failCount} created/synced), ${failCount} failed`);

    const skillList = [
      { name: "C", category: "Languages", icon: "Code" },
      { name: "C++", category: "Languages", icon: "Code2" },
      { name: "Python", category: "Languages", icon: "Snake" },
      { name: "JavaScript", category: "Languages", icon: "FileJson" },
      { name: "TypeScript", category: "Languages", icon: "FileCode" },
      { name: "HTML5", category: "Web", icon: "Layout" },
      { name: "CSS3", category: "Web", icon: "Palette" },
      { name: "React", category: "Web", icon: "Component" },
      { name: "Node.js", category: "Web", icon: "Server" },
      { name: "Express", category: "Web", icon: "Route" },
      { name: "TailwindCSS", category: "Web", icon: "Paintbrush" },
      { name: "SQL", category: "Database", icon: "Database" },
      { name: "MySQL", category: "Database", icon: "Database" },
      { name: "Git", category: "Tools", icon: "GitBranch" },
      { name: "GitHub", category: "Tools", icon: "Github" },
      { name: "Data Structures", category: "Core", icon: "Binary" },
      { name: "Algorithms", category: "Core", icon: "Cpu" },
      { name: "OOP", category: "Core", icon: "Box" },
      { name: "8085 Microprocessor", category: "Hardware", icon: "Chip" },
      { name: "Digital Electronics", category: "Hardware", icon: "CircuitBoard" },
    ];

    successCount = 0;
    failCount = 0;

    for (const skill of skillList) {
      try {
        await storage2.createSkill(skill);
        logSeed(`Seeded skill: ${skill.name}`);
        successCount++;
      } catch (err) {
        logSeed(`Failed to seed skill: ${skill.name} - ${err}`, "error");
        failCount++;
      }
    }

    logSeed(`Skills: ${successCount} succeeded, ${failCount} failed`);

    const experienceList = [
      {
        role: "Bachelor of Engineering Student",
        organization: "Tribhuvan University",
        period: "2024 – 2028",
        description: "Pursuing B.E. in Electronics & Communication Engineering. Relevant coursework: Data Structures, Computer Programming, Digital Electronics, Microprocessors, and Engineering Mathematics.",
        type: "Education",
      },
      {
        role: "Self-Taught Developer",
        organization: "Personal Projects",
        period: "2023 – Present",
        description: "Building web applications and automation tools. Learning modern web technologies including React, TypeScript, and Node.js through hands-on projects.",
        type: "Experience",
      },
    ];

    successCount = 0;
    failCount = 0;

    for (const exp of experienceList) {
      try {
        await storage2.createExperience(exp);
        logSeed(`Seeded experience: ${exp.role}`);
        successCount++;
      } catch (err) {
        logSeed(`Failed to seed experience: ${exp.role} - ${err}`, "error");
        failCount++;
      }
    }

    logSeed(`Experiences: ${successCount} succeeded, ${failCount} failed`);

    try {
      await storage2.createMessage({
        name: "Portfolio System",
        email: "system@portfolio.local",
        subject: "Database Initialized",
        message: "This is a sample message created during database seeding. Your contact form is working correctly!",
      });
      logSeed("Seeded sample message");
    } catch (err) {
      logSeed(`Failed to seed sample message: ${err}`, "error");
    }

    logSeed("Database seeding completed successfully! 🎉");
  } catch (err) {
    logSeed(`Database seeding failed: ${err}`, "error");
    throw err;
  }
}