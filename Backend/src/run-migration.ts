import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("Running missing migrations...");
    const queries = `
      CREATE TABLE IF NOT EXISTS "comments" (
        "id" serial PRIMARY KEY NOT NULL,
        "article_id" integer NOT NULL,
        "name" varchar(100) NOT NULL,
        "message" text NOT NULL,
        "is_approved" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "site_settings" (
        "key" varchar(100) PRIMARY KEY NOT NULL,
        "value" text NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "guestbook" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "content" text NOT NULL,
        "email" varchar(255),
        "isApproved" boolean DEFAULT false NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      );

      ALTER TABLE "experiences" ADD COLUMN IF NOT EXISTS "startDate" timestamp;
      ALTER TABLE "experiences" ADD COLUMN IF NOT EXISTS "endDate" timestamp;
      ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "viewCount" integer DEFAULT 0 NOT NULL;
      ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "featuredImageAlt" text;
    `;
    await client.query(queries);
    console.log("Tables and columns created/verified.");

    // Adding constraints carefully. They might throw if they exist and IF NOT EXISTS is not supported for adding constraints in older PG,
    // but we can try catching the specific error or use a DO block.
    const constraintQueries = `
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'skill_connections_from_skill_id_skills_id_fk') THEN
              TRUNCATE TABLE "skill_connections";
              ALTER TABLE "skill_connections" ALTER COLUMN "from_skill_id" TYPE integer USING "from_skill_id"::integer;
              ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_from_skill_id_skills_id_fk" FOREIGN KEY ("from_skill_id") REFERENCES "skills"("id") ON DELETE cascade;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'skill_connections_to_skill_id_skills_id_fk') THEN
              TRUNCATE TABLE "skill_connections";
              ALTER TABLE "skill_connections" ALTER COLUMN "to_skill_id" TYPE integer USING "to_skill_id"::integer;
              ALTER TABLE "skill_connections" ADD CONSTRAINT "skill_connections_to_skill_id_skills_id_fk" FOREIGN KEY ("to_skill_id") REFERENCES "skills"("id") ON DELETE cascade;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'comments_article_id_articles_id_fk') THEN
              ALTER TABLE "comments" ADD CONSTRAINT "comments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE cascade;
          END IF;
      END $$;
    `;
    await client.query(constraintQueries);
    console.log("Constraints added/verified.");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
