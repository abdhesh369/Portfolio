
// ============================================================
// FILE: src/storage.ts
// ============================================================
import { eq } from "drizzle-orm";
import { db as db2 } from "./db.js";
import {
  projectsTable,
  skillsTable,
  experiencesTable,
  messagesTable,
  mindsetTable,
  skillConnectionsTable,
  type Project,
  type Skill,
  type SkillConnection,
  type Experience,
  type Message,
  type Mindset,
  type InsertMessage,
  type InsertProject,
  type InsertSkill,
  type InsertExperience,
} from "../shared/schema.js";

// ================= STORAGE INTERFACE =================
export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | null>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  // Skills
  getSkills(): Promise<Skill[]>;
  getSkillById(id: number): Promise<Skill | null>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill>;
  deleteSkill(id: number): Promise<void>;

  // Experiences
  getExperiences(): Promise<Experience[]>;
  getExperienceById(id: number): Promise<Experience | null>;
  createExperience(exp: InsertExperience): Promise<Experience>;
  updateExperience(id: number, exp: Partial<InsertExperience>): Promise<Experience>;
  deleteExperience(id: number): Promise<void>;

  // Messages
  getMessages(): Promise<Message[]>;
  getMessageById(id: number): Promise<Message | null>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: number): Promise<void>;

  // Skill Connections
  getSkillConnections(): Promise<SkillConnection[]>;
  createSkillConnection(connection: Omit<SkillConnection, "id">): Promise<SkillConnection>;

  // Mindset
  getMindset(): Promise<Mindset[]>;
  getMindsetById(id: number): Promise<Mindset | null>;
  createMindset(mindset: Omit<Mindset, "id">): Promise<Mindset>;
}

function logStorage(message: string, level: "info" | "error" | "warn" = "info") {
  const timestamp = new Date().toISOString();
  const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "✓";
  console.log(`${prefix} [${timestamp}] [STORAGE] ${message}`);
}

function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
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
    techStack: safeJsonParse<string[]>(dbProject.techStack, []),
    githubUrl: dbProject.githubUrl ?? null,
    liveUrl: dbProject.liveUrl ?? null,
    problemStatement: dbProject.problemStatement ?? null,
    motivation: dbProject.motivation ?? null,
    systemDesign: dbProject.systemDesign ?? null,
    challenges: dbProject.challenges ?? null,
    learnings: dbProject.learnings ?? null,
  };
}

