CREATE TABLE "chat_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(255) NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"url" varchar(500) NOT NULL,
	"note" text,
	"type" varchar(50) DEFAULT 'article' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"source" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_log" RENAME COLUMN "oldValues" TO "old_values";--> statement-breakpoint
ALTER TABLE "clients" DROP CONSTRAINT "clients_token_unique";--> statement-breakpoint
ALTER TABLE "skill_connections" DROP CONSTRAINT "skill_connections_fromSkillId_skills_id_fk";
--> statement-breakpoint
ALTER TABLE "skill_connections" DROP CONSTRAINT "skill_connections_toSkillId_skills_id_fk";
--> statement-breakpoint
DROP INDEX "audit_log_created_at_idx";--> statement-breakpoint
ALTER TABLE "analytics" ADD COLUMN "referral" varchar(255);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "reactions" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "entity_id" integer;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "performed_by" varchar(255);--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "ip_address" varchar(45);--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "new_values" jsonb;--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD COLUMN "isAdmin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "tokenHash" varchar(255);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "healthCheckUrl" varchar(500);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "seo_settings" ADD COLUMN "twitter_card" varchar(50) DEFAULT 'summary_large_image';--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "priceMin" integer;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "priceMax" integer;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "ctaUrl" varchar(500);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "availabilityStatus" varchar(255);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "aboutAvailability" varchar(255) DEFAULT 'Open to Work';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "aboutDescription" text DEFAULT 'Building scalable web systems and analyzing complex algorithms.';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "aboutTechStack" jsonb DEFAULT '["React","Node.js","TypeScript","PostgreSQL","Tailwind"]'::jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "aboutTimeline" jsonb DEFAULT '[{"year":"2024 - Present","title":"Advanced System Design","description":"Deep diving into distributed systems, Docker, and Microservices architecture."},{"year":"2023","title":"Engineering Core","description":"Mastering Data Structures, Algorithms, and OOP at Tribhuvan University."},{"year":"2022","title":"Hello World","description":"Started the journey with Python scripting and basic web development."}]'::jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "aboutInfoCards" jsonb DEFAULT '[{"icon":"GraduationCap","label":"Status","value":"B.E. Student"},{"icon":"Code","label":"Focus Area","value":"Full Stack System Design","color":"purple"},{"icon":"Cpu","label":"Hardware","value":"Electronics & Comms","color":"purple"},{"icon":"Target","label":"Goal","value":"Software Engineer"}]'::jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "personalPhone" varchar(255);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "chatbotGreeting" text DEFAULT 'Hi there! I''m Abdhesh''s AI assistant. How can I help you today?';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "blogHeading" varchar(255) DEFAULT 'Blog';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "aboutHeading" varchar(255) DEFAULT 'About Me';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "projectsHeading" varchar(255) DEFAULT 'Flagship Projects';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "skillsHeading" varchar(255) DEFAULT 'Technical Arsenal';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "whyHireMeHeading" varchar(255) DEFAULT 'Why Hire Me';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "servicesHeading" varchar(255) DEFAULT 'What I Do';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "mindsetHeading" varchar(255) DEFAULT 'Engineering Mindset';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "practiceHeading" varchar(255) DEFAULT 'Disciplined Practice';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "experienceHeading" varchar(255) DEFAULT 'Professional Journey';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "testimonialsHeading" varchar(255) DEFAULT 'Client Feedback';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "guestbookHeading" varchar(255) DEFAULT 'Guestbook';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "contactHeading" varchar(255) DEFAULT 'Get In Touch';--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "endorsements" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_fromSkillId_skills_id_fk" FOREIGN KEY ("fromSkillId") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_toSkillId_skills_id_fk" FOREIGN KEY ("toSkillId") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_user_id_idx" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "clients_token_hash_idx" ON "clients" USING btree ("tokenHash");--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
UPDATE "audit_log" SET "entity_id" = "entityId", "new_values" = "newValues", "created_at" = COALESCE("createdAt", now());--> statement-breakpoint
ALTER TABLE "audit_log" DROP COLUMN "entityId";--> statement-breakpoint
ALTER TABLE "audit_log" DROP COLUMN "newValues";--> statement-breakpoint
ALTER TABLE "audit_log" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "token";--> statement-breakpoint
ALTER TABLE "seo_settings" DROP COLUMN "twitterCard";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "colorBackground";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "colorSurface";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "colorPrimary";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "colorSecondary";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "colorAccent";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "colorBorder";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "colorText";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "colorMuted";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "fontDisplay";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "fontBody";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "customCss";--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_tokenHash_unique" UNIQUE("tokenHash");