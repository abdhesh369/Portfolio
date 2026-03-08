CREATE TABLE IF NOT EXISTS "scope_requests" (
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
