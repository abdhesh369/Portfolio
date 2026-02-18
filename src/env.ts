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
    DATABASE_URL: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    FRONTEND_URL: z.string().optional(),
    ADMIN_API_KEY: z.string().optional().default("abdhesh-portfolio-secure-key-2026"),
    JWT_SECRET: z.string().min(10).default("super-secret-jwt-key-for-portfolio-2026"),
    ADMIN_PASSWORD: z.string().min(1).default("admin123"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
    try {
        const parsed = envSchema.parse(process.env);

        if (!parsed.DATABASE_URL) {
            console.warn("⚠️  [ENV] DATABASE_URL not set. Database connection will fail.");
        }

        if (!parsed.RESEND_API_KEY) {
            console.warn("⚠️  [ENV] RESEND_API_KEY not set. Email sending will be skipped.");
        }

        return parsed;
    } catch (err) {
        if (err instanceof z.ZodError) {
            const missing = err.errors.map((e) => e.path.join(".")).join(", ");
            console.error(`❌ [ENV] Invalid environment variables: ${missing}`);
            process.exit(1);
        }
        throw err;
    }
}

// Export a singleton validated env object
export const env = validateEnv();
