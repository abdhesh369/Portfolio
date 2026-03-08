import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In production (e.g. Render), env vars come from the platform — .env files are gitignored.
// Only load .env files if they exist on disk (local development).
const rootDir = process.cwd();
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
const envPath = path.join(rootDir, envFile);

if (fs.existsSync(envPath)) {
    console.log(`[ENV] Loading variables from: ${envPath}`);
    dotenv.config({ path: envPath });
} else {
    // Try fallback .env in root
    const fallback = path.join(rootDir, ".env");
    if (fs.existsSync(fallback)) {
        console.log(`[ENV] Loading variables from fallback: ${fallback}`);
        dotenv.config({ path: fallback });
    } else {
        console.warn("[ENV] No .env file found in root. Relying on platform environment variables.");
    }
}

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().transform(Number).default("5000"),
    DATABASE_URL: z.string().url("Valid DATABASE_URL is required"),
    RESEND_API_KEY: z.string().optional(),
    REDIS_URL: z.string().optional(),
    FRONTEND_URL: z.string().optional(),
    JWT_SECRET: z.string().min(64, "JWT_SECRET must be at least 64 characters"),
    JWT_REFRESH_SECRET: z.string().min(64, "JWT_REFRESH_SECRET must be at least 64 characters"),
    ADMIN_PASSWORD: z.string().min(16, "ADMIN_PASSWORD must be at least 16 characters"),
    ADMIN_EMAIL: z.string().email(),
    CONTACT_EMAIL: z.string().email(),
    GEMINI_API_KEY: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
    SENTRY_DSN: z.string().optional(),
    SENTRY_ENVIRONMENT: z.string().optional(),
    RENDER_DEPLOY_HOOK_URL: z.string().url().optional(),
    GITHUB_USERNAME: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
    try {
        const parsed = envSchema.parse(process.env);

        if (parsed.NODE_ENV === "production") {
            if (!parsed.RESEND_API_KEY) {
                console.warn("⚠️  [ENV] RESEND_API_KEY not set. Email sending will fail in production.");
            }
        }

        return parsed;
    } catch (err) {
        if (err instanceof z.ZodError) {
            const missing = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
            console.error(`❌ [ENV] Environment validation failed: ${missing}`);
            console.error("💡 Please check your .env file and ensure all required variables are set correctly.");
            process.exit(1);
        }
        throw err;
    }
}

// Export a singleton validated env object
export const env = validateEnv();
