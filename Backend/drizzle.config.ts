import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: envFile, override: true });

export default defineConfig({
  schema: "../packages/shared/src/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'drizzle',
  },
  verbose: true,
  strict: true,
});
