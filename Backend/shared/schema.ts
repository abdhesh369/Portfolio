import { pgTable, text, integer, varchar, timestamp, jsonb, real, boolean, serial, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ================= DATABASE TABLES =================

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  techStack: jsonb("techStack").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  githubUrl: varchar("githubUrl", { length: 500 }),
  liveUrl: varchar("liveUrl", { length: 500 }),
  category: varchar("category", { length: 100 }).notNull(),
  displayOrder: integer("displayOrder").notNull().default(0),
  status: varchar("status", { length: 50 }).notNull().default("Completed"),
  problemStatement: text("problemStatement"),
  motivation: text("motivation"),
  systemDesign: text("systemDesign"),
  challenges: text("challenges"),
  learnings: text("learnings"),
  isFlagship: boolean("isFlagship").notNull().default(false),
  isHidden: boolean("isHidden").notNull().default(false),
  impact: text("impact"),
  role: text("role"),
  imageAlt: text("imageAlt"),
  viewCount: integer("viewCount").notNull().default(0),
}, (table) => {
  return {
    categoryIdx: index("projects_category_idx").on(table.category),
    orderIdx: index("projects_order_idx").on(table.displayOrder),
  };
});

export const skillsTable = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  status: varchar("status", { length: 100 }).notNull().default("Core"),
  icon: varchar("icon", { length: 100 }).notNull().default("Code"),
  description: text("description").notNull().default(""),
  proof: text("proof").notNull().default(""),
  x: real("x").notNull().default(50),
  y: real("y").notNull().default(50),
});

export const skillConnectionsTable = pgTable("skill_connections", {
  id: serial("id").primaryKey(),
  fromSkillId: integer("from_skill_id").notNull().references(() => skillsTable.id),
  toSkillId: integer("to_skill_id").notNull().references(() => skillsTable.id),
});

export const experiencesTable = pgTable("experiences", {
  id: serial("id").primaryKey(),
  role: varchar("role", { length: 200 }).notNull(),
  organization: varchar("organization", { length: 200 }).notNull(),
  period: varchar("period", { length: 100 }), // Deprecated in favor of start/end dates
  startDate: timestamp("startDate").notNull().defaultNow(),
  endDate: timestamp("endDate"), // Nullable for current roles
  description: text("description").notNull(),
  type: varchar("type", { length: 100 }).notNull().default("Experience"),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull().default(""),
  message: text("message").notNull(),
  projectType: varchar("projectType", { length: 100 }), // Optional for project inquiries
  budget: varchar("budget", { length: 100 }),
  timeline: varchar("timeline", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const mindsetTable = pgTable("mindset", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }).notNull().default("Brain"),
  tags: jsonb("tags").notNull(),
});

export const analyticsTable = pgTable("analytics", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // page_view, project_view, contact_form
  targetId: integer("targetId").references(() => projectsTable.id, { onDelete: "set null" }), // ID of project for project_view
  path: varchar("path", { length: 500 }).notNull(),
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  device: varchar("device", { length: 50 }), // mobile, desktop
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => {
  return {
    typeIdx: index("analytics_type_idx").on(table.type),
    createdIdx: index("analytics_created_at_idx").on(table.createdAt),
  };
});

export const guestbookTable = pgTable("guestbook", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  content: text("content").notNull(),
  email: varchar("email", { length: 255 }), // Optional
  isApproved: boolean("isApproved").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const emailTemplatesTable = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});


export const seoSettingsTable = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  pageSlug: varchar("page_slug", { length: 100 }).notNull().unique(),
  metaTitle: varchar("meta_title", { length: 60 }).notNull(),
  metaDescription: text("meta_description").notNull(),
  ogTitle: varchar("og_title", { length: 255 }),
  ogDescription: text("og_description"),
  ogImage: varchar("og_image", { length: 500 }),
  keywords: text("keywords"),
  canonicalUrl: varchar("canonical_url", { length: 500 }),
  noindex: boolean("noindex").default(false),
  twitterCard: varchar("twitter_card", { length: 50 }).default("summary_large_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // onUpdateNow is not directly supported in PG same way
});

