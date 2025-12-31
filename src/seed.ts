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
      logSeed("Database already seeded, skipping...", "warn");
      return;
    }

    logSeed("Starting database seed...");

    const projectList = [
      {
        title: "Calculator Application",
        description: "A comprehensive calculator with scientific functions including trigonometry, logarithms, and complex mathematical operations.",
        techStack: ["React", "TypeScript", "CSS3"],
        imageUrl: "https://images.unsplash.com/photo-1612831455549-c71bbf045f9f?q=80&w=800&auto=format&fit=crop",
        category: "Utility",
        githubUrl: "https://github.com/yourusername/calculator",
        liveUrl: null,
        problemStatement: "Users needed a convenient way to perform both basic and scientific calculations without switching between multiple tools.",
        motivation: "Built to demonstrate complex state management in React and provide a practical tool for students and professionals.",
        systemDesign: "Component-based React architecture with utility math functions, responsive design, and keyboard support for accessibility.",
        challenges: "Implementing correct parenthesis evaluation and handling floating-point precision issues.",
        learnings: "Improved React state management, event handling, and learned about computer arithmetic precision.",
      },
      {
        title: "Student Record & Marksheet System",
        description: "C++ based student record management system with file persistence and CRUD operations.",
        techStack: ["C++", "File Handling", "STL"],
        imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&auto=format&fit=crop",
        category: "Academic",
        githubUrl: "https://github.com/yourusername/student-records",
        liveUrl: null,
        problemStatement: "Manual marksheet management was inefficient, error-prone, and time-consuming for educational institutions.",
        motivation: "Academic project to practice file persistence and data structure implementation in C++.",
        systemDesign: "Binary file storage with structured records, implementing search, sort, and filter operations using C++ STL.",
        challenges: "Maintaining data consistency during concurrent access and implementing efficient search algorithms.",
        learnings: "Strong understanding of file I/O in C++, data structures, and the importance of data validation.",
      },
      {
        title: "Python Utilities & Scripts",
        description: "Collection of automation scripts for productivity including file organizers, web scrapers, and data processors.",
        techStack: ["Python", "Pandas", "BeautifulSoup"],
        imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=800&auto=format&fit=crop",
        category: "Utility",
        githubUrl: "https://github.com/yourusername/python-utilities",
        liveUrl: null,
        problemStatement: "Manual repetitive tasks like file organization, data extraction, and format conversion wasted valuable time.",
        motivation: "Improve personal productivity through automation and learn Python's extensive standard library.",
        systemDesign: "Modular CLI-based scripts with proper error handling, logging, and configuration files for customization.",
        challenges: "Handling edge cases in various file formats and ensuring cross-platform compatibility.",
        learnings: "Advanced Python standard library usage, error handling, and the importance of writing reusable code.",
      },
      {
        title: "Portfolio Website",
        description: "Modern portfolio website built with React, TypeScript, and Express backend with SQLite database.",
        techStack: ["React", "TypeScript", "Express", "SQLite", "TailwindCSS"],
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
        category: "Web",
        githubUrl: "https://github.com/yourusername/portfolio",
        liveUrl: "https://abdheshsah.com.np",
        problemStatement: "Needed a professional online presence to showcase projects and skills to potential employers and collaborators.",
        motivation: "Create a modern, responsive portfolio that demonstrates full-stack development capabilities.",
        systemDesign: "Full-stack application with React frontend, Express REST API, SQLite database, and Drizzle ORM for type-safe queries.",
        challenges: "Implementing smooth animations, optimizing performance, and ensuring responsive design across all devices.",
        learnings: "Full-stack development workflow, API design, database modeling, and modern web development best practices.",
      },
    ];

    let successCount = 0;
    let failCount = 0;

    for (const proj of projectList) {
      try {
        await storage2.createProject(proj);
        logSeed(`Seeded project: ${proj.title}`);
        successCount++;
      } catch (err) {
        logSeed(`Failed to seed project: ${proj.title} - ${err}`, "error");
        failCount++;
      }
    }

    logSeed(`Projects: ${successCount} succeeded, ${failCount} failed`);

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
      { name: "SQLite", category: "Database", icon: "HardDrive" },
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