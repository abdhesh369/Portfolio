// ============================================================
// FILE: src/seed.ts
// ============================================================
import "dotenv/config";
import { storage as storage2 } from "./storage.js";
import type { Project, InsertProject, InsertSeoSettings } from "../shared/schema.js";

function logSeed(message: string, level: "info" | "error" | "warn" = "info") {
  const timestamp = new Date().toISOString();
  const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✓";
  console.log(`${prefix} [${timestamp}][SEED] ${message} `);
}

export async function seedDatabase() {
  try {
    let existingProjects: Project[] = [];
    try {
      existingProjects = await storage2.getProjects();
    } catch (err) {
      logSeed("Tables don't exist yet or database empty, proceeding with seeding...");
    }

    if (existingProjects.length > 0) {
      logSeed("Database has existing projects, updating/merging data...");
    }

    logSeed("Starting database seed...");

    const projectList: InsertProject[] = [
      {
        title: "Portfolio Website",
        description: "Modern portfolio website built with React, TypeScript, and Express backend featuring a sci-fi themed UI with animated skill trees and glassmorphism effects.",
        techStack: ["React", "TypeScript", "Express", "PostgreSQL", "TailwindCSS", "Framer Motion", "Drizzle ORM", "Three.js"],
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
        category: "Web",
        status: "Completed",
        githubUrl: "https://github.com/abdhesh369/Frontend.git",
        liveUrl: "https://abdheshsah.com.np",
        problemStatement: "Needed a professional online presence to showcase projects and skills to potential employers and collaborators with a unique, memorable design.",
        motivation: "Create a modern, responsive portfolio that demonstrates full-stack development capabilities with cutting-edge UI/UX design principles.",
        systemDesign: "Full-stack application with React frontend using Framer Motion and Three.js for animations, Express REST API backend, PostgreSQL database with Drizzle ORM for type-safe queries, and custom sci-fi themed component library.",
        challenges: "Implementing complex animations like the 3D plexus and skill tree without performance issues, creating a cohesive sci-fi design language, and ensuring responsive design across all devices.",
        learnings: "Advanced animation techniques, full-stack development workflow, API design patterns, and the importance of consistent design systems.",
      },
      {
        title: "AI Study Buddy",
        description: "A Monolithic Flask application integrated with OpenRouter API (GPT-4o-mini) to provide AI-powered study assistance. Features a modern glassmorphic UI.",
        techStack: ["Python", "Flask", "OpenRouter API", "Jinja2", "JavaScript", "Glassmorphism", "CSS3"],
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
        category: "Web",
        status: "Completed",
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
        status: "Completed",
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
        status: "Completed",
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
        status: "Completed",
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
        status: "Completed",
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
          logSeed(`Updated project: ${proj.title} `);
        } else {
          await storage2.createProject(proj);
          logSeed(`Seeded project: ${proj.title} `);
        }
        successCount++;
      } catch (err) {
        logSeed(`Failed to process project: ${proj.title} - ${err} `, "error");
        failCount++;
      }
    }

    logSeed(`Projects: ${successCount} processed(${successCount - (projectList.length - failCount)} updated, ${projectList.length - failCount} created / synced), ${failCount} failed`);

    const skillList = [
      // Foundations
      { name: "C", category: "Foundations", icon: "Terminal", status: "Core", x: 20, y: 20, description: "System programming language", proof: "Academic coursework" },
      { name: "C++", category: "Foundations", icon: "Code2", status: "Core", x: 50, y: 18, description: "Object-oriented programming", proof: "Academic coursework" },
      { name: "Python", category: "Foundations", icon: "Terminal", status: "Core", x: 80, y: 20, description: "General-purpose language", proof: "Project Edith, AI Study Buddy" },
      // Frontend
      { name: "HTML", category: "Frontend", icon: "Globe", status: "Core", x: 30, y: 45, description: "Web structure", proof: "All web projects" },
      { name: "CSS", category: "Frontend", icon: "Layers", status: "Core", x: 50, y: 45, description: "Web styling", proof: "All web projects" },
      { name: "JavaScript", category: "Frontend", icon: "Zap", status: "Core", x: 70, y: 45, description: "Web scripting", proof: "All web projects" },
      { name: "React", category: "Frontend", icon: "Code2", status: "Core", x: 70, y: 60, description: "Frontend library", proof: "Portfolio Website" },
      // Backend
      { name: "Node.js", category: "Backend", icon: "Server", status: "Comfortable", x: 40, y: 70, description: "Server-side runtime", proof: "Portfolio Backend" },
      { name: "Express", category: "Backend", icon: "Terminal", status: "Comfortable", x: 60, y: 70, description: "Web framework", proof: "Portfolio Backend" },
      { name: "PostgreSQL", category: "Backend", icon: "Database", status: "Comfortable", x: 50, y: 85, description: "Relational database", proof: "Portfolio Backend" },
      // Tools
      { name: "Git", category: "Tools", icon: "GitBranch", status: "Core", x: 15, y: 60, description: "Version control", proof: "All projects" },
      { name: "GitHub", category: "Tools", icon: "GitBranch", status: "Core", x: 30, y: 70, description: "Code hosting", proof: "All projects" },
    ];

    const existingSkills = await storage2.getSkills();
    for (const skill of skillList) {
      try {
        const existing = existingSkills.find(s => s.name === skill.name);
        if (existing) {
          await storage2.updateSkill(existing.id, skill);
          logSeed(`Updated skill: ${skill.name} `);
        } else {
          await storage2.createSkill(skill);
          logSeed(`Seeded skill: ${skill.name} `);
        }
        successCount++;
      } catch (err) {
        logSeed(`Failed to process skill: ${skill.name} - ${err} `, "error");
        failCount++;
      }
    }

    logSeed(`Skills: ${successCount} succeeded, ${failCount} failed`);

    // Add Skill Connections
    const connections = [
      { fromSkillId: "C", toSkillId: "C++" },
      { fromSkillId: "HTML", toSkillId: "CSS" },
      { fromSkillId: "CSS", toSkillId: "JavaScript" },
      { fromSkillId: "JavaScript", toSkillId: "React" },
      { fromSkillId: "Git", toSkillId: "GitHub" },
      { fromSkillId: "Node.js", toSkillId: "Express" },
      { fromSkillId: "Express", toSkillId: "PostgreSQL" },
    ];

    const existingConnections = await storage2.getSkillConnections();
    for (const conn of connections) {
      try {
        const exists = existingConnections.some(
          c => c.fromSkillId === conn.fromSkillId && c.toSkillId === conn.toSkillId
        );
        if (exists) {
          logSeed(`Connection already exists: ${conn.fromSkillId} -> ${conn.toSkillId}, skipping... `);
          continue;
        }
        await storage2.createSkillConnection(conn);
        logSeed(`Seeded connection: ${conn.fromSkillId} -> ${conn.toSkillId} `);
      } catch (err) {
        logSeed(`Failed to seed connection: ${err} `, "error");
      }
    }

    const mindsetList = [
      {
        title: "Occam's Razor",
        description: "The simplest explanation is usually the best. Applied to code: avoid over-engineering and keep solutions as simple as possible.",
        icon: "Brain",
        tags: ["Architecture", "Simplicity"]
      },
      {
        title: "The DRY Principle",
        description: "Don't Repeat Yourself. Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.",
        icon: "Zap",
        tags: ["Refactoring", "Efficiency"]
      },
      {
        title: "Growth Mindset",
        description: "Viewing challenges as opportunities to learn rather than obstacles. Documentation and failures are just data points for improvement.",
        icon: "Cpu",
        tags: ["Learning", "Resilience"]
      }
    ];

    const currentMindsets = await storage2.getMindset();
    for (const mindset of mindsetList) {
      try {
        const existing = currentMindsets.find(i => i.title === mindset.title);
        if (existing) {
          logSeed(`Mindset already exists, skipping: ${mindset.title} `);
          continue;
        }
        await storage2.createMindset(mindset);
        logSeed(`Seeded mindset: ${mindset.title} `);
      } catch (err) {
        logSeed(`Failed to seed mindset: ${err} `, "error");
      }
    }

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

    const currentExperiences = await storage2.getExperiences();
    successCount = 0;
    failCount = 0;

    for (const exp of experienceList) {
      try {
        const existing = currentExperiences.find(e => e.role === exp.role && e.organization === exp.organization);
        if (existing) {
          logSeed(`Experience already exists, skipping: ${exp.role} `);
          continue;
        }
        await storage2.createExperience(exp);
        logSeed(`Seeded experience: ${exp.role} `);
        successCount++;
      } catch (err) {
        logSeed(`Failed to seed experience: ${exp.role} - ${err} `, "error");
        failCount++;
      }
    }

    logSeed(`Experiences: ${successCount} seeded`);

    const existingMessages = await storage2.getMessages();
    if (existingMessages.length === 0) {
      try {
        await storage2.createMessage({
          name: "Portfolio System",
          email: "system@portfolio.local",
          subject: "Database Initialized",
          message: "This is a sample message created during database seeding. Your contact form is working correctly!",
        });
        logSeed("Seeded sample message");
      } catch (err) {
        logSeed(`Failed to seed sample message: ${err} `, "error");
      }
    } else {
      logSeed("Messages already exist, skipping sample message seeding.");
    }

    const emailTemplates = [
      {
        name: "General Inquiry Reply",
        subject: "Re: Inquiry regarding my portfolio",
        body: "Hello {name},\n\nThank you for reaching out! I've received your message and will get back to you shortly.\n\nBest regards,\nAbdhesh",
      },
      {
        name: "Project Collaboration",
        subject: "Re: Collaboration opportunity",
        body: "Hi {name},\n\nThanks for your interest in collaborating. I've reviewed your message and I'm very interested in hearing more about the project.\n\nLet's schedule a call to discuss further.\n\nBest,\nAbdhesh",
      },
    ];

    const currentTemplates = await storage2.getEmailTemplates();
    for (const template of emailTemplates) {
      try {
        const existing = currentTemplates.find(t => t.name === template.name);
        if (existing) {
          logSeed(`Email template already exists, skipping: ${template.name}`);
          continue;
        }
        await storage2.createEmailTemplate(template);
        logSeed(`Seeded email template: ${template.name}`);
      } catch (err) {
        logSeed(`Failed to seed email template: ${template.name} - ${err}`, "error");
      }
    }

    const seoSettings: InsertSeoSettings[] = [
      {
        pageSlug: "home",
        metaTitle: "Abdhesh Sah | Full Stack Developer",
        metaDescription: "Portfolio of Abdhesh Sah, a Full Stack Developer specializing in React, Node.js, and modern web technologies.",
        keywords: "Abdhesh Sah, Full Stack Developer, React, Node.js, Portfolio, Web Development",
        noindex: false,
        twitterCard: "summary_large_image",
      },
      {
        pageSlug: "projects",
        metaTitle: "Projects | Abdhesh Sah",
        metaDescription: "Explore the projects built by Abdhesh Sah, showcasing skills in full-stack development, AI, and automation.",
        keywords: "Projects, Web Development, Case Studies, Portfolio Work",
        noindex: false,
        twitterCard: "summary_large_image",
      },
      {
        pageSlug: "about",
        metaTitle: "About Me | Abdhesh Sah",
        metaDescription: "Learn more about Abdhesh Sah, his background, education, and journey as a self-taught developer.",
        keywords: "About Abdhesh, Biography, Developer Journey, Skills",
        noindex: false,
        twitterCard: "summary_large_image",
      },
      {
        pageSlug: "contact",
        metaTitle: "Contact | Abdhesh Sah",
        metaDescription: "Get in touch with Abdhesh Sah for collaborations, freelance work, or just to say hi.",
        keywords: "Contact, Hire Developer, Freelance, Collaboration",
        noindex: false,
        twitterCard: "summary_large_image",
      },
    ];

    for (const settings of seoSettings) {
      try {
        const existing = await storage2.getSeoSettingsBySlug(settings.pageSlug);
        if (existing) {
          logSeed(`SEO settings already exist for: ${settings.pageSlug}, skipping...`);
          continue;
        }
        await storage2.createSeoSettings(settings);
        logSeed(`Seeded SEO settings for: ${settings.pageSlug}`);
      } catch (err) {
        logSeed(`Failed to seed SEO settings for: ${settings.pageSlug} - ${err}`, "error");
      }
    }

    logSeed("Database seeding completed successfully! 🎉");
  } catch (err) {
    logSeed(`Database seeding failed: ${err} `, "error");
    throw err;
  }
}

// Run only when executed directly (not when imported)
const isMainModule = process.argv[1]?.replace(/\\/g, '/').includes('seed');
if (isMainModule) {
  seedDatabase()
    .then(() => {
      console.log("Seeding complete. Exiting...");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
