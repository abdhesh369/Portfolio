
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"message" text NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

ALTER TABLE "experiences" ADD COLUMN "startDate" timestamp;--> statement-breakpoint
ALTER TABLE "experiences" ADD COLUMN "endDate" timestamp;--> statement-breakpoint

ALTER TABLE "projects" ADD COLUMN "viewCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_from_skill_id_skills_id_fk" FOREIGN KEY ("from_skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_to_skill_id_skills_id_fk" FOREIGN KEY ("to_skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;