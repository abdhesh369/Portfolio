import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
// ================= DATABASE TABLES =================
export const projectsTable = sqliteTable("projects", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    techStack: text("techStack").notNull().default("[]"), // JSON string array
    imageUrl: text("imageUrl").notNull(),
    githubUrl: text("githubUrl"),
    liveUrl: text("liveUrl"),
    category: text("category").notNull(),
    problemStatement: text("problemStatement"),
    motivation: text("motivation"),
    systemDesign: text("systemDesign"),
    challenges: text("challenges"),
    learnings: text("learnings"),
});
export const skillsTable = sqliteTable("skills", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    category: text("category").notNull(),
    icon: text("icon").notNull().default("Code"),
});
export const experiencesTable = sqliteTable("experiences", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    role: text("role").notNull(),
    organization: text("organization").notNull(),
    period: text("period").notNull(),
    description: text("description").notNull(),
    type: text("type").notNull().default("Experience"),
});
export const messagesTable = sqliteTable("messages", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull().default(""),
    message: text("message").notNull(),
    createdAt: text("createdAt")
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
function isValidUrl(url) {
    if (!url || url.trim() === "")
        return true; // Allow empty
    try {
        new URL(url);
        return true;
    }
    catch {
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
    email: z.string().email("Must be a valid email").max(255),
    subject: z.string().max(500).default(""),
    message: z.string().min(1, "Message is required").max(5000),
});
// ================= TYPE GUARDS =================
export function isProject(obj) {
    return projectSchema.safeParse(obj).success;
}
export function isSkill(obj) {
    return skillSchema.safeParse(obj).success;
}
export function isExperience(obj) {
    return experienceSchema.safeParse(obj).success;
}
export function isMessage(obj) {
    return messageSchema.safeParse(obj).success;
}
