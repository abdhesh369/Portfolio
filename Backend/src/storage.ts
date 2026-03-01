
// ============================================================
// FILE: src/storage.ts
// ============================================================
import { eq, asc, desc, inArray, count, sql } from "drizzle-orm";
import { db } from "./db.js";
import {
  projectsTable,
  skillsTable,
  experiencesTable,
  messagesTable,
  mindsetTable,
  skillConnectionsTable,
  analyticsTable,
  emailTemplatesTable,
  servicesTable,
  type Project,
  type Skill,
  type SkillConnection,
  type Experience,
  type Message,
  type Mindset,
  type Analytics,
  type EmailTemplate,
  type InsertMessage,
  type InsertProject,
  type InsertSkill,
  type InsertExperience,
  type InsertAnalytics,
  type InsertEmailTemplate,
  type SeoSettings,
  type InsertSeoSettings,
  seoSettingsTable,
  insertSeoSettingsApiSchema,
  articlesTable,
  articleTagsTable,
  type Article,
  type InsertArticle,
  type Service,
  type InsertService,
  selectServiceSchema,
  testimonialsTable,
  type Testimonial,
  type InsertTestimonial,
} from "../shared/schema.js";

// ================= STORAGE INTERFACE =================
export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | null>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  reorderProjects(orderedIds: number[]): Promise<void>;
  bulkDeleteProjects(ids: number[]): Promise<void>;
  bulkUpdateProjectStatus(ids: number[], status: string): Promise<void>;

  // Skills
  getSkills(): Promise<Skill[]>;
  getSkillById(id: number): Promise<Skill | null>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill>;
  deleteSkill(id: number): Promise<void>;
  bulkDeleteSkills(ids: number[]): Promise<void>;

  // Experiences
  getExperiences(): Promise<Experience[]>;
  getExperienceById(id: number): Promise<Experience | null>;
  createExperience(exp: InsertExperience): Promise<Experience>;
  updateExperience(id: number, exp: Partial<InsertExperience>): Promise<Experience>;
  deleteExperience(id: number): Promise<void>;

  // Services
  getServices(): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | null>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // Testimonials
  getTestimonials(): Promise<Testimonial[]>;
  getTestimonialById(id: number): Promise<Testimonial | null>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial>;
  deleteTestimonial(id: number): Promise<void>;

  // Messages
  getMessages(): Promise<Message[]>;
  getMessageById(id: number): Promise<Message | null>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: number): Promise<void>;
  bulkDeleteMessages(ids: number[]): Promise<void>;

  // Skill Connections
  getSkillConnections(): Promise<SkillConnection[]>;
  createSkillConnection(connection: Omit<SkillConnection, "id">): Promise<SkillConnection>;

  // Mindset
  getMindset(): Promise<Mindset[]>;
  getMindsetById(id: number): Promise<Mindset | null>;
  createMindset(mindset: Omit<Mindset, "id">): Promise<Mindset>;
  updateMindset(id: number, mindset: Partial<Omit<Mindset, "id">>): Promise<Mindset>;
  deleteMindset(id: number): Promise<void>;

  // Analytics
  logAnalyticsEvent(event: InsertAnalytics): Promise<Analytics>;
  getAnalyticsSummary(): Promise<any>;

  // Email Templates
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplateById(id: number): Promise<EmailTemplate | null>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate>;
  deleteEmailTemplate(id: number): Promise<void>;

  // SEO Settings
  getSeoSettings(): Promise<SeoSettings[]>;
  getSeoSettingsBySlug(slug: string): Promise<SeoSettings | null>;
  createSeoSettings(settings: InsertSeoSettings): Promise<SeoSettings>;
  updateSeoSettings(id: number, settings: Partial<InsertSeoSettings>): Promise<SeoSettings>;
  deleteSeoSettings(id: number): Promise<void>;

  // Articles
  getArticles(status?: string): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | null>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article>;
  deleteArticle(id: number): Promise<void>;
  bulkDeleteArticles(ids: number[]): Promise<void>;
}

function logStorage(message: string, level: "info" | "error" | "warn" = "info") {
  const timestamp = new Date().toISOString();
  const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✓";
  console.log(`${prefix} [${timestamp}] [STORAGE] ${message}`);
}

