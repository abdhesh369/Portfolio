import { mysqlTable, varchar, int, text } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ================= DATABASE TABLES =================

export const projectsTable = mysqlTable("projects", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  techStack: text("techStack").notNull(), // JSON string array
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  githubUrl: varchar("githubUrl", { length: 500 }),
  liveUrl: varchar("liveUrl", { length: 500 }),
  category: varchar("category", { length: 100 }).notNull(),
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
  icon: varchar("icon", { length: 100 }).notNull().default("Code"),
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
  createdAt: varchar("createdAt", { length: 100 })
    .notNull()
    .default(new Date().toISOString()),
});

// ================= DRIZZLE-ZOD BASE SCHEMAS =================

export const selectProjectSchema = createSelectSchema(projectsTable);
export const insertProjectSchema = createInsertSchema(projectsTable);

export const selectSkillSchema = createSelectSchema(skillsTable);
export const insertSkillSchema = createInsertSchema(skillsTable);

export const selectExperienceSchema = createSelectSchema(experiencesTable);
export const insertExperienceSchema = createInsertSchema(experiencesTable);

export const selectMessageSchema = createSelectSchema(messagesTable);
export const insertMessageSchema = createInsertSchema(messagesTable);

// ================= CUSTOM API SCHEMAS WITH VALIDATION =================

// Helper function to validate URLs (lenient, allows empty strings)
function isValidUrl(url: string): boolean {
  if (!url || url.trim() === "") return true; // Allow empty
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Project schema with parsed techStack array and strict validation
export const projectSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required").max(5000),
  techStack: z.array(z.string().max(100)).default([]),
  imageUrl: z.string().url("Must be a valid URL").max(500),
  githubUrl: z.string().max(500).url().nullish().default(null),
  liveUrl: z.string().max(500).url().nullish().default(null),
  category: z.string().min(1, "Category is required").max(100),
  problemStatement: z.string().max(5000).nullish(),
  motivation: z.string().max(5000).nullish(),
  systemDesign: z.string().max(5000).nullish(),
  challenges: z.string().max(5000).nullish(),
  learnings: z.string().max(5000).nullish(),
});

export const insertProjectApiSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required").max(5000),
  techStack: z.array(z.string().max(100)).default([]),
  imageUrl: z.string().url("Must be a valid URL").max(500),
  githubUrl: z
    .string()
    .max(500)
    .refine(isValidUrl, "Must be a valid URL")
    .nullable()
    .optional(),
  liveUrl: z
    .string()
    .max(500)
    .refine(isValidUrl, "Must be a valid URL")
    .nullable()
    .optional(),
  category: z.string().min(1, "Category is required").max(100),
  problemStatement: z.string().max(5000).nullable().default(null).optional(),
  motivation: z.string().max(5000).nullable().default(null).optional(),
  systemDesign: z.string().max(5000).nullable().default(null).optional(),
  challenges: z.string().max(5000).nullable().default(null).optional(),
  learnings: z.string().max(5000).nullable().default(null).optional(),
});

export const skillSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").max(100),
  category: z.string().min(1, "Category is required").max(100),
  icon: z.string().max(100),
});

export const insertSkillApiSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  category: z.string().min(1, "Category is required").max(100),
  icon: z.string().max(100).default("Code"),
});

export const experienceSchema = z.object({
  id: z.number(),
  role: z.string().min(1, "Role is required").max(200),
  organization: z.string().min(1, "Organization is required").max(200),
  period: z.string().min(1, "Period is required").max(100),
  description: z.string().min(1, "Description is required").max(5000),
  type: z.string().max(100),
});

export const insertExperienceApiSchema = z.object({
  role: z.string().min(1, "Role is required").max(200),
  organization: z.string().min(1, "Organization is required").max(200),
  period: z.string().min(1, "Period is required").max(100),
  description: z.string().min(1, "Description is required").max(5000),
  type: z.string().max(100).default("Experience"),
});

export const messageSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Must be a valid email").max(255),
  subject: z.string().max(500),
  message: z.string().min(1, "Message is required").max(5000),
  createdAt: z.string().datetime(),
});

export const insertMessageApiSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().trim().email("Must be a valid email").max(255),
  subject: z.string().max(500).default(""),
  message: z.string().min(1, "Message is required").max(5000),
});

// ================= TYPESCRIPT TYPES =================

// Select types (from database)
export type SelectProject = typeof projectsTable.$inferSelect;
export type SelectSkill = typeof skillsTable.$inferSelect;
export type SelectExperience = typeof experiencesTable.$inferSelect;
export type SelectMessage = typeof messagesTable.$inferSelect;

// Insert types (into database) - from API schemas
export type InsertProject = z.infer<typeof insertProjectApiSchema>;
export type InsertSkill = z.infer<typeof insertSkillApiSchema>;
export type InsertExperience = z.infer<typeof insertExperienceApiSchema>;
export type InsertMessage = z.infer<typeof insertMessageApiSchema>;

// API response types
export type Project = z.infer<typeof projectSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Message = z.infer<typeof messageSchema>;

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