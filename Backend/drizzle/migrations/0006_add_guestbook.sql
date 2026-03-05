CREATE TABLE IF NOT EXISTS "guestbook" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"email" varchar(255),
	"isApproved" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
