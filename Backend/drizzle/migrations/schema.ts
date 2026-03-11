import { pgTable, serial, varchar, text, timestamp, jsonb, unique, boolean, index, integer, foreignKey, real, customType } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
const tsvector = customType<{ data: string }>({
	dataType() {
		return 'tsvector';
	},
});



export const emailTemplates = pgTable("email_templates", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	subject: varchar({ length: 500 }).notNull(),
	body: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const mindset = pgTable("mindset", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	icon: varchar({ length: 100 }).default('Brain').notNull(),
	tags: jsonb().notNull(),
});

export const seoSettings = pgTable("seo_settings", {
	id: serial().primaryKey().notNull(),
	pageSlug: varchar("page_slug", { length: 100 }).notNull(),
	metaTitle: varchar("meta_title", { length: 60 }).notNull(),
	metaDescription: text("meta_description").notNull(),
	ogTitle: varchar("og_title", { length: 255 }),
	ogDescription: text("og_description"),
	ogImage: varchar("og_image", { length: 500 }),
	keywords: text(),
	canonicalUrl: varchar("canonical_url", { length: 500 }),
	noindex: boolean().default(false),
	twitterCard: varchar("twitter_card", { length: 50 }).default('summary_large_image'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("seo_settings_page_slug_unique").on(table.pageSlug),
]);

export const services = pgTable("services", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	summary: text().notNull(),
	category: varchar({ length: 100 }).notNull(),
	tags: jsonb().notNull(),
	displayOrder: integer().default(0).notNull(),
	isFeatured: boolean().default(false).notNull(),
}, (table) => [
	index("services_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("services_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
]);

export const articleTags = pgTable("article_tags", {
	id: serial().primaryKey().notNull(),
	articleId: integer().notNull(),
	tag: varchar({ length: 100 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.articleId],
			foreignColumns: [articles.id],
			name: "article_tags_articleId_articles_id_fk"
		}).onDelete("cascade"),
]);

export const testimonials = pgTable("testimonials", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 255 }).notNull(),
	company: varchar({ length: 255 }).default('').notNull(),
	quote: text().notNull(),
	relationship: varchar({ length: 100 }).default('Colleague').notNull(),
	avatarUrl: varchar({ length: 500 }),
	displayOrder: integer().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	linkedinUrl: varchar({ length: 500 }),
}, (table) => [
	index("testimonials_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
]);