export const articlesTable = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  featuredImage: varchar("featuredImage", { length: 500 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  publishedAt: timestamp("publishedAt"),
  viewCount: integer("viewCount").notNull().default(0),
  readTimeMinutes: integer("readTimeMinutes").notNull().default(0),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  authorId: integer("authorId"),
  featuredImageAlt: text("featuredImageAlt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => {
  return {
    statusIdx: index("articles_status_idx").on(table.status),
    slugIdx: index("articles_slug_idx").on(table.slug), // though unique, status filtering is common
  };
});

export const articleTagsTable = pgTable("article_tags", {
  id: serial("id").primaryKey(),
  articleId: integer("articleId").notNull().references(() => articlesTable.id, { onDelete: 'cascade' }),
  tag: varchar("tag", { length: 100 }).notNull(),
});

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  tags: jsonb("tags").notNull(),
  displayOrder: integer("displayOrder").notNull().default(0),
  isFeatured: boolean("isFeatured").notNull().default(false),
}, (table) => {
  return {
    categoryIdx: index("services_category_idx").on(table.category),
    orderIdx: index("services_order_idx").on(table.displayOrder),
  };
});

export const testimonialsTable = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull().default(""),
  quote: text("quote").notNull(),
  relationship: varchar("relationship", { length: 100 }).notNull().default("Colleague"),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  displayOrder: integer("displayOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => {
  return {
    orderIdx: index("testimonials_order_idx").on(table.displayOrder),
  };
});

export const auditLogTable = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  action: varchar("action", { length: 20 }).notNull(),
  entity: varchar("entity", { length: 50 }).notNull(),
  entityId: integer("entity_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    entityIdx: index("audit_log_entity_idx").on(table.entity),
    createdIdx: index("audit_log_created_at_idx").on(table.createdAt),
  };
});

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  isOpenToWork: boolean("isOpenToWork").notNull().default(true),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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

export const auditLogSchema = z.object({
  id: z.number(),
  action: z.enum(["CREATE", "UPDATE", "DELETE"]),
  entity: z.string().min(1).max(50),
  entityId: z.number().nullable().optional(),
  oldValues: z.record(z.unknown()).nullable().optional(),
  newValues: z.record(z.unknown()).nullable().optional(),
  createdAt: z.coerce.date(),
});

export const selectMindsetSchema = createSelectSchema(mindsetTable);
export const insertMindsetSchema = createInsertSchema(mindsetTable);

export const selectEmailTemplateSchema = createSelectSchema(emailTemplatesTable);
export const insertEmailTemplateSchema = createInsertSchema(emailTemplatesTable);

export const selectSeoSettingsSchema = createSelectSchema(seoSettingsTable);
export const insertSeoSettingsSchema = createInsertSchema(seoSettingsTable);

export const selectArticleSchema = createSelectSchema(articlesTable);
export const insertArticleSchema = createInsertSchema(articlesTable);

export const selectArticleTagSchema = createSelectSchema(articleTagsTable);
export const insertArticleTagSchema = createInsertSchema(articleTagsTable);

export const selectServiceSchema = createSelectSchema(servicesTable);
export const insertServiceSchema = createInsertSchema(servicesTable);

export const selectTestimonialSchema = createSelectSchema(testimonialsTable);
export const insertTestimonialSchema = createInsertSchema(testimonialsTable);

export const selectAuditLogSchema = createSelectSchema(auditLogTable);
export const insertAuditLogSchema = createInsertSchema(auditLogTable);

export const selectGuestbookSchema = createSelectSchema(guestbookTable);
export const insertGuestbookSchema = createInsertSchema(guestbookTable);

export const selectSiteSettingsSchema = createSelectSchema(siteSettingsTable);
export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable);

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
  isFlagship: z.boolean().default(false),
  isHidden: z.boolean().default(false),
  impact: z.string().max(5000).nullish(),
  role: z.string().max(5000).nullish(),
  imageAlt: z.string().max(500).nullish(),
  viewCount: z.number().default(0),
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
  isFlagship: z.boolean().default(false).optional(),
  isHidden: z.boolean().default(false).optional(),
  impact: z.string().max(5000).nullable().optional(),
  role: z.string().max(5000).nullable().optional(),
  imageAlt: z.string().max(500).nullable().optional(),
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
  fromSkillId: z.number(),
  toSkillId: z.number(),
});

