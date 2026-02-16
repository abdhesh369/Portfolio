import { mysqlTable, text, int, varchar, timestamp, json, float } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ================= DATABASE TABLES =================

export const projectsTable = mysqlTable("projects", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  techStack: json("techStack").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  githubUrl: varchar("githubUrl", { length: 500 }),
  liveUrl: varchar("liveUrl", { length: 500 }),
  category: varchar("category", { length: 100 }).notNull(),
  displayOrder: int("displayOrder").notNull().default(0),
  status: varchar("status", { length: 50 }).notNull().default("Completed"),
  problemStatement: text("problemStatement"),
  motivation: text("motivation"),
  systemDesign: text("systemDesign"),
  challenges: text("challenges"),
  learnings: text("learnings"),
});

export const skillsTable = mysqlTable("skills", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  status: varchar("status", { length: 100 }).notNull().default("Core"),
  icon: varchar("icon", { length: 100 }).notNull().default("Code"),
  description: text("description").notNull().default(""),
  proof: text("proof").notNull().default(""),
  x: float("x").notNull().default(50),
  y: float("y").notNull().default(50),
});

export const skillConnectionsTable = mysqlTable("skill_connections", {
  id: int("id").primaryKey().autoincrement(),
  fromSkillId: varchar("from_skill_id", { length: 100 }).notNull(),
  toSkillId: varchar("to_skill_id", { length: 100 }).notNull(),
});

export const experiencesTable = mysqlTable("experiences", {
  id: int("id").primaryKey().autoincrement(),
  role: varchar("role", { length: 200 }).notNull(),
  organization: varchar("organization", { length: 200 }).notNull(),
  period: varchar("period", { length: 100 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 100 }).notNull().default("Experience"),
});

export const messagesTable = mysqlTable("messages", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull().default(""),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const mindsetTable = mysqlTable("mindset", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }).notNull().default("Brain"),
  tags: json("tags").notNull(),
});

// ================= DRIZZLE-ZOD BASE SCHEMAS =================

export const selectProjectSchema = createSelectSchema(projectsTable);
export const insertProjectSchema = createInsertSchema(projectsTable);

export const selectSkillSchema = createSelectSchema(skillsTable);
export const insertSkillSchema = createInsertSchema(skillsTable);

export const selectSkillConnectionSchema = createSelectSchema(skillConnectionsTable);
export const insertSkillConnectionSchema = createInsertSchema(skillConnectionsTable);

export const selectExperienceSchema = createSelectSchema(experiencesTable);
export const insertExperienceSchema = createInsertSchema(experiencesTable);

export const selectMessageSchema = createSelectSchema(messagesTable);
export const insertMessageSchema = createInsertSchema(messagesTable);

export const selectMindsetSchema = createSelectSchema(mindsetTable);
export const insertMindsetSchema = createInsertSchema(mindsetTable);

// ================= CUSTOM API SCHEMAS =================

function isValidUrl(url: string | null | undefined): boolean {
  if (!url || url.trim() === "") return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export const projectSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(5000),
  techStack: z.array(z.string().max(100)).default([]),
  imageUrl: z.string().url().max(500),
  githubUrl: z.string().max(500).nullish().default(null),
  liveUrl: z.string().max(500).nullish().default(null),
  category: z.string().min(1).max(100),
  displayOrder: z.number().default(0),
  status: z.string().default("Completed"),
  problemStatement: z.string().max(5000).nullish(),
  motivation: z.string().max(5000).nullish(),
  systemDesign: z.string().max(5000).nullish(),
  challenges: z.string().max(5000).nullish(),
  learnings: z.string().max(5000).nullish(),
});

export const insertProjectApiSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(5000),
  techStack: z.array(z.string().max(100)).default([]),
  imageUrl: z.string().url().max(500),
  githubUrl: z.string().max(500).nullable().optional(),
  liveUrl: z.string().max(500).nullable().optional(),
  category: z.string().min(1).max(100),
  status: z.enum(["In Progress", "Completed", "Archived"]).default("Completed"),
  problemStatement: z.string().max(5000).nullable().optional(),
  motivation: z.string().max(5000).nullable().optional(),
  systemDesign: z.string().max(5000).nullable().optional(),
  challenges: z.string().max(5000).nullable().optional(),
  learnings: z.string().max(5000).nullable().optional(),
});

export const skillSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  status: z.string().max(100),
  icon: z.string().max(100),
  description: z.string().max(1000),
  proof: z.string().max(1000),
  x: z.number(),
  y: z.number(),
});

export const insertSkillApiSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  status: z.string().max(100).default("Core"),
  icon: z.string().max(100).default("Code"),
  description: z.string().max(1000).default(""),
  proof: z.string().max(1000).default(""),
  x: z.number().default(50),
  y: z.number().default(50),
});

export const skillConnectionSchema = z.object({
  id: z.number(),
  fromSkillId: z.string().min(1),
  toSkillId: z.string().min(1),
});

export const mindsetSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(255),
  description: z.string().max(5000),
  icon: z.string().max(100),
  tags: z.array(z.string()).default([]),
});

export const experienceSchema = z.object({
  id: z.number(),
  role: z.string().min(1).max(200),
  organization: z.string().min(1).max(200),
  period: z.string().min(1).max(100),
  description: z.string().min(1).max(5000),
  type: z.string().max(100),
});

export const insertExperienceApiSchema = z.object({
  role: z.string().min(1).max(200),
  organization: z.string().min(1).max(200),
  period: z.string().min(1).max(100),
  description: z.string().min(1).max(5000),
  type: z.string().max(100).default("Experience"),
});

export const messageSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  subject: z.string().max(500),
  message: z.string().min(1).max(5000),
  createdAt: z.string(),
});

export const insertMessageApiSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  subject: z.string().max(500).default(""),
  message: z.string().min(1).max(5000),
});

// ================= TYPESCRIPT TYPES =================

export type Project = z.infer<typeof projectSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type SkillConnection = z.infer<typeof skillConnectionSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Mindset = z.infer<typeof mindsetSchema>;

export type InsertProject = z.infer<typeof insertProjectApiSchema>;
export type InsertSkill = z.infer<typeof insertSkillApiSchema>;
export type InsertExperience = z.infer<typeof insertExperienceApiSchema>;
export type InsertMessage = z.infer<typeof insertMessageApiSchema>;

// ================= TYPE GUARDS =================

export function isProject(obj: unknown): obj is Project {
  return projectSchema.safeParse(obj).success;
}
export function isSkill(obj: unknown): obj is Skill {
  return skillSchema.safeParse(obj).success;
}
export function isExperience(obj: unknown): obj is Experience {
  return experienceSchema.safeParse(obj).success;
}
export function isMessage(obj: unknown): obj is Message {
  return messageSchema.safeParse(obj).success;
}
export function isMindset(obj: unknown): obj is Mindset {
  return mindsetSchema.safeParse(obj).success;
}
