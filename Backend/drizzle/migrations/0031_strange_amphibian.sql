CREATE TABLE IF NOT EXISTS "chat_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(255) NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reading_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"url" varchar(500) NOT NULL,
	"note" text,
	"type" varchar(50) DEFAULT 'article' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"source" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='oldValues') THEN ALTER TABLE "audit_log" RENAME COLUMN "oldValues" TO "old_values"; END IF; END $$;--> statement-breakpoint
ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "clients_token_unique";--> statement-breakpoint
ALTER TABLE "skill_connections" DROP CONSTRAINT IF EXISTS "skill_connections_fromSkillId_skills_id_fk";
--> statement-breakpoint
ALTER TABLE "skill_connections" DROP CONSTRAINT IF EXISTS "skill_connections_toSkillId_skills_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "audit_log_created_at_idx";--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='analytics' AND column_name='referral') THEN ALTER TABLE "analytics" ADD COLUMN "referral" varchar(255); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='reactions') THEN ALTER TABLE "articles" ADD COLUMN "reactions" jsonb DEFAULT '{}'::jsonb NOT NULL; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='search_vector') THEN ALTER TABLE "articles" ADD COLUMN "search_vector" "tsvector"; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='entity_id') THEN ALTER TABLE "audit_log" ADD COLUMN "entity_id" integer; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='user_id') THEN ALTER TABLE "audit_log" ADD COLUMN "user_id" integer; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='performed_by') THEN ALTER TABLE "audit_log" ADD COLUMN "performed_by" varchar(255); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='ip_address') THEN ALTER TABLE "audit_log" ADD COLUMN "ip_address" varchar(45); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='new_values') THEN ALTER TABLE "audit_log" ADD COLUMN "new_values" jsonb; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='created_at') THEN ALTER TABLE "audit_log" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='client_feedback' AND column_name='isAdmin') THEN ALTER TABLE "client_feedback" ADD COLUMN "isAdmin" boolean DEFAULT false NOT NULL; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='tokenHash') THEN ALTER TABLE "clients" ADD COLUMN "tokenHash" varchar(255); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='healthCheckUrl') THEN ALTER TABLE "projects" ADD COLUMN "healthCheckUrl" varchar(500); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='summary') THEN ALTER TABLE "projects" ADD COLUMN "summary" text; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_settings' AND column_name='twitter_card') THEN ALTER TABLE "seo_settings" ADD COLUMN "twitter_card" varchar(50) DEFAULT 'summary_large_image'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='priceMin') THEN ALTER TABLE "services" ADD COLUMN "priceMin" integer; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='priceMax') THEN ALTER TABLE "services" ADD COLUMN "priceMax" integer; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='ctaUrl') THEN ALTER TABLE "services" ADD COLUMN "ctaUrl" varchar(500); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='availabilityStatus') THEN ALTER TABLE "site_settings" ADD COLUMN "availabilityStatus" varchar(255); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='aboutAvailability') THEN ALTER TABLE "site_settings" ADD COLUMN "aboutAvailability" varchar(255) DEFAULT 'Open to Work'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='aboutDescription') THEN ALTER TABLE "site_settings" ADD COLUMN "aboutDescription" text DEFAULT 'Building scalable web systems and analyzing complex algorithms.'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='aboutTechStack') THEN ALTER TABLE "site_settings" ADD COLUMN "aboutTechStack" jsonb DEFAULT '["React","Node.js","TypeScript","PostgreSQL","Tailwind"]'::jsonb; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='aboutTimeline') THEN ALTER TABLE "site_settings" ADD COLUMN "aboutTimeline" jsonb DEFAULT '[{"year":"2024 - Present","title":"Advanced System Design","description":"Deep diving into distributed systems, Docker, and Microservices architecture."},{"year":"2023","title":"Engineering Core","description":"Mastering Data Structures, Algorithms, and OOP at Tribhuvan University."},{"year":"2022","title":"Hello World","description":"Started the journey with Python scripting and basic web development."}]'::jsonb; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='aboutInfoCards') THEN ALTER TABLE "site_settings" ADD COLUMN "aboutInfoCards" jsonb DEFAULT '[{"icon":"GraduationCap","label":"Status","value":"B.E. Student"},{"icon":"Code","label":"Focus Area","value":"Full Stack System Design","color":"purple"},{"icon":"Cpu","label":"Hardware","value":"Electronics & Comms","color":"purple"},{"icon":"Target","label":"Goal","value":"Software Engineer"}]'::jsonb; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='personalPhone') THEN ALTER TABLE "site_settings" ADD COLUMN "personalPhone" varchar(255); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='chatbotGreeting') THEN ALTER TABLE "site_settings" ADD COLUMN "chatbotGreeting" text DEFAULT 'Hi there! I''m Abdhesh''s AI assistant. How can I help you today?'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='blogHeading') THEN ALTER TABLE "site_settings" ADD COLUMN "blogHeading" varchar(255) DEFAULT 'Blog'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='aboutHeading') THEN ALTER TABLE "site_settings" ADD COLUMN "aboutHeading" varchar(255) DEFAULT 'About Me'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='projectsHeading') THEN ALTER TABLE "site_settings" ADD COLUMN "projectsHeading" varchar(255) DEFAULT 'Flagship Projects'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='skillsHeading') THEN ALTER TABLE "site_settings" ADD COLUMN "skillsHeading" varchar(255) DEFAULT 'Technical Arsenal'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='whyHireMeHeading') THEN ALTER TABLE "site_settings" ADD COLUMN "whyHireMeHeading" varchar(255) DEFAULT 'Why Hire Me'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='servicesHeading') THEN ALTER TABLE "site_settings" ADD COLUMN "servicesHeading" varchar(255) DEFAULT 'What I Do'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='mindsetHeading') THEN ALTER TABLE "site_settings" ADD COLUMN "mindsetHeading" varchar(255) DEFAULT 'Engineering Mindset'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='practiceHeading') THEN ALTER TABLE "site_settings" ADD COLUMN "practiceHeading" varchar(255) DEFAULT 'Disciplined Practice'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='experienceHeading') THEN ALTER TABLE "site_settings" ADD COLUMN "experienceHeading" varchar(255) DEFAULT 'Professional Journey'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='testimonialsHeading') THEN ALTER TABLE "site_settings" ADD COLUMN "testimonialsHeading" varchar(255) DEFAULT 'Client Feedback'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='guestbookHeading') THEN ALTER TABLE "site_settings" ADD COLUMN "guestbookHeading" varchar(255) DEFAULT 'Guestbook'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='contactHeading') THEN ALTER TABLE "site_settings" ADD COLUMN "contactHeading" varchar(255) DEFAULT 'Get In Touch'; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='skills' AND column_name='endorsements') THEN ALTER TABLE "skills" ADD COLUMN "endorsements" integer DEFAULT 0 NOT NULL; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='audit_log_user_id_users_id_fk') THEN ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='skill_connections_fromSkillId_skills_id_fk') THEN ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_fromSkillId_skills_id_fk" FOREIGN KEY ("fromSkillId") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='skill_connections_toSkillId_skills_id_fk') THEN ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_toSkillId_skills_id_fk" FOREIGN KEY ("toSkillId") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='audit_log' AND indexname='audit_log_user_id_idx') THEN CREATE INDEX "audit_log_user_id_idx" ON "audit_log" USING btree ("user_id"); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='clients' AND indexname='clients_token_hash_idx') THEN CREATE INDEX "clients_token_hash_idx" ON "clients" USING btree ("tokenHash"); END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='audit_log' AND indexname='audit_log_created_at_idx') THEN CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at"); END IF; END $$;--> statement-breakpoint
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_log' AND column_name='entityId') THEN
        UPDATE "audit_log" SET 
            "entity_id" = COALESCE("entity_id", "entityId"), 
            "new_values" = COALESCE("new_values", "newValues"), 
            "created_at" = COALESCE("created_at", "createdAt");
    END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "audit_log" DROP COLUMN IF EXISTS "entityId";--> statement-breakpoint
ALTER TABLE "audit_log" DROP COLUMN IF EXISTS "newValues";--> statement-breakpoint
ALTER TABLE "audit_log" DROP COLUMN IF EXISTS "createdAt";
--> statement-breakpoint
ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "clients_tokenHash_unique";--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_tokenHash_unique" UNIQUE("tokenHash");