export const auditLog = pgTable("audit_log", {
	id: serial().primaryKey().notNull(),
	action: varchar({ length: 20 }).notNull(),
	entity: varchar({ length: 50 }).notNull(),
	entityId: integer("entity_id"),
	oldValues: jsonb("old_values"),
	newValues: jsonb("new_values"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("audit_log_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("audit_log_entity_idx").using("btree", table.entity.asc().nullsLast().op("text_ops")),
]);

export const articles = pgTable("articles", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	excerpt: text(),
	featuredImage: varchar({ length: 500 }),
	status: varchar({ length: 50 }).default('draft').notNull(),
	publishedAt: timestamp({ mode: 'string' }),
	viewCount: integer().default(0).notNull(),
	readTimeMinutes: integer().default(0).notNull(),
	metaTitle: varchar({ length: 255 }),
	metaDescription: text(),
	authorId: integer(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	// TODO: failed to parse database type 'tsvector'
	searchVector: tsvector("search_vector").generatedAlwaysAs(sql`to_tsvector('english'::regconfig, (((((COALESCE(title, ''::character varying))::text || ' '::text) || COALESCE(excerpt, ''::text)) || ' '::text) || COALESCE(content, ''::text)))`),
	featuredImageAlt: text(),
}, (table) => [
	index("articles_search_idx").using("gin", table.searchVector.asc().nullsLast().op("tsvector_ops")),
	index("articles_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("articles_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	unique("articles_slug_unique").on(table.slug),
]);

export const experiences = pgTable("experiences", {
	id: serial().primaryKey().notNull(),
	role: varchar({ length: 200 }).notNull(),
	organization: varchar({ length: 200 }).notNull(),
	period: varchar({ length: 100 }),
	description: text().notNull(),
	type: varchar({ length: 100 }).default('Experience').notNull(),
	startDate: timestamp({ mode: 'string' }).defaultNow().notNull(),
	endDate: timestamp({ mode: 'string' }),
});

export const guestbook = pgTable("guestbook", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	email: varchar({ length: 255 }),
	isApproved: boolean().default(false).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	reactions: jsonb().default({}),
});

export const skillConnections = pgTable("skill_connections", {
	id: serial().primaryKey().notNull(),
	fromSkillId: integer("from_skill_id").notNull(),
	toSkillId: integer("to_skill_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fromSkillId],
			foreignColumns: [skills.id],
			name: "skill_connections_from_skill_id_skills_id_fk"
		}),
	foreignKey({
			columns: [table.toSkillId],
			foreignColumns: [skills.id],
			name: "skill_connections_to_skill_id_skills_id_fk"
		}),
]);

export const siteSettings = pgTable("site_settings", {
	id: serial().primaryKey().notNull(),
	isOpenToWork: boolean().default(true).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	personalName: varchar({ length: 255 }).default('Your Name'),
	personalTitle: varchar({ length: 255 }).default('Full Stack Developer'),
	personalBio: text().default('Passionate about building amazing products'),
	personalAvatar: varchar({ length: 500 }),
	socialGithub: varchar({ length: 500 }),
	socialLinkedin: varchar({ length: 500 }),
	socialTwitter: varchar({ length: 500 }),
	socialInstagram: varchar({ length: 500 }),
	socialFacebook: varchar({ length: 500 }),
	socialYoutube: varchar({ length: 500 }),
	socialDiscord: varchar({ length: 500 }),
	socialStackoverflow: varchar({ length: 500 }),
	socialDevto: varchar({ length: 500 }),
	socialMedium: varchar({ length: 500 }),
	socialEmail: varchar({ length: 255 }),
	heroGreeting: varchar({ length: 255 }).default('Hey, I am'),
	heroBadgeText: varchar({ length: 255 }).default('Available for work'),
	heroTaglines: jsonb().default(["Building amazing products","Solving complex problems"]),
	heroCtaPrimary: varchar({ length: 255 }).default('View My Work'),
	heroCtaPrimaryUrl: varchar({ length: 500 }).default('#projects'),
	heroCtaSecondary: varchar({ length: 255 }).default('Get In Touch'),
	heroCtaSecondaryUrl: varchar({ length: 500 }).default('#contact'),
	colorBackground: varchar({ length: 50 }).default('hsl(224, 71%, 4%)'),
	colorSurface: varchar({ length: 50 }).default('hsl(224, 71%, 10%)'),
	colorPrimary: varchar({ length: 50 }).default('hsl(263.4, 70%, 50.4%)'),
	colorSecondary: varchar({ length: 50 }).default('hsl(215.4, 16.3%, 46.9%)'),
	colorAccent: varchar({ length: 50 }).default('hsl(263.4, 70%, 50.4%)'),
	colorBorder: varchar({ length: 50 }).default('hsl(214.3, 31.8%, 91.4%)'),
	colorText: varchar({ length: 50 }).default('hsl(222.2, 84%, 4.9%)'),
	colorMuted: varchar({ length: 50 }).default('hsl(215.4, 16.3%, 46.9%)'),
	fontDisplay: varchar({ length: 255 }).default('Inter'),
	fontBody: varchar({ length: 255 }).default('Inter'),
	customCss: text(),
	navbarLinks: jsonb().default([]),
	footerCopyright: varchar({ length: 255 }).default('© 2024 Your Name. All rights reserved.'),
	footerTagline: varchar({ length: 500 }).default('Building the future, one line of code at a time.'),
	sectionOrder: jsonb().default(["hero","about","projects","skills","testimonials","contact"]),
	sectionVisibility: jsonb().default({"hero":true,"about":true,"skills":true,"contact":true,"projects":true,"testimonials":true}),
	featureBlog: boolean().default(true),
	featureGuestbook: boolean().default(true),
	featureTestimonials: boolean().default(true),
	featureServices: boolean().default(true),
	featurePlayground: boolean().default(false),
	availabilitySlots: jsonb().default([]),
	locationText: varchar({ length: 255 }).default('Kathmandu, Nepal'),
	logoText: varchar({ length: 255 }).default('Portfolio.Dev'),
	heroHeadingLine1: varchar({ length: 255 }).default('Start building'),
	heroHeadingLine2: varchar({ length: 255 }).default('The Future'),
});

export const scopeRequests = pgTable("scope_requests", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	projectType: varchar({ length: 100 }),
	features: jsonb().default([]).notNull(),
	estimation: jsonb(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	error: text(),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const sketchpadSessions = pgTable("sketchpad_sessions", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).default('Untitled Session').notNull(),
	canvasData: jsonb().default({}),
	status: varchar({ length: 50 }).default('active').notNull(),
	createdBy: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	subject: varchar({ length: 500 }).default('').notNull(),
	message: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	projectType: varchar({ length: 100 }),
	budget: varchar({ length: 100 }),
	timeline: varchar({ length: 100 }),
});

export const skills = pgTable("skills", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	category: varchar({ length: 100 }).notNull(),
	status: varchar({ length: 100 }).default('Core').notNull(),
	icon: varchar({ length: 100 }).default('Code').notNull(),
	description: text().default('').notNull(),
	proof: text().default('').notNull(),
	x: real().default(50).notNull(),
	y: real().default(50).notNull(),
	mastery: integer().default(0).notNull(),
});