function safeJsonParse<T>(json: any, fallback: T): T {
  if (!json) return fallback;
  if (typeof json === "object") return json as T;
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logStorage(`Failed to parse JSON: ${error}`, "warn");
    return fallback;
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function transformProject(dbProject: any): Project {
  return {
    id: dbProject.id,
    title: dbProject.title ?? "",
    description: dbProject.description ?? "",
    imageUrl: dbProject.imageUrl ?? "",
    category: dbProject.category ?? "",
    status: dbProject.status ?? "Completed",
    techStack: safeJsonParse<string[]>(dbProject.techStack, []),
    githubUrl: dbProject.githubUrl ?? null,
    liveUrl: dbProject.liveUrl ?? null,
    displayOrder: dbProject.displayOrder ?? 0,
    problemStatement: dbProject.problemStatement ?? null,
    motivation: dbProject.motivation ?? null,
    systemDesign: dbProject.systemDesign ?? null,
    challenges: dbProject.challenges ?? null,
    learnings: dbProject.learnings ?? null,
    isFlagship: Boolean(dbProject.isFlagship),
    impact: dbProject.impact ?? null,
    role: dbProject.role ?? null,
  };
}

function transformSkill(dbSkill: any): Skill {
  return {
    id: dbSkill.id,
    name: dbSkill.name ?? "",
    category: dbSkill.category ?? "",
    status: dbSkill.status ?? "Core",
    icon: dbSkill.icon ?? "Code",
    description: dbSkill.description ?? "",
    proof: dbSkill.proof ?? "",
    x: Number(dbSkill.x ?? 50),
    y: Number(dbSkill.y ?? 50),
  };
}

function transformExperience(dbExp: any): Experience {
  return {
    id: dbExp.id,
    role: dbExp.role ?? "",
    organization: dbExp.organization ?? "",
    period: dbExp.period ?? "",
    description: dbExp.description ?? "",
    type: dbExp.type ?? "",
  };
}

function transformService(dbService: any): Service {
  return {
    id: dbService.id,
    title: dbService.title ?? "",
    summary: dbService.summary ?? "",
    category: dbService.category ?? "",
    tags: safeJsonParse<string[]>(dbService.tags, []),
    displayOrder: dbService.displayOrder ?? 0,
    isFeatured: Boolean(dbService.isFeatured),
  };
}

function transformTestimonial(dbTestimonial: any): Testimonial {
  return {
    id: dbTestimonial.id,
    name: dbTestimonial.name ?? "",
    role: dbTestimonial.role ?? "",
    company: dbTestimonial.company ?? "",
    quote: dbTestimonial.quote ?? "",
    relationship: dbTestimonial.relationship ?? "Colleague",
    avatarUrl: dbTestimonial.avatarUrl ?? null,
    displayOrder: dbTestimonial.displayOrder ?? 0,
    createdAt: dbTestimonial.createdAt ?? new Date().toISOString(),
  };
}

function transformMessage(dbMsg: any): Message {
  return {
    id: dbMsg.id,
    name: dbMsg.name ?? "",
    email: dbMsg.email ?? "",
    subject: dbMsg.subject ?? "",
    message: dbMsg.message ?? "",
    createdAt: dbMsg.createdAt ?? new Date().toISOString(),
  };
}

function transformMindset(dbMindset: any): Mindset {
  return {
    id: dbMindset.id,
    title: dbMindset.title ?? "",
    description: dbMindset.description ?? "",
    icon: dbMindset.icon ?? "Brain",
    tags: safeJsonParse<string[]>(dbMindset.tags, []),
  };
}

function transformAnalytics(dbAnalytics: any): Analytics {
  return {
    id: dbAnalytics.id,
    type: dbAnalytics.type ?? "",
    targetId: dbAnalytics.targetId ?? null,
    path: dbAnalytics.path ?? "",
    browser: dbAnalytics.browser ?? null,
    os: dbAnalytics.os ?? null,
    device: dbAnalytics.device ?? null,
    country: dbAnalytics.country ?? null,
    city: dbAnalytics.city ?? null,
    createdAt: dbAnalytics.createdAt ?? new Date().toISOString(),
  };
}

function transformEmailTemplate(dbTemplate: any): EmailTemplate {
  return {
    id: dbTemplate.id,
    name: dbTemplate.name ?? "",
    subject: dbTemplate.subject ?? "",
    body: dbTemplate.body ?? "",
    createdAt: dbTemplate.createdAt ?? new Date().toISOString(),
  };
}

function transformSeoSettings(dbSeo: any): SeoSettings {
  return {
    id: dbSeo.id,
    pageSlug: dbSeo.pageSlug ?? "",
    metaTitle: dbSeo.metaTitle ?? "",
    metaDescription: dbSeo.metaDescription ?? "",
    ogTitle: dbSeo.ogTitle ?? null,
    ogDescription: dbSeo.ogDescription ?? null,
    ogImage: dbSeo.ogImage ?? null,
    keywords: dbSeo.keywords ?? null,
    canonicalUrl: dbSeo.canonicalUrl ?? null,
    noindex: Boolean(dbSeo.noindex),
    twitterCard: dbSeo.twitterCard ?? "summary_large_image",
    createdAt: dbSeo.createdAt ?? new Date().toISOString(),
    updatedAt: dbSeo.updatedAt ?? new Date().toISOString(),
  };
}

function transformArticle(dbArticle: any): Article {
  return {
    id: dbArticle.id,
    title: dbArticle.title ?? "",
    slug: dbArticle.slug ?? "",
    content: dbArticle.content ?? "",
    excerpt: dbArticle.excerpt ?? null,
    featuredImage: dbArticle.featuredImage ?? null,
    status: dbArticle.status ?? "draft",
    publishedAt: dbArticle.publishedAt ? new Date(dbArticle.publishedAt) : null,
    viewCount: dbArticle.viewCount ?? 0,
    readTimeMinutes: dbArticle.readTimeMinutes ?? 0,
    metaTitle: dbArticle.metaTitle ?? null,
    metaDescription: dbArticle.metaDescription ?? null,
    authorId: dbArticle.authorId ?? null,
    createdAt: dbArticle.createdAt ? new Date(dbArticle.createdAt) : new Date(),
    updatedAt: dbArticle.updatedAt ? new Date(dbArticle.updatedAt) : new Date(),
  };
}


// ================= DATABASE STORAGE =================
export class DatabaseStorage implements IStorage {
  private skillsCache: Skill[] | null = null;
  private experiencesCache: Experience[] | null = null;
  private servicesCache: Service[] | null = null;
  private testimonialsCache: Testimonial[] | null = null;
  private cacheTimestamp: Record<string, number> = {};
  private CACHE_TTL = 5 * 60 * 1000;

  private invalidateSkillsCache() {
    this.skillsCache = null;
    delete this.cacheTimestamp["skills"];
  }

  private invalidateExperiencesCache() {
    this.experiencesCache = null;
    delete this.cacheTimestamp["experiences"];
  }

  private invalidateServicesCache() {
    this.servicesCache = null;
    delete this.cacheTimestamp["services"];
  }

  private invalidateTestimonialsCache() {
    this.testimonialsCache = null;
    delete this.cacheTimestamp["testimonials"];
  }

  async getProjects(): Promise<Project[]> {
    try {
      const start = Date.now();
      const result = await db.select().from(projectsTable).orderBy(asc(projectsTable.displayOrder));
      const duration = Date.now() - start;
      logStorage(`Fetched ${result.length} projects in ${duration}ms`);
      return result.map(transformProject);
    } catch (error) {
      logStorage(`Failed to get projects: ${error}`, "error");
      throw new Error("Failed to fetch projects from database");
    }
  }

  async getProjectById(id: number): Promise<Project | null> {
    try {
      const [result] = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, id))
        .limit(1);
      return result ? transformProject(result) : null;
    } catch (error) {
      logStorage(`Failed to get project ${id}: ${error}`, "error");
      throw new Error(`Failed to fetch project with id ${id}`);
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      if (!project.title || !project.description) {
        throw new Error("Title and description are required");
      }

      const [inserted] = await db
        .insert(projectsTable)
        .values({
          title: project.title,
          description: project.description,
          imageUrl: project.imageUrl,
          category: project.category,
          githubUrl: project.githubUrl ?? null,
          liveUrl: project.liveUrl ?? null,
          problemStatement: project.problemStatement ?? null,
          motivation: project.motivation ?? null,
          systemDesign: project.systemDesign ?? null,
          challenges: project.challenges ?? null,
          learnings: project.learnings ?? null,
          techStack: project.techStack ?? [],
          isFlagship: project.isFlagship ?? false,
          impact: project.impact ?? null,
          role: project.role ?? null,
        })
        .returning();

      if (!inserted) throw new Error("Failed to create project");

      logStorage(`Created project: ${inserted.title}`);
      return transformProject(inserted);
    } catch (error) {
      logStorage(`Failed to create project: ${error}`, "error");
      throw error;
    }
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    try {
      const updates: Record<string, any> = { ...project };
      if (project.techStack) {
        updates.techStack = project.techStack;
      }
      if (typeof project.isFlagship !== "undefined") {
        updates.isFlagship = project.isFlagship;
      }

      const [updated] = await db
        .update(projectsTable)
        .set(updates)
        .where(eq(projectsTable.id, id))
        .returning();

      if (!updated) {
        throw new Error(`Project with id ${id} not found after update`);
      }

      logStorage(`Updated project: ${updated.title}`);
      return transformProject(updated);
    } catch (error) {
      logStorage(`Failed to update project ${id}: ${error}`, "error");
      throw error;
    }
  }

  async deleteProject(id: number): Promise<void> {
    try {
      const project = await this.getProjectById(id);
      if (!project) {
        throw new Error(`Project with id ${id} not found`);
      }

      await db
        .delete(projectsTable)
        .where(eq(projectsTable.id, id));

      logStorage(`Deleted project: ${project.title}`);
    } catch (error) {
      logStorage(`Failed to delete project ${id}: ${error}`, "error");
      throw error;
    }
  }

  async reorderProjects(orderedIds: number[]): Promise<void> {
    try {
      // Using Promise.all for parallel updates is fine for this scale
      const updates = orderedIds.map((id, index) =>
        db
          .update(projectsTable)
          .set({ displayOrder: index })
          .where(eq(projectsTable.id, id))
      );
      await Promise.all(updates);
      logStorage(`Reordered ${orderedIds.length} projects`);
    } catch (error) {
      logStorage(`Failed to reorder projects: ${error}`, "error");
      throw error;
    }
  }

  async bulkDeleteMessages(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    try {
      await db.transaction(async (tx: any) => {
        await tx.delete(messagesTable).where(inArray(messagesTable.id, ids));
      });
      logStorage(`Bulk deleted ${ids.length} messages`);
    } catch (error) {
      logStorage(`Failed to bulk delete messages: ${error}`, "error");
      throw error;
    }
  }

  async bulkDeleteProjects(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    try {
      await db.transaction(async (tx: any) => {
        await tx.delete(projectsTable).where(inArray(projectsTable.id, ids));
      });
      logStorage(`Bulk deleted ${ids.length} projects`);
    } catch (error) {
      logStorage(`Failed to bulk delete projects: ${error}`, "error");
      throw error;
    }
  }

  async bulkUpdateProjectStatus(ids: number[], status: string): Promise<void> {
    if (ids.length === 0) return;
    try {
      await db.transaction(async (tx: any) => {
        await tx
          .update(projectsTable)
          .set({ status })
          .where(inArray(projectsTable.id, ids));
      });
      logStorage(`Bulk updated status for ${ids.length} projects to ${status}`);
    } catch (error) {
      logStorage(`Failed to bulk update project status: ${error}`, "error");
      throw error;
    }
  }

  async getSkills(): Promise<Skill[]> {
    try {
      const now = Date.now();
      if (
        this.skillsCache &&
        this.cacheTimestamp["skills"] &&
        now - this.cacheTimestamp["skills"] < this.CACHE_TTL
      ) {
        logStorage("Returning cached skills");
        return this.skillsCache;
      }

      const start = Date.now();
      const result = await db.select().from(skillsTable);
      const duration = Date.now() - start;

      const transformed = result.map(transformSkill);
      this.skillsCache = transformed;
      this.cacheTimestamp["skills"] = now;

      logStorage(`Fetched ${result.length} skills in ${duration}ms`);
      return transformed;
    } catch (error) {
      logStorage(`Failed to get skills: ${error}`, "error");
      throw new Error("Failed to fetch skills from database");
    }
  }

  async getSkillById(id: number): Promise<Skill | null> {
    try {
      const [result] = await db
        .select()
        .from(skillsTable)
        .where(eq(skillsTable.id, id))
        .limit(1);
      return result ? transformSkill(result) : null;
    } catch (error) {
      logStorage(`Failed to get skill ${id}: ${error}`, "error");
      throw new Error(`Failed to fetch skill with id ${id}`);
    }
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    try {
      if (!skill.name || !skill.category) {
        throw new Error("Name and category are required");
      }

      const [inserted] = await db
        .insert(skillsTable)
        .values({
          name: skill.name,
          category: skill.category,
          status: skill.status || "Core",
          icon: skill.icon || "Code",
          description: skill.description || "",
          proof: skill.proof || "",
          x: skill.x ?? 50,
          y: skill.y ?? 50,
        })
        .returning();

      if (!inserted) throw new Error("Failed to create skill");

      this.invalidateSkillsCache();
      logStorage(`Created skill: ${inserted.name}`);
      return transformSkill(inserted);
    } catch (error) {
      logStorage(`Failed to create skill: ${error}`, "error");
      throw error;
    }
  }

  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill> {
    try {
      const [updated] = await db
        .update(skillsTable)
        .set(skill)
        .where(eq(skillsTable.id, id))
        .returning();

      if (!updated) {
        throw new Error(`Skill with id ${id} not found after update`);
      }

      this.invalidateSkillsCache();
      logStorage(`Updated skill: ${updated.name}`);
      return transformSkill(updated);
    } catch (error) {
      logStorage(`Failed to update skill ${id}: ${error}`, "error");
      throw error;
    }
  }

  async deleteSkill(id: number): Promise<void> {
    try {
      const skill = await this.getSkillById(id);
      if (!skill) {
        throw new Error(`Skill with id ${id} not found`);
      }

      await db
        .delete(skillsTable)
        .where(eq(skillsTable.id, id));

      this.invalidateSkillsCache();
      logStorage(`Deleted skill: ${skill.name}`);
    } catch (error) {
      logStorage(`Failed to delete skill ${id}: ${error}`, "error");
      throw error;
    }
  }

  async bulkDeleteSkills(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    try {
      await db.transaction(async (tx: any) => {
        await tx.delete(skillsTable).where(inArray(skillsTable.id, ids));
      });
      this.invalidateSkillsCache();
      logStorage(`Bulk deleted ${ids.length} skills`);
    } catch (error) {
      logStorage(`Failed to bulk delete skills: ${error}`, "error");
      throw error;
    }
  }

  async getExperiences(): Promise<Experience[]> {
    try {
      const now = Date.now();
      if (
        this.experiencesCache &&
        this.cacheTimestamp["experiences"] &&
        now - this.cacheTimestamp["experiences"] < this.CACHE_TTL
      ) {
        logStorage("Returning cached experiences");
        return this.experiencesCache;
      }

      const start = Date.now();
      const result = await db.select().from(experiencesTable);
      const duration = Date.now() - start;

      const transformed = result.map(transformExperience);
      this.experiencesCache = transformed;
      this.cacheTimestamp["experiences"] = now;

      logStorage(`Fetched ${result.length} experiences in ${duration}ms`);
      return transformed;
    } catch (error) {
      logStorage(`Failed to get experiences: ${error}`, "error");
      throw new Error("Failed to fetch experiences from database");
    }
  }

  async getExperienceById(id: number): Promise<Experience | null> {
    try {
      const [result] = await db
        .select()
        .from(experiencesTable)
        .where(eq(experiencesTable.id, id))
        .limit(1);
      return result ? transformExperience(result) : null;
    } catch (error) {
      logStorage(`Failed to get experience ${id}: ${error}`, "error");
      throw new Error(`Failed to fetch experience with id ${id}`);
    }
  }

  async createExperience(exp: InsertExperience): Promise<Experience> {
    try {
      if (!exp.role || !exp.organization) {
        throw new Error("Role and organization are required");
      }

      const [inserted] = await db
        .insert(experiencesTable)
        .values({
          role: exp.role,
          organization: exp.organization,
          period: exp.period,
          description: exp.description,
          type: exp.type || "Experience",
        })
        .returning();

      if (!inserted) throw new Error("Failed to create experience");

      this.invalidateExperiencesCache();
      logStorage(`Created experience: ${inserted.role} at ${inserted.organization}`);
      return transformExperience(inserted);
    } catch (error) {
      logStorage(`Failed to create experience: ${error}`, "error");
      throw error;
    }
  }

  async updateExperience(id: number, exp: Partial<InsertExperience>): Promise<Experience> {
    try {
      const [updated] = await db
        .update(experiencesTable)
        .set(exp)
        .where(eq(experiencesTable.id, id))
        .returning();

      if (!updated) {
        throw new Error(`Experience with id ${id} not found after update`);
      }

      this.invalidateExperiencesCache();
      logStorage(`Updated experience: ${updated.role}`);
      return transformExperience(updated);
    } catch (error) {
      logStorage(`Failed to update experience ${id}: ${error}`, "error");
      throw error;
    }
  }

  async deleteExperience(id: number): Promise<void> {
    try {
      const exp = await this.getExperienceById(id);
      if (!exp) {
        throw new Error(`Experience with id ${id} not found`);
      }

      await db
        .delete(experiencesTable)
        .where(eq(experiencesTable.id, id));

      this.invalidateExperiencesCache();
      logStorage(`Deleted experience: ${exp.role}`);
    } catch (error) {
      logStorage(`Failed to delete experience ${id}: ${error}`, "error");
      throw error;
    }
  }

  async getServices(): Promise<Service[]> {
    try {
      const now = Date.now();
      if (
        this.servicesCache &&
        this.cacheTimestamp["services"] &&
        now - this.cacheTimestamp["services"] < this.CACHE_TTL
      ) {
        logStorage("Returning cached services");
        return this.servicesCache;
      }

      const start = Date.now();
      const result = await db.select().from(servicesTable).orderBy(asc(servicesTable.displayOrder));
      const duration = Date.now() - start;

      const transformed = result.map(transformService);
      this.servicesCache = transformed;
      this.cacheTimestamp["services"] = now;

      logStorage(`Fetched ${result.length} services in ${duration}ms`);
      return transformed;
    } catch (error) {
      logStorage(`Failed to get services: ${error}`, "error");
      throw new Error("Failed to fetch services from database");
    }
  }

  async getServiceById(id: number): Promise<Service | null> {
    try {
      const [result] = await db
        .select()
        .from(servicesTable)
        .where(eq(servicesTable.id, id))
        .limit(1);
      return result ? transformService(result) : null;
    } catch (error) {
      logStorage(`Failed to get service ${id}: ${error}`, "error");
      throw new Error(`Failed to fetch service with id ${id}`);
    }
  }

  async createService(service: InsertService): Promise<Service> {
    try {
      if (!service.title || !service.summary) {
        throw new Error("Title and summary are required");
      }

      const [inserted] = await db
        .insert(servicesTable)
        .values({
          title: service.title,
          summary: service.summary,
          category: service.category,
          tags: service.tags ?? [],
          displayOrder: service.displayOrder ?? 0,
          isFeatured: service.isFeatured ?? false,
        })
        .returning();

      if (!inserted) throw new Error("Failed to create service");

      this.invalidateServicesCache();
      logStorage(`Created service: ${inserted.title}`);
      return transformService(inserted);
    } catch (error) {
      logStorage(`Failed to create service: ${error}`, "error");
      throw error;
    }
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service> {
    try {
      const [updated] = await db
        .update(servicesTable)
        .set(service)
        .where(eq(servicesTable.id, id))
        .returning();

      if (!updated) {
        throw new Error(`Service with id ${id} not found after update`);
      }

      this.invalidateServicesCache();
      logStorage(`Updated service: ${updated.title}`);
      return transformService(updated);
    } catch (error) {
      logStorage(`Failed to update service ${id}: ${error}`, "error");
      throw error;
    }
  }

  async deleteService(id: number): Promise<void> {
    try {
      const service = await this.getServiceById(id);
      if (!service) {
        throw new Error(`Service with id ${id} not found`);
      }

      await db
        .delete(servicesTable)
        .where(eq(servicesTable.id, id));

      this.invalidateServicesCache();
      logStorage(`Deleted service: ${service.title}`);
    } catch (error) {
      logStorage(`Failed to delete service ${id}: ${error}`, "error");
      throw error;
    }
  }

  // ================= TESTIMONIALS =================

  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const now = Date.now();
      if (
        this.testimonialsCache &&
        this.cacheTimestamp["testimonials"] &&
        now - this.cacheTimestamp["testimonials"] < this.CACHE_TTL
      ) {
        logStorage("Returning cached testimonials");
        return this.testimonialsCache;
      }

      const start = Date.now();
      const result = await db.select().from(testimonialsTable).orderBy(asc(testimonialsTable.displayOrder));
      const duration = Date.now() - start;

      const transformed = result.map(transformTestimonial);
      this.testimonialsCache = transformed;
      this.cacheTimestamp["testimonials"] = now;

      logStorage(`Fetched ${result.length} testimonials in ${duration}ms`);
      return transformed;
    } catch (error) {
      logStorage(`Failed to get testimonials: ${error}`, "error");
      throw new Error("Failed to fetch testimonials from database");
    }
  }

  async getTestimonialById(id: number): Promise<Testimonial | null> {
    try {
      const [result] = await db
        .select()
        .from(testimonialsTable)
        .where(eq(testimonialsTable.id, id))
        .limit(1);
      return result ? transformTestimonial(result) : null;
    } catch (error) {
      logStorage(`Failed to get testimonial ${id}: ${error}`, "error");
      throw new Error(`Failed to fetch testimonial with id ${id}`);
    }
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    try {
      if (!testimonial.name || !testimonial.quote) {
        throw new Error("Name and quote are required");
      }

      const [inserted] = await db
        .insert(testimonialsTable)
        .values({
          name: testimonial.name,
          role: testimonial.role,
          company: testimonial.company ?? "",
          quote: testimonial.quote,
          relationship: testimonial.relationship ?? "Colleague",
          avatarUrl: testimonial.avatarUrl ?? null,
          displayOrder: testimonial.displayOrder ?? 0,
        })
        .returning();

      if (!inserted) throw new Error("Failed to create testimonial");

      this.invalidateTestimonialsCache();
      logStorage(`Created testimonial from: ${inserted.name}`);
      return transformTestimonial(inserted);
    } catch (error) {
      logStorage(`Failed to create testimonial: ${error}`, "error");
      throw error;
    }
  }

  async updateTestimonial(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial> {
    try {
      const [updated] = await db
        .update(testimonialsTable)
        .set(testimonial)
        .where(eq(testimonialsTable.id, id))
        .returning();

      if (!updated) {
        throw new Error(`Testimonial with id ${id} not found after update`);
      }

      this.invalidateTestimonialsCache();
      logStorage(`Updated testimonial from: ${updated.name}`);
      return transformTestimonial(updated);
    } catch (error) {
      logStorage(`Failed to update testimonial ${id}: ${error}`, "error");
      throw error;
    }
  }

  async deleteTestimonial(id: number): Promise<void> {
    try {
      const testimonial = await this.getTestimonialById(id);
      if (!testimonial) {
        throw new Error(`Testimonial with id ${id} not found`);
      }

      await db
        .delete(testimonialsTable)
        .where(eq(testimonialsTable.id, id));

      this.invalidateTestimonialsCache();
      logStorage(`Deleted testimonial from: ${testimonial.name}`);
    } catch (error) {
      logStorage(`Failed to delete testimonial ${id}: ${error}`, "error");
      throw error;
    }
  }

  async getMessages(): Promise<Message[]> {
    try {
      const start = Date.now();
      const result = await db.select().from(messagesTable);
      const duration = Date.now() - start;
      logStorage(`Fetched ${result.length} messages in ${duration}ms`);
      return result.map(transformMessage);
    } catch (error) {
      logStorage(`Failed to get messages: ${error}`, "error");
      throw new Error("Failed to fetch messages from database");
    }
  }

  async getMessageById(id: number): Promise<Message | null> {
    try {
      const [result] = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.id, id))
        .limit(1);
      return result ? transformMessage(result) : null;
    } catch (error) {
      logStorage(`Failed to get message ${id}: ${error}`, "error");
      throw new Error(`Failed to fetch message with id ${id}`);
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      if (!message.name || !message.email || !message.message) {
        throw new Error("Name, email, and message are required");
      }

      if (!isValidEmail(message.email)) {
        throw new Error("Invalid email format");
      }

      const sanitized = {
        name: message.name.trim().slice(0, 255),
        email: message.email.trim().toLowerCase(),
        subject: (message.subject ?? "").trim().slice(0, 500),
        message: message.message.trim().slice(0, 5000),
      };

      const [inserted] = await db
        .insert(messagesTable)
        .values(sanitized)
        .returning();

      if (!inserted) throw new Error("Failed to create message");

      logStorage(`Created message from: ${inserted.name} (${inserted.email})`);
      return transformMessage(inserted);
    } catch (error) {
      logStorage(`Failed to create message: ${error}`, "error");
      throw error;
    }
  }

  async deleteMessage(id: number): Promise<void> {
    try {
      const message = await this.getMessageById(id);
      if (!message) {
        throw new Error(`Message with id ${id} not found`);
      }

      await db
        .delete(messagesTable)
        .where(eq(messagesTable.id, id));

      logStorage(`Deleted message from: ${message.name}`);
    } catch (error) {
      logStorage(`Failed to delete message ${id}: ${error}`, "error");
      throw error;
    }
  }

  async getSkillConnections(): Promise<SkillConnection[]> {
    try {
      const result = await db.select().from(skillConnectionsTable);
      return result as SkillConnection[];
    } catch (error) {
      logStorage(`Failed to get skill connections: ${error}`, "error");
      throw new Error("Failed to fetch skill connections");
    }
  }

  async createSkillConnection(connection: Omit<SkillConnection, "id">): Promise<SkillConnection> {
    try {
      const [inserted] = await db.insert(skillConnectionsTable).values({
        fromSkillId: connection.fromSkillId,
        toSkillId: connection.toSkillId,
      }).returning();
      if (!inserted) throw new Error("Failed to create skill connection");
      return inserted as SkillConnection;
    } catch (error) {
      logStorage(`Failed to create skill connection: ${error}`, "error");
      throw error;
    }
  }

  async getMindset(): Promise<Mindset[]> {
    try {
      const result = await db.select().from(mindsetTable);
      return result.map(transformMindset);
    } catch (error) {
      logStorage(`Failed to get mindset: ${error}`, "error");
      throw new Error("Failed to fetch mindset principles");
    }
  }

  async getMindsetById(id: number): Promise<Mindset | null> {
    try {
      const [result] = await db
        .select()
        .from(mindsetTable)
        .where(eq(mindsetTable.id, id))
        .limit(1);
      return result ? transformMindset(result) : null;
    } catch (error) {
      logStorage(`Failed to get mindset ${id}: ${error}`, "error");
      throw new Error(`Failed to fetch mindset with id ${id}`);
    }
  }

  async createMindset(mindset: Omit<Mindset, "id">): Promise<Mindset> {
    try {
      const [inserted] = await db.insert(mindsetTable).values({
        title: mindset.title,
        description: mindset.description,
        icon: mindset.icon,
        tags: mindset.tags,
      }).returning();
      if (!inserted) throw new Error("Failed to create mindset");
      return transformMindset(inserted);
    } catch (error) {
      logStorage(`Failed to create mindset: ${error}`, "error");
      throw error;
    }
  }

  async updateMindset(id: number, mindset: Partial<Omit<Mindset, "id">>): Promise<Mindset> {
    try {
      const [updated] = await db
        .update(mindsetTable)
        .set(mindset)
        .where(eq(mindsetTable.id, id))
        .returning();
      if (!updated) throw new Error(`Mindset principle ${id} not found after update`);
      return transformMindset(updated);
    } catch (error) {
      logStorage(`Failed to update mindset ${id}: ${error}`, "error");
      throw error;
    }
  }

  async deleteMindset(id: number): Promise<void> {
    try {
      await db.delete(mindsetTable).where(eq(mindsetTable.id, id));
      logStorage(`Deleted mindset principle: ${id}`);
    } catch (error) {
      logStorage(`Failed to delete mindset ${id}: ${error}`, "error");
      throw error;
    }
  }

  async logAnalyticsEvent(event: InsertAnalytics): Promise<Analytics> {
    try {
      const [inserted] = await db.insert(analyticsTable).values(event).returning();
      if (!inserted) throw new Error("Failed to log analytics event");
      return transformAnalytics(inserted);
    } catch (error) {
      logStorage(`Failed to log analytics event: ${error}`, "error");
      throw error;
    }
  }

  async getAnalyticsSummary(): Promise<any> {
    try {
      const [totalResult] = await db
        .select({ value: count() })
        .from(analyticsTable);
      const [viewsResult] = await db
        .select({ value: count() })
        .from(analyticsTable)
        .where(eq(analyticsTable.type, "page_view"));

      return {
        totalViews: viewsResult?.value ?? 0,
        events: totalResult?.value ?? 0,
      };
    } catch (error) {
      logStorage(`Failed to get analytics summary: ${error}`, "error");
      throw error;
    }
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const result = await db.select().from(emailTemplatesTable);
      return result.map(transformEmailTemplate);
    } catch (error) {
      logStorage(`Failed to get email templates: ${error}`, "error");
      throw new Error("Failed to fetch email templates from database");
    }
  }

  async getEmailTemplateById(id: number): Promise<EmailTemplate | null> {
    try {
      const [result] = await db
        .select()
        .from(emailTemplatesTable)
        .where(eq(emailTemplatesTable.id, id))
        .limit(1);
      return result ? transformEmailTemplate(result) : null;
    } catch (error) {
      logStorage(`Failed to get email template ${id}: ${error}`, "error");
      throw new Error(`Failed to fetch email template with id ${id}`);
    }
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    try {
      const [inserted] = await db.insert(emailTemplatesTable).values(template).returning();
      if (!inserted) throw new Error("Failed to create email template");
      return transformEmailTemplate(inserted);
    } catch (error) {
      logStorage(`Failed to create email template: ${error}`, "error");
      throw error;
    }
  }

  async updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
    try {
      const [updated] = await db
        .update(emailTemplatesTable)
        .set(template)
        .where(eq(emailTemplatesTable.id, id))
        .returning();
      if (!updated) throw new Error(`Email template ${id} not found after update`);
      return transformEmailTemplate(updated);
    } catch (error) {
      logStorage(`Failed to update email template ${id}: ${error}`, "error");
      throw error;
    }
  }

  async deleteEmailTemplate(id: number): Promise<void> {
    try {
      await db
        .delete(emailTemplatesTable)
        .where(eq(emailTemplatesTable.id, id));
      logStorage(`Deleted email template: ${id}`);
    } catch (error) {
      logStorage(`Failed to delete email template ${id}: ${error}`, "error");
      throw error;
    }
  }

  async getSeoSettings(): Promise<SeoSettings[]> {
    try {
      const result = await db.select().from(seoSettingsTable);
      return result.map(transformSeoSettings);
    } catch (error) {
      logStorage(`Failed to get SEO settings: ${error}`, "error");
      throw new Error("Failed to fetch SEO settings from database");
    }
  }

  async getSeoSettingsBySlug(slug: string): Promise<SeoSettings | null> {
    try {
      const [result] = await db
        .select()
        .from(seoSettingsTable)
        .where(eq(seoSettingsTable.pageSlug, slug))
        .limit(1);
      return result ? transformSeoSettings(result) : null;
    } catch (error) {
      logStorage(`Failed to get SEO settings for slug ${slug}: ${error}`, "error");
      throw new Error(`Failed to fetch SEO settings for slug ${slug}`);
    }
  }

  async createSeoSettings(settings: InsertSeoSettings): Promise<SeoSettings> {
    try {
      const [inserted] = await db.insert(seoSettingsTable).values(settings).returning();
      if (!inserted) throw new Error("Failed to create SEO settings");

      logStorage(`Created SEO settings for: ${inserted.pageSlug}`);
      return transformSeoSettings(inserted);
    } catch (error) {
      logStorage(`Failed to create SEO settings: ${error}`, "error");
      throw error;
    }
  }

  async updateSeoSettings(id: number, settings: Partial<InsertSeoSettings>): Promise<SeoSettings> {
    try {
      await db
        .update(seoSettingsTable)
        .set(settings)
        .where(eq(seoSettingsTable.id, id));

      // To return the updated object, we need to fetch it.
      // But I didn't verify if I have getSeoSettingsById. 
      // I only have getSeoSettingsBySlug. 
      // Using slug might be risky if slug was changed.
      // But wait, I can add getSeoSettingsById if needed, or query directly here.

      const [updated] = await db.select().from(seoSettingsTable).where(eq(seoSettingsTable.id, id)).limit(1);

      if (!updated) throw new Error(`SEO settings ${id} not found after update`);

      return transformSeoSettings(updated);
    } catch (error) {
      logStorage(`Failed to update SEO settings ${id}: ${error}`, "error");
      throw error;
    }
  }

  async deleteSeoSettings(id: number): Promise<void> {
    try {
      await db
        .delete(seoSettingsTable)
        .where(eq(seoSettingsTable.id, id));
      logStorage(`Deleted SEO settings: ${id}`);
    } catch (error) {
      logStorage(`Failed to delete SEO settings ${id}: ${error}`, "error");
      throw error;
    }
  }

  // Articles
  async getArticles(status?: string): Promise<Article[]> {
    try {
      const start = Date.now();
      let query = db.select().from(articlesTable).orderBy(desc(articlesTable.createdAt));

      if (status) {
        // @ts-ignore - Status inference might be tricky
        query = query.where(eq(articlesTable.status, status));
      }

      const result = await query;

      if (result.length === 0) return [];

      // Fetch tags for all articles in one go
      const articleIds = result.map(a => a.id);
      const allTags = await db
        .select()
        .from(articleTagsTable)
        .where(inArray(articleTagsTable.articleId, articleIds));

      // Group tags by articleId
      const tagsMap = allTags.reduce((acc: any, tag: any) => {
        if (!acc[tag.articleId]) acc[tag.articleId] = [];
        acc[tag.articleId].push(tag.tag);
        return acc;
      }, {} as Record<number, string[]>);

      const formattedResult = result.map((article: any) => ({
        ...transformArticle(article),
        tags: tagsMap[article.id] || []
      }));

      const duration = Date.now() - start;
      logStorage(`Fetched ${formattedResult.length} articles with tags in ${duration}ms`);
      return formattedResult;
    } catch (error) {
      logStorage(`Failed to get articles: ${error}`, "error");
      throw new Error("Failed to fetch articles from database");
    }
  }

  async getArticleById(id: number): Promise<Article | null> {
    try {
      const [result] = await db
        .select()
        .from(articlesTable)
        .where(eq(articlesTable.id, id))
        .limit(1);

      if (!result) return null;

      const tags = await db
        .select({ tag: articleTagsTable.tag })
        .from(articleTagsTable)
        .where(eq(articleTagsTable.articleId, id));

      return {
        ...transformArticle(result),
        tags: tags.map((t: any) => t.tag)
      };
    } catch (error) {
      logStorage(`Failed to get article ${id}: ${error}`, "error");
      throw new Error(`Failed to fetch article with id ${id}`);
    }
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const [result] = await db
        .select()
        .from(articlesTable)
        .where(eq(articlesTable.slug, slug))
        .limit(1);

      if (!result) return null;

      const tags = await db
        .select({ tag: articleTagsTable.tag })
        .from(articleTagsTable)
        .where(eq(articleTagsTable.articleId, result.id));

      return {
        ...transformArticle(result),
        tags: tags.map((t: any) => t.tag)
      };
    } catch (error) {
      logStorage(`Failed to get article by slug ${slug}: ${error}`, "error");
      throw new Error(`Failed to fetch article with slug ${slug}`);
    }
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    try {
      if (!article.title || !article.content) {
        throw new Error("Title and content are required");
      }

      const { tags, ...articleData } = article;
      const slug = articleData.slug || articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      return await db.transaction(async (tx: any) => {
        const [inserted] = await tx.insert(articlesTable).values({
          ...articleData,
          slug,
          excerpt: articleData.excerpt ?? null,
          featuredImage: articleData.featuredImage ?? null,
          status: articleData.status || "draft",
          publishedAt: articleData.publishedAt ? new Date(articleData.publishedAt) : null,
          viewCount: 0,
          readTimeMinutes: articleData.readTimeMinutes ?? 0,
          metaTitle: articleData.metaTitle ?? null,
          metaDescription: articleData.metaDescription ?? null,
          authorId: null,
        }).returning();

        if (!inserted) throw new Error("Failed to create article");

        if (tags && tags.length > 0) {
          await tx.insert(articleTagsTable).values(
            tags.map((tag: string) => ({
              articleId: inserted.id,
              tag
            }))
          );
        }

        const fullArticle = await this.getArticleById(inserted.id);
        if (!fullArticle) throw new Error("Failed to fetch inserted article");

        logStorage(`Created article: ${fullArticle.title}`);
        return fullArticle;
      });
    } catch (error) {
      logStorage(`Failed to create article: ${error}`, "error");
      throw error;
    }
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article> {
    try {
      const { tags, ...articleData } = article;

      return await db.transaction(async (tx: any) => {
        if (Object.keys(articleData).length > 0) {
          const updateData: any = { ...articleData };
          if (updateData.publishedAt) {
            updateData.publishedAt = new Date(updateData.publishedAt);
          }

          await tx
            .update(articlesTable)
            .set(updateData)
            .where(eq(articlesTable.id, id));
        }

        if (tags) {
          await tx.delete(articleTagsTable).where(eq(articleTagsTable.articleId, id));
          if (tags.length > 0) {
            await tx.insert(articleTagsTable).values(
              tags.map((tag: string) => ({
                articleId: id,
                tag
              }))
            );
          }
        }

        const updated = await this.getArticleById(id);
        if (!updated) {
          throw new Error(`Article with id ${id} not found after update`);
        }

        logStorage(`Updated article: ${updated.title}`);
        return updated;
      });
    } catch (error) {
      logStorage(`Failed to update article ${id}: ${error}`, "error");
      throw error;
    }
  }

  async deleteArticle(id: number): Promise<void> {
    try {
      const article = await this.getArticleById(id);
      if (!article) {
        throw new Error(`Article with id ${id} not found`);
      }

      await db.transaction(async (tx: any) => {
        // Delete tags first
        await tx.delete(articleTagsTable).where(eq(articleTagsTable.articleId, id));
        // Delete article
        await tx.delete(articlesTable).where(eq(articlesTable.id, id));
      });

      logStorage(`Deleted article: ${article.title}`);
    } catch (error) {
      logStorage(`Failed to delete article ${id}: ${error}`, "error");
      throw error;
    }
  }

  async bulkDeleteArticles(ids: number[]): Promise<void> {
    try {
      await db.transaction(async (tx: any) => {
        // Delete all tags for these articles
        await tx.delete(articleTagsTable).where(inArray(articleTagsTable.articleId, ids));
        // Delete the articles
        await tx.delete(articlesTable).where(inArray(articlesTable.id, ids));
      });
      logStorage(`Bulk deleted ${ids.length} articles`);
    } catch (error) {
      logStorage(`Failed bulk delete articles: ${error}`, "error");
      throw error;
    }
  }
}

// ================= DATABASE STORAGE =================
export const storage: IStorage = new DatabaseStorage();

/**
 * Utility to swap storage at runtime (kept for compatibility, though fallback is removed)
 */
export function setStorage(newStorage: IStorage) {
  logStorage(`WARNING: Attempted to swap storage to: ${newStorage.constructor.name}. This utility is deprecated as MemStorage is removed.`);
}