export const mindsetSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(255),
  description: z.string().max(5000),
  icon: z.string().max(100),
  tags: z.array(z.string()).default([]),
});

export const insertMindsetApiSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).default(""),
  icon: z.string().max(100).default("Brain"),
  tags: z.array(z.string()).default([]),
});

export const experienceSchema = z.object({
  id: z.number(),
  role: z.string().min(1).max(200),
  organization: z.string().min(1).max(200),
  period: z.string().max(100).nullish(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullish(),
  description: z.string().min(1).max(5000),
  type: z.string().max(100),
});

export const serviceSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(255),
  summary: z.string().min(1).max(5000),
  category: z.string().min(1).max(100),
  tags: z.array(z.string()).default([]),
  displayOrder: z.number().default(0),
  isFeatured: z.boolean().default(false),
});

export const insertExperienceApiSchema = z.object({
  role: z.string().min(1).max(200),
  organization: z.string().min(1).max(200),
  period: z.string().max(100).nullable().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).nullable().optional(),
  description: z.string().min(1).max(5000),
  type: z.string().max(100).default("Experience"),
});

export const insertServiceApiSchema = z.object({
  title: z.string().min(1).max(255),
  summary: z.string().min(1).max(5000),
  category: z.string().min(1).max(100),
  tags: z.array(z.string()).default([]),
  displayOrder: z.number().default(0),
  isFeatured: z.boolean().default(false),
});

export const testimonialSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
  role: z.string().min(1).max(255),
  company: z.string().max(255),
  quote: z.string().min(1).max(5000),
  relationship: z.string().max(100),
  avatarUrl: z.string().max(500).nullable().optional(),
  linkedinUrl: z.string().url().max(500).nullable().optional(),
  displayOrder: z.number().default(0),
  createdAt: z.coerce.date(),
});

export const insertTestimonialApiSchema = z.object({
  name: z.string().min(1).max(255),
  role: z.string().min(1).max(255),
  company: z.string().max(255).default(""),
  quote: z.string().min(1).max(5000),
  relationship: z.string().max(100).default("Colleague"),
  avatarUrl: z.string().max(500).nullable().optional(),
  linkedinUrl: z.string().url().max(500).nullable().optional(),
  displayOrder: z.number().default(0),
});

export const messageSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  subject: z.string().max(500),
  message: z.string().min(1).max(5000),
  createdAt: z.coerce.date(),
});

export const insertMessageApiSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  subject: z.string().max(500).default(""),
  message: z.string().min(1).max(5000),
  projectType: z.string().max(100).optional(),
  budget: z.string().max(100).optional(),
  timeline: z.string().max(100).optional(),
  website: z.string().optional(), // Honeypot field for spam prevention
});

export const guestbookSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
  content: z.string().min(1).max(5000),
  email: z.string().email().max(255).nullish(),
  isApproved: z.boolean(),
  createdAt: z.coerce.date(),
});

export const insertGuestbookApiSchema = z.object({
  name: z.string().min(1).max(255),
  content: z.string().min(1).max(5000),
  email: z.string().email().max(255).nullish(),
});

export const ANALYTICS_EVENT_TYPES = ["page_view", "project_view", "contact_form", "resume_download", "vital"] as const;

export const analyticsSchema = z.object({
  id: z.number(),
  type: z.enum(ANALYTICS_EVENT_TYPES),
  targetId: z.number().nullable().optional(),
  path: z.string().max(500),
  browser: z.string().max(100).nullable().optional(),
  os: z.string().max(100).nullable().optional(),
  device: z.string().max(50).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  createdAt: z.coerce.date(),
});

export const insertAnalyticsSchema = z.object({
  type: z.enum(ANALYTICS_EVENT_TYPES),
  targetId: z.number().nullable().optional(),
  path: z.string().max(500),
  browser: z.string().max(100).nullable().optional(),
  os: z.string().max(100).nullable().optional(),
  device: z.string().max(50).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
});

export const emailTemplateSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
  createdAt: z.coerce.date(),
});

export const insertEmailTemplateApiSchema = z.object({
  name: z.string().min(1).max(255),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
});

