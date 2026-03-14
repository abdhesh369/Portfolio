CREATE TABLE "chat_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" varchar(255) NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
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
ALTER TABLE "client_feedback" ADD COLUMN "isAdmin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "priceMin" integer;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "priceMax" integer;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "ctaUrl" varchar(500);