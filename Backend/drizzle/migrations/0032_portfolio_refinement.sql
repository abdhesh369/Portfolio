ALTER TABLE "audit_log" ADD COLUMN "user_agent" varchar(500);--> statement-breakpoint
ALTER TABLE "audit_log" ADD COLUMN "request_id" varchar(255);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "retentionDate" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "expiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "consentStatus" varchar(50) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "consentGiven" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "passwordHash" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar(50) DEFAULT 'viewer';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "permissions" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" varchar(50) DEFAULT 'active';--> statement-breakpoint
UPDATE "articles" SET "authorId" = NULL WHERE "authorId" NOT IN (SELECT id FROM "public"."users");--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;