export const projects = pgTable("projects", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	techStack: jsonb().notNull(),
	imageUrl: varchar({ length: 500 }).notNull(),
	githubUrl: varchar({ length: 500 }),
	liveUrl: varchar({ length: 500 }),
	category: varchar({ length: 100 }).notNull(),
	displayOrder: integer().default(0).notNull(),
	status: varchar({ length: 50 }).default('Completed').notNull(),
	problemStatement: text(),
	motivation: text(),
	systemDesign: text(),
	challenges: text(),
	learnings: text(),
	isFlagship: boolean().default(false).notNull(),
	impact: text(),
	role: text(),
	imageAlt: text(),
	viewCount: integer().default(0).notNull(),
	isHidden: boolean().default(false).notNull(),
}, (table) => [
	index("projects_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("projects_order_idx").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")),
]);

export const caseStudies = pgTable("case_studies", {
	id: serial().primaryKey().notNull(),
	projectId: integer().notNull(),
	title: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	status: varchar({ length: 50 }).default('draft').notNull(),
	generatedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "case_studies_projectId_projects_id_fk"
		}).onDelete("cascade"),
	unique("case_studies_slug_unique").on(table.slug),
]);

export const clientProjects = pgTable("client_projects", {
	id: serial().primaryKey().notNull(),
	clientId: integer().notNull(),
	title: varchar({ length: 255 }).notNull(),
	status: varchar({ length: 50 }).default('not_started').notNull(),
	deadline: timestamp({ mode: 'string' }),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_projects_clientId_clients_id_fk"
		}).onDelete("cascade"),
]);

export const clientFeedback = pgTable("client_feedback", {
	id: serial().primaryKey().notNull(),
	clientProjectId: integer().notNull(),
	clientId: integer().notNull(),
	message: text().notNull(),
	attachments: jsonb().default([]),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientProjectId],
			foreignColumns: [clientProjects.id],
			name: "client_feedback_clientProjectId_client_projects_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_feedback_clientId_clients_id_fk"
		}).onDelete("cascade"),
]);

export const clients = pgTable("clients", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	company: varchar({ length: 255 }),
	token: varchar({ length: 255 }).notNull(),
	status: varchar({ length: 50 }).default('active').notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("clients_email_unique").on(table.email),
	unique("clients_token_unique").on(table.token),
]);

export const codeReviews = pgTable("code_reviews", {
	id: serial().primaryKey().notNull(),
	projectId: integer().notNull(),
	content: text().notNull(),
	badges: jsonb().default([]).notNull(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	error: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "code_reviews_projectId_projects_id_fk"
		}).onDelete("cascade"),
]);

export const analytics = pgTable("analytics", {
	id: serial().primaryKey().notNull(),
	type: varchar({ length: 50 }).notNull(),
	targetId: integer(),
	path: varchar({ length: 500 }).notNull(),
	browser: varchar({ length: 100 }),
	os: varchar({ length: 100 }),
	device: varchar({ length: 50 }),
	country: varchar({ length: 100 }),
	city: varchar({ length: 100 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("analytics_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("analytics_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.targetId],
			foreignColumns: [projects.id],
			name: "analytics_targetId_projects_id_fk"
		}).onDelete("set null"),
]);
