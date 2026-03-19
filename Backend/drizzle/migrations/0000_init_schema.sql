CREATE TABLE IF NOT EXISTS "analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"targetId" integer,
	"path" varchar(500) NOT NULL,
	"browser" varchar(100),
	"os" varchar(100),
	"device" varchar(50),
	"country" varchar(100),
	"city" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "article_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"articleId" integer NOT NULL,
	"tag" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"featuredImage" varchar(500),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"publishedAt" timestamp,
	"viewCount" integer DEFAULT 0 NOT NULL,
	"readTimeMinutes" integer DEFAULT 0 NOT NULL,
	"metaTitle" varchar(255),
	"metaDescription" text,
	"authorId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"body" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" varchar(200) NOT NULL,
	"organization" varchar(200) NOT NULL,
	"period" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"type" varchar(100) DEFAULT 'Experience' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(500) DEFAULT '' NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mindset" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"icon" varchar(100) DEFAULT 'Brain' NOT NULL,
	"tags" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"techStack" jsonb NOT NULL,
	"imageUrl" varchar(500) NOT NULL,
	"githubUrl" varchar(500),
	"liveUrl" varchar(500),
	"category" varchar(100) NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"status" varchar(50) DEFAULT 'Completed' NOT NULL,
	"problemStatement" text,
	"motivation" text,
	"systemDesign" text,
	"challenges" text,
	"learnings" text,
	"isFlagship" boolean DEFAULT false NOT NULL,
	"impact" text,
	"role" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seo_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_slug" varchar(100) NOT NULL,
	"meta_title" varchar(60) NOT NULL,
	"meta_description" text NOT NULL,
	"og_title" varchar(255),
	"og_description" text,
	"og_image" varchar(500),
	"keywords" text,
	"canonical_url" varchar(500),
	"noindex" boolean DEFAULT false,
	"twitter_card" varchar(50) DEFAULT 'summary_large_image',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "seo_settings_page_slug_unique" UNIQUE("page_slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"tags" jsonb NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skill_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_skill_id" integer NOT NULL,
	"to_skill_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(100) NOT NULL,
	"status" varchar(100) DEFAULT 'Core' NOT NULL,
	"icon" varchar(100) DEFAULT 'Code' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"proof" text DEFAULT '' NOT NULL,
	"x" real DEFAULT 50 NOT NULL,
	"y" real DEFAULT 50 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"company" varchar(255) DEFAULT '' NOT NULL,
	"quote" text NOT NULL,
	"relationship" varchar(100) DEFAULT 'Colleague' NOT NULL,
	"avatarUrl" varchar(500),
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'article_tags_articleId_articles_id_fk') THEN
        ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_articleId_articles_id_fk" FOREIGN KEY ("articleId") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_type_idx" ON "analytics" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_created_at_idx" ON "analytics" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articles_status_idx" ON "articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articles_slug_idx" ON "articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_category_idx" ON "projects" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_order_idx" ON "projects" USING btree ("displayOrder");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "services_category_idx" ON "services" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "services_order_idx" ON "services" USING btree ("displayOrder");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testimonials_order_idx" ON "testimonials" USING btree ("displayOrder");
