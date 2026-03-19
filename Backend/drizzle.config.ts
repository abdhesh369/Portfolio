import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
console.warn(`[Drizzle Config] Loading environment from: ${envFile}`);
dotenv.config({ path: envFile, override: true });

export default defineConfig({
  out: "./drizzle/migrations",              // where migration files will be generated
  schema: "../packages/shared/src/schema.ts",             // single source of truth
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
