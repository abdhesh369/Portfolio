CREATE TABLE "case_studies" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"generatedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "case_studies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "client_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"clientProjectId" integer NOT NULL,
	"clientId" integer NOT NULL,
	"message" text NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"clientId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'not_started' NOT NULL,
	"deadline" timestamp,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"company" varchar(255),
	"token" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clients_email_unique" UNIQUE("email"),
	CONSTRAINT "clients_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "code_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"content" text NOT NULL,
	"badges" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"error" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guestbook" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"email" varchar(255),
	"isApproved" boolean DEFAULT false NOT NULL,
	"reactions" jsonb DEFAULT '{}'::jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scope_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"projectType" varchar(100),
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"estimation" jsonb,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"error" text,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whiteboard_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) DEFAULT 'Untitled Session' NOT NULL,
	"canvasData" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"createdBy" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "comments" CASCADE;--> statement-breakpoint
ALTER TABLE "skill_connections" DROP CONSTRAINT "skill_connections_from_skill_id_skills_id_fk";
--> statement-breakpoint
ALTER TABLE "skill_connections" DROP CONSTRAINT "skill_connections_to_skill_id_skills_id_fk";
--> statement-breakpoint
ALTER TABLE "experiences" ALTER COLUMN "period" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "experiences" ALTER COLUMN "startDate" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "experiences" ALTER COLUMN "startDate" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "projectType" varchar(100);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "budget" varchar(100);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "timeline" varchar(100);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "isHidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "isOpenToWork" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "personalName" varchar(255) DEFAULT 'Your Name';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "personalTitle" varchar(255) DEFAULT 'Full Stack Developer';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "personalBio" text DEFAULT 'Passionate about building amazing products';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "personalAvatar" varchar(500);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "socialGithub" varchar(500);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "socialLinkedin" varchar(500);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "socialTwitter" varchar(500);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "socialInstagram" varchar(500);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "socialFacebook" varchar(500);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "socialYoutube" varchar(500);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "socialDiscord" varchar(500);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "socialStackoverflow" varchar(500);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "socialDevto" varchar(500);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "socialMedium" varchar(500);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "socialEmail" varchar(255);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "heroGreeting" varchar(255) DEFAULT 'Hey, I am';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "heroBadgeText" varchar(255) DEFAULT 'Available for work';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "heroTaglines" jsonb DEFAULT '["Building amazing products","Solving complex problems"]'::jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "heroCtaPrimary" varchar(255) DEFAULT 'View My Work';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "heroCtaPrimaryUrl" varchar(500) DEFAULT '#projects';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "heroCtaSecondary" varchar(255) DEFAULT 'Get In Touch';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "heroCtaSecondaryUrl" varchar(500) DEFAULT '#contact';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "colorBackground" varchar(50) DEFAULT 'hsl(224, 71%, 4%)';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "colorSurface" varchar(50) DEFAULT 'hsl(224, 71%, 10%)';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "colorPrimary" varchar(50) DEFAULT 'hsl(263.4, 70%, 50.4%)';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "colorSecondary" varchar(50) DEFAULT 'hsl(215.4, 16.3%, 46.9%)';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "colorAccent" varchar(50) DEFAULT 'hsl(263.4, 70%, 50.4%)';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "colorBorder" varchar(50) DEFAULT 'hsl(214.3, 31.8%, 91.4%)';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "colorText" varchar(50) DEFAULT 'hsl(222.2, 84%, 95%)';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "colorMuted" varchar(50) DEFAULT 'hsl(215.4, 16.3%, 46.9%)';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "fontDisplay" varchar(255) DEFAULT 'Inter';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "fontBody" varchar(255) DEFAULT 'Inter';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "customCss" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "navbarLinks" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "footerCopyright" varchar(255) DEFAULT '© 2024 Your Name. All rights reserved.';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "footerTagline" varchar(500) DEFAULT 'Building the future, one line of code at a time.';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "sectionOrder" jsonb DEFAULT '["hero","about","skills","whyhireme","services","mindset","projects","practice","experience","testimonials","guestbook","contact"]'::jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "sectionVisibility" jsonb DEFAULT '{"hero":true,"about":true,"projects":true,"skills":true,"whyhireme":true,"services":true,"mindset":true,"practice":true,"experience":true,"testimonials":true,"guestbook":true,"contact":true}'::jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "availabilitySlots" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "featureBlog" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "featureGuestbook" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "featureTestimonials" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "featureServices" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "featurePlayground" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "mastery" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_clientProjectId_client_projects_id_fk" FOREIGN KEY ("clientProjectId") REFERENCES "public"."client_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_projects" ADD CONSTRAINT "client_projects_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_reviews" ADD CONSTRAINT "code_reviews_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_targetId_projects_id_fk" FOREIGN KEY ("targetId") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_from_skill_id_skills_id_fk" FOREIGN KEY ("from_skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_to_skill_id_skills_id_fk" FOREIGN KEY ("to_skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "key";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "value";