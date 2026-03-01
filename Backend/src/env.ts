import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === "production" ? "../.env.production" : "../.env";
dotenv.config({ path: path.resolve(__dirname, envFile) });

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().transform(Number).default("5000"),
    DATABASE_URL: z.string().url("Valid DATABASE_URL is required"),
    RESEND_API_KEY: z.string().optional(),
    FRONTEND_URL: z.string().optional(),
    ADMIN_API_KEY: z.string().min(32, "ADMIN_API_KEY must be at least 32 characters"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters"),
    ADMIN_EMAIL: z.string().email().default("abdheshshah111@gmail.com"),
    CONTACT_EMAIL: z.string().email().default("contact@abdheshsah.com.np"),
    GEMINI_API_KEY: z.string().optional(),
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
