// ============================================================
// FILE: src/seed.ts
// ============================================================
import "dotenv/config";
import { projectService } from "./services/project.service.js";
import { skillService } from "./services/skill.service.js";
import { skillConnectionService } from "./services/skill-connection.service.js";
import { mindsetService } from "./services/mindset.service.js";
import { experienceService } from "./services/experience.service.js";
import { messageService } from "./services/message.service.js";
import { emailTemplateService } from "./services/email-template.service.js";
import { seoSettingsService } from "./services/seo-settings.service.js";
import { settingsService } from "./services/settings.service.js";
import type { Project, InsertProject, InsertSeoSettings, InsertSiteSettings } from "@portfolio/shared";

import { logger } from "./lib/logger.js";

function logSeed(message: string, level: "info" | "error" | "warn" = "info") {
  if (level === "error") {
    logger.error({ context: "seed" }, message);
  } else if (level === "warn") {
    logger.warn({ context: "seed" }, message);
  } else {
    logger.info({ context: "seed" }, message);
  }
}

export async function seedDatabase() {
  try {
    let existingProjects: Project[] = [];
    try {
      existingProjects = await projectService.getAll();
    } catch (err) {
      logSeed("Tables don't exist yet or database empty, proceeding with seeding...");
    }

    if (existingProjects.length > 0) {
      logSeed("Database has existing projects, updating/merging data...");
    }

    logSeed("Starting database seed...");

    const seedData = (await import("./seed-data.json", { with: { type: "json" } })).default;

    const currentYear = new Date().getFullYear();
    const siteSettingsSeed: InsertSiteSettings = {
      ...seedData.siteSettings,
      footerCopyright: `© ${currentYear} Abdhesh Sah. All rights reserved.`,
    };

    try {
      await settingsService.updateSettings(siteSettingsSeed);
      logSeed("Seeded site settings");
    } catch (err) {
      logSeed(`Failed to seed site settings: ${err}`, "error");
    }

    const projectList: InsertProject[] = seedData.projects as any;

    let successCount = 0;
    let failCount = 0;

    for (const proj of projectList) {
      try {
        const existing = existingProjects.find(p => p.title === proj.title);
        if (existing) {
          await projectService.update(existing.id, proj);
          logSeed(`Updated project: ${proj.title} `);
        } else {
          await projectService.create(proj);
          logSeed(`Seeded project: ${proj.title} `);
        }
        successCount++;
      } catch (err) {
        logSeed(`Failed to process project: ${proj.title} - ${err} `, "error");
        failCount++;
      }
    }

    logSeed(`Projects: ${successCount} processed`);

    const skillList = seedData.skills;

    const existingSkills = await skillService.getAll();
    for (const skill of skillList) {
      try {
        const existing = existingSkills.find(s => s.name === skill.name);
        if (existing) {
          await skillService.update(existing.id, skill as Parameters<typeof skillService.update>[1]);
          logSeed(`Updated skill: ${skill.name} `);
        } else {
          await skillService.create(skill as Parameters<typeof skillService.create>[0]);
          logSeed(`Seeded skill: ${skill.name} `);
        }
        successCount++;
      } catch (err) {
        logSeed(`Failed to process skill: ${skill.name} - ${err} `, "error");
        failCount++;
      }
    }

    logSeed(`Skills: ${successCount} processed`);

    // Add Skill Connections
    const connectionData = [
      { fromName: "C", toName: "C++" },
      { fromName: "HTML", toName: "CSS" },
      { fromName: "CSS", toName: "JavaScript" },
      { fromName: "JavaScript", toName: "React" },
      { fromName: "Git", toName: "GitHub" },
      { fromName: "Node.js", toName: "Express" },
      { fromName: "Express", toName: "PostgreSQL" },
    ];

    const allSkillsAfterSeeding = await skillService.getAll();
    const skillNameToId = new Map(allSkillsAfterSeeding.map(s => [s.name, s.id]));

    const existingConnections = await skillConnectionService.getAll();
    for (const data of connectionData) {
      try {
        const fromSkillId = skillNameToId.get(data.fromName);
        const toSkillId = skillNameToId.get(data.toName);

        if (!fromSkillId || !toSkillId) {
          logSeed(`Could not find skills for connection: ${data.fromName} -> ${data.toName}, skipping...`, "warn");
          continue;
        }

        const exists = existingConnections.some(
          c => c.fromSkillId === fromSkillId && c.toSkillId === toSkillId
        );
        if (exists) {
          logSeed(`Connection already exists: ${data.fromName} -> ${data.toName}, skipping... `);
          continue;
        }
        await skillConnectionService.create(fromSkillId, toSkillId);
        logSeed(`Seeded connection: ${data.fromName} -> ${data.toName} `);
      } catch (err) {
        logSeed(`Failed to seed connection: ${err} `, "error");
      }
    }

    const mindsetList = seedData.mindsets;

    const currentMindsets = await mindsetService.getAll();
    for (const mindset of mindsetList) {
      try {
        const existing = currentMindsets.find(i => i.title === mindset.title);
        if (existing) {
          logSeed(`Mindset already exists, skipping: ${mindset.title} `);
          continue;
        }
        await mindsetService.create(mindset);
        logSeed(`Seeded mindset: ${mindset.title} `);
      } catch (err) {
        logSeed(`Failed to seed mindset: ${err} `, "error");
      }
    }

    const experienceList = seedData.experiences.map((exp: any) => ({
      ...exp,
      startDate: new Date(exp.startDate)
    }));

    const currentExperiences = await experienceService.getAll();
    successCount = 0;
    failCount = 0;

    for (const exp of experienceList) {
      try {
        const existing = currentExperiences.find(e => e.role === exp.role && e.organization === exp.organization);
        if (existing) {
          logSeed(`Experience already exists, skipping: ${exp.role} `);
          continue;
        }
        await experienceService.create(exp);
        logSeed(`Seeded experience: ${exp.role} `);
        successCount++;
      } catch (err) {
        logSeed(`Failed to seed experience: ${exp.role} - ${err} `, "error");
        failCount++;
      }
    }

    logSeed(`Experiences: ${successCount} seeded`);

    const existingMessages = await messageService.getAll();
    if (existingMessages.length === 0) {
      try {
        await messageService.create({
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

    const emailTemplates = seedData.emailTemplates;

    const currentTemplates = await emailTemplateService.getAll();
    for (const template of emailTemplates) {
      try {
        const existing = currentTemplates.find(t => t.name === template.name);
        if (existing) {
          logSeed(`Email template already exists, skipping: ${template.name}`);
          continue;
        }
        await emailTemplateService.create(template);
        logSeed(`Seeded email template: ${template.name}`);
      } catch (err) {
        logSeed(`Failed to seed email template: ${template.name} - ${err}`, "error");
      }
    }

    const seoSettings: InsertSeoSettings[] = seedData.seoSettings;

    for (const settings of seoSettings) {
      try {
        const existing = await seoSettingsService.getBySlug(settings.pageSlug);
        if (existing) {
          logSeed(`SEO settings already exist for: ${settings.pageSlug}, skipping...`);
          continue;
        }
        await seoSettingsService.create(settings);
        logSeed(`Seeded SEO settings for: ${settings.pageSlug}`);
      } catch (err) {
        logSeed(`Failed to seed SEO settings for: ${settings.pageSlug} - ${err}`, "error");
      }
    }

    try {
      await settingsService.getSettings(); // Just to trigger default creation if service handles it
    } catch (err) {
      logSeed(`Failed to trigger settings service: ${err}`, "error");
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
      logger.info({ context: "seed" }, "Seeding complete. Exiting...");
      process.exit(0);
    })
    .catch((err) => {
      logger.error({ context: "seed", error: err }, "Seeding failed");
      process.exit(1);
    });
}
