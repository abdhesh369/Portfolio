ALTER TABLE "projects" ADD COLUMN "slug" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "longDescription" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");