function transformSkill(dbSkill: any): Skill {
  return {
    id: dbSkill.id,
    name: dbSkill.name ?? "",
    category: dbSkill.category ?? "",
    icon: dbSkill.icon ?? "",
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

// ================= MEMORY STORAGE =================
export class MemStorage implements IStorage {
  private projects: Map<number, Project>;
  private skills: Map<number, Skill>;
  private experiences: Map<number, Experience>;

  private messages: Map<number, Message>;
  private mindset: Map<number, Mindset>;
  private skillConnections: Map<number, SkillConnection>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.projects = new Map();
    this.skills = new Map();
    this.experiences = new Map();

    this.messages = new Map();
    this.mindset = new Map();
    this.skillConnections = new Map();
    this.currentIds = { projects: 1, skills: 1, experiences: 1, messages: 1, mindset: 1, skillConnections: 1 };
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectById(id: number): Promise<Project | null> {
    return this.projects.get(id) || null;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentIds.projects++;
    const newProject: Project = { ...project, id, techStack: project.techStack ?? [] } as Project;
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) throw new Error(`Project ${id} not found`);
    const updated = { ...existing, ...project } as Project;
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    this.projects.delete(id);
  }

  async getSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }

  async getSkillById(id: number): Promise<Skill | null> {
    return this.skills.get(id) || null;
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const id = this.currentIds.skills++;
    const newSkill: Skill = { ...skill, id } as Skill;
    this.skills.set(id, newSkill);
    return newSkill;
  }

  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill> {
    const existing = this.skills.get(id);
    if (!existing) throw new Error(`Skill ${id} not found`);
    const updated = { ...existing, ...skill } as Skill;
    this.skills.set(id, updated);
    return updated;
  }

  async deleteSkill(id: number): Promise<void> {
    this.skills.delete(id);
  }

  async getExperiences(): Promise<Experience[]> {
    return Array.from(this.experiences.values());
  }

  async getExperienceById(id: number): Promise<Experience | null> {
    return this.experiences.get(id) || null;
  }

  async createExperience(exp: InsertExperience): Promise<Experience> {
    const id = this.currentIds.experiences++;
    const newExp: Experience = { ...exp, id } as Experience;
    this.experiences.set(id, newExp);
    return newExp;
  }

  async updateExperience(id: number, exp: Partial<InsertExperience>): Promise<Experience> {
    const existing = this.experiences.get(id);
    if (!existing) throw new Error(`Experience ${id} not found`);
    const updated = { ...existing, ...exp } as Experience;
    this.experiences.set(id, updated);
    return updated;
  }

  async deleteExperience(id: number): Promise<void> {
    this.experiences.delete(id);
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  async getMessageById(id: number): Promise<Message | null> {
    return this.messages.get(id) || null;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentIds.messages++;
    const newMessage: Message = {
      ...message,
      id,
      createdAt: new Date().toISOString(),
    } as Message;
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async deleteMessage(id: number): Promise<void> {
    this.messages.delete(id);
  }

  async getSkillConnections(): Promise<SkillConnection[]> {
    return Array.from(this.skillConnections.values());
  }

  async createSkillConnection(connection: Omit<SkillConnection, "id">): Promise<SkillConnection> {
    const id = this.currentIds.skillConnections++;
    const newConnection: SkillConnection = { ...connection, id };
    this.skillConnections.set(id, newConnection);
    return newConnection;
  }

  async getMindset(): Promise<Mindset[]> {
    return Array.from(this.mindset.values());
  }

  async getMindsetById(id: number): Promise<Mindset | null> {
    return this.mindset.get(id) || null;
  }

  async createMindset(mindset: Omit<Mindset, "id">): Promise<Mindset> {
    const id = this.currentIds.mindset++;
    const newMindset: Mindset = { ...mindset, id };
    this.mindset.set(id, newMindset);
    return newMindset;
  }
}

// ================= DATABASE STORAGE =================
export class DatabaseStorage implements IStorage {
  private skillsCache: Skill[] | null = null;
  private experiencesCache: Experience[] | null = null;
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

  async getProjects(): Promise<Project[]> {
    try {
      const start = Date.now();
      const result = await db2.select().from(projectsTable);
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
      const [result] = await db2
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

      const [result] = await db2
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
          techStack: JSON.stringify(project.techStack ?? []),
        });

      const insertedId = (result as any).insertId;
      const inserted = await this.getProjectById(insertedId);

      if (!inserted) throw new Error("Failed to fetch inserted project");

      logStorage(`Created project: ${inserted.title}`);
      return inserted;
    } catch (error) {
      logStorage(`Failed to create project: ${error}`, "error");
      throw error;
    }
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    try {
      const updates: any = { ...project };
      if (project.techStack) {
        updates.techStack = JSON.stringify(project.techStack);
      }

      await db2
        .update(projectsTable)
        .set(updates)
        .where(eq(projectsTable.id, id));

      const updated = await this.getProjectById(id);

      if (!updated) {
        throw new Error(`Project with id ${id} not found after update`);
      }

      logStorage(`Updated project: ${updated.title}`);
      return updated;
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

      await db2
        .delete(projectsTable)
        .where(eq(projectsTable.id, id));

      logStorage(`Deleted project: ${project.title}`);
    } catch (error) {
      logStorage(`Failed to delete project ${id}: ${error}`, "error");
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
      const result = await db2.select().from(skillsTable);
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
      const [result] = await db2
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

      const [result] = await db2
        .insert(skillsTable)
        .values({
          name: skill.name,
          category: skill.category,
          icon: skill.icon || "Code",
        });

      const insertedId = (result as any).insertId;
      const inserted = await this.getSkillById(insertedId);

      if (!inserted) throw new Error("Failed to fetch inserted skill");

      this.invalidateSkillsCache();
      logStorage(`Created skill: ${inserted.name}`);
      return inserted;
    } catch (error) {
      logStorage(`Failed to create skill: ${error}`, "error");
      throw error;
    }
  }

  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill> {
    try {
      await db2
        .update(skillsTable)
        .set(skill)
        .where(eq(skillsTable.id, id));

      const updated = await this.getSkillById(id);

      if (!updated) {
        throw new Error(`Skill with id ${id} not found after update`);
      }

      this.invalidateSkillsCache();
      logStorage(`Updated skill: ${updated.name}`);
      return updated;
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

      await db2
        .delete(skillsTable)
        .where(eq(skillsTable.id, id));

      this.invalidateSkillsCache();
      logStorage(`Deleted skill: ${skill.name}`);
    } catch (error) {
      logStorage(`Failed to delete skill ${id}: ${error}`, "error");
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
      const result = await db2.select().from(experiencesTable);
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
      const [result] = await db2
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

      const [result] = await db2
        .insert(experiencesTable)
        .values({
          role: exp.role,
          organization: exp.organization,
          period: exp.period,
          description: exp.description,
          type: exp.type || "Experience",
        });

      const insertedId = (result as any).insertId;
      const inserted = await this.getExperienceById(insertedId);

      if (!inserted) throw new Error("Failed to fetch inserted experience");

      this.invalidateExperiencesCache();
      logStorage(`Created experience: ${inserted.role} at ${inserted.organization}`);
      return inserted;
    } catch (error) {
      logStorage(`Failed to create experience: ${error}`, "error");
      throw error;
    }
  }

  async updateExperience(id: number, exp: Partial<InsertExperience>): Promise<Experience> {
    try {
      await db2
        .update(experiencesTable)
        .set(exp)
        .where(eq(experiencesTable.id, id));

      const updated = await this.getExperienceById(id);

      if (!updated) {
        throw new Error(`Experience with id ${id} not found after update`);
      }

      this.invalidateExperiencesCache();
      logStorage(`Updated experience: ${updated.role}`);
      return updated;
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

      await db2
        .delete(experiencesTable)
        .where(eq(experiencesTable.id, id));

      this.invalidateExperiencesCache();
      logStorage(`Deleted experience: ${exp.role}`);
    } catch (error) {
      logStorage(`Failed to delete experience ${id}: ${error}`, "error");
      throw error;
    }
  }

  async getMessages(): Promise<Message[]> {
    try {
      const start = Date.now();
      const result = await db2.select().from(messagesTable);
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
      const [result] = await db2
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

      const [result] = await db2
        .insert(messagesTable)
        .values(sanitized);

      const insertedId = (result as any).insertId;
      const inserted = await this.getMessageById(insertedId);

      if (!inserted) throw new Error("Failed to fetch inserted message");

      logStorage(`Created message from: ${inserted.name} (${inserted.email})`);
      return inserted;
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

      await db2
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
      const result = await db2.select().from(skillConnectionsTable);
      return result as SkillConnection[];
    } catch (error) {
      logStorage(`Failed to get skill connections: ${error}`, "error");
      throw new Error("Failed to fetch skill connections");
    }
  }

  async createSkillConnection(connection: Omit<SkillConnection, "id">): Promise<SkillConnection> {
    try {
      const [result] = await db2.insert(skillConnectionsTable).values({
        fromSkillId: connection.fromSkillId,
        toSkillId: connection.toSkillId,
      });
      const insertedId = (result as any).insertId;
      return { ...connection, id: insertedId } as SkillConnection;
    } catch (error) {
      logStorage(`Failed to create skill connection: ${error}`, "error");
      throw error;
    }
  }

  async getMindset(): Promise<Mindset[]> {
    try {
      const result = await db2.select().from(mindsetTable);
      return result.map(transformMindset);
    } catch (error) {
      logStorage(`Failed to get mindset: ${error}`, "error");
      throw new Error("Failed to fetch mindset principles");
    }
  }

  async getMindsetById(id: number): Promise<Mindset | null> {
    try {
      const [result] = await db2
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
      const [result] = await db2.insert(mindsetTable).values({
        title: mindset.title,
        description: mindset.description,
        icon: mindset.icon,
        tags: JSON.stringify(mindset.tags),
      });
      const insertedId = (result as any).insertId;
      const inserted = await this.getMindsetById(insertedId);
      if (!inserted) throw new Error("Failed to fetch inserted mindset");
      return inserted;
    } catch (error) {
      logStorage(`Failed to create mindset: ${error}`, "error");
      throw error;
    }
  }
}

// ================= DYNAMIC EXPORT =================
let storageInstance: IStorage;

if (process.env.USE_MEMORY_DB === "true" || process.env.NODE_ENV === "test") {
  logStorage("Using In-Memory Storage (Explicitly requested or testing)");
  storageInstance = new MemStorage();
} else {
  storageInstance = new DatabaseStorage();
}

/**
 * ⚠️ WARNING: This instance might be swapped at runtime by index.ts 
 * if the database connection fails during startup.
 */
export let storage = storageInstance;

/**
 * Utility to swap storage at runtime (used by startup logic)
 */
export function setStorage(newStorage: IStorage) {
  storage = newStorage;
  logStorage(`Storage implementation swapped to: ${newStorage.constructor.name}`);
}