export const seoSettingsSchema = z.object({
  id: z.number(),
  pageSlug: z.string().min(1).max(100),
  metaTitle: z.string().min(1).max(60),
  metaDescription: z.string().min(1).max(160),
  ogTitle: z.string().max(255).nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  ogImage: z.string().url().max(500).nullable().optional(),
  keywords: z.string().nullable().optional(),
  canonicalUrl: z.string().url().max(500).nullable().optional(),
  noindex: z.boolean().default(false),
  twitterCard: z.string().default("summary_large_image"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const insertSeoSettingsApiSchema = z.object({
  pageSlug: z.string().min(1).max(100),
  metaTitle: z.string().min(1).max(60),
  metaDescription: z.string().min(1).max(160),
  ogTitle: z.string().max(255).nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  ogImage: z.string().url().max(500).nullable().optional(),
  keywords: z.string().nullable().optional(),
  canonicalUrl: z.string().url().max(500).nullable().optional(),
  noindex: z.boolean().default(false),
  twitterCard: z.string().default("summary_large_image"),
});

export const siteSettingsSchema = z.object({
  id: z.number(),
  isOpenToWork: z.boolean(),
  updatedAt: z.coerce.date(),
});

export const insertSiteSettingsApiSchema = z.object({
  isOpenToWork: z.boolean().optional(),
});

export const articleSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().nullable().optional(),
  featuredImage: z.string().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]),
  publishedAt: z.coerce.date().nullable(),
  viewCount: z.number(),
  readTimeMinutes: z.number(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  authorId: z.number().nullable().optional(),
  featuredImageAlt: z.string().max(500).nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  tags: z.array(z.string()).optional(),
});

export const articleWithRelatedSchema = articleSchema.extend({
  relatedArticles: z.array(articleSchema).optional(),
});

export const insertArticleApiSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().max(255).optional(),
  content: z.string().min(1),
  excerpt: z.string().nullable().optional(),
  featuredImage: z.string().url().max(500).nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  publishedAt: z.string().nullable().optional(),
  readTimeMinutes: z.number().default(0),
  metaTitle: z.string().max(255).nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  featuredImageAlt: z.string().max(500).nullable().optional(),
});

export const updateArticleApiSchema = insertArticleApiSchema.partial();

// ================= TYPESCRIPT TYPES =================

export type Project = z.infer<typeof projectSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type SkillConnection = z.infer<typeof skillConnectionSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Mindset = z.infer<typeof mindsetSchema>;
export type Analytics = z.infer<typeof analyticsSchema>;
export type EmailTemplate = z.infer<typeof emailTemplateSchema>;
export type SeoSettings = z.infer<typeof seoSettingsSchema>;
export type Article = z.infer<typeof articleSchema>;
export type ArticleWithRelated = z.infer<typeof articleWithRelatedSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type InsertSkillConnection = { id?: number; fromSkillId: number; toSkillId: number; };

export type InsertProject = z.infer<typeof insertProjectApiSchema>;
export type InsertSkill = z.infer<typeof insertSkillApiSchema>;
export type InsertExperience = z.infer<typeof insertExperienceApiSchema>;
export type InsertService = z.infer<typeof insertServiceApiSchema>;
export type InsertMessage = z.infer<typeof insertMessageApiSchema>;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateApiSchema>;
export type InsertSeoSettings = z.infer<typeof insertSeoSettingsApiSchema>;
export type InsertMindset = z.infer<typeof insertMindsetApiSchema>;
export type InsertArticle = z.infer<typeof insertArticleApiSchema>;
export type InsertTestimonial = z.infer<typeof insertTestimonialApiSchema>;
export type GuestbookEntry = z.infer<typeof guestbookSchema>;
export type InsertGuestbookEntry = z.infer<typeof insertGuestbookApiSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsApiSchema>;

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
export function isEmailTemplate(obj: unknown): obj is EmailTemplate {
  return emailTemplateSchema.safeParse(obj).success;
}
export function isSeoSettings(obj: unknown): obj is SeoSettings {
  return seoSettingsSchema.safeParse(obj).success;
}
export function isTestimonial(obj: unknown): obj is Testimonial {
  return testimonialSchema.safeParse(obj).success;
}
export function isGuestbookEntry(obj: unknown): obj is GuestbookEntry {
  return guestbookSchema.safeParse(obj).success;
}
export function isAuditLog(obj: unknown): obj is AuditLog {
  return auditLogSchema.safeParse(obj).success;
}
