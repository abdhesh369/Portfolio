CREATE TABLE IF NOT EXISTS "case_studies" (
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
CREATE TABLE IF NOT EXISTS "client_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"clientProjectId" integer NOT NULL,
	"clientId" integer NOT NULL,
	"message" text NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "client_projects" (
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
CREATE TABLE IF NOT EXISTS "clients" (
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
CREATE TABLE IF NOT EXISTS "code_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"content" text NOT NULL,
	"badges" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"error" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint


CREATE TABLE IF NOT EXISTS "whiteboard_sessions" (
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
DROP TABLE IF EXISTS "comments" CASCADE;
--> statement-breakpoint
ALTER TABLE "skill_connections" DROP CONSTRAINT IF EXISTS "skill_connections_from_skill_id_skills_id_fk";
--> statement-breakpoint
ALTER TABLE "skill_connections" DROP CONSTRAINT IF EXISTS "skill_connections_to_skill_id_skills_id_fk";

--> statement-breakpoint
ALTER TABLE "experiences" ALTER COLUMN "period" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "experiences" ALTER COLUMN "startDate" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "experiences" ALTER COLUMN "startDate" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "projectType" varchar(100);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "budget" varchar(100);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "timeline" varchar(100);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "isHidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint

ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "mastery" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'case_studies_projectId_projects_id_fk') THEN
        ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'client_feedback_clientProjectId_client_projects_id_fk') THEN
        ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_clientProjectId_client_projects_id_fk" FOREIGN KEY ("clientProjectId") REFERENCES "public"."client_projects"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'client_feedback_clientId_clients_id_fk') THEN
        ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'client_projects_clientId_clients_id_fk') THEN
        ALTER TABLE "client_projects" ADD CONSTRAINT "client_projects_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'code_reviews_projectId_projects_id_fk') THEN
        ALTER TABLE "code_reviews" ADD CONSTRAINT "code_reviews_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'analytics_targetId_projects_id_fk') THEN
        ALTER TABLE "analytics" ADD CONSTRAINT "analytics_targetId_projects_id_fk" FOREIGN KEY ("targetId") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'skill_connections_from_skill_id_skills_id_fk') THEN
        ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_from_skill_id_skills_id_fk" FOREIGN KEY ("from_skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'skill_connections_to_skill_id_skills_id_fk') THEN
        ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_to_skill_id_skills_id_fk" FOREIGN KEY ("to_skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint
