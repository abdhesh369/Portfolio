import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { env } from "../env.js";
import { isAuthenticated, asyncHandler } from "../auth.js";

import rateLimit from "express-rate-limit";

const router = Router();

/**
 * Login Rate Limiter: 5 attempts per 15 minutes
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many login attempts, please try again in 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

/**
 * Constant-time string comparison to prevent timing attacks.
 * Uses HMAC to normalize input lengths before comparison.
 */
function safeCompare(a: string, b: string): boolean {
    const sah = crypto.randomBytes(32); // Random salt for this comparison
    const hmacA = crypto.createHmac("sha256", sah).update(a || "").digest();
    const hmacB = crypto.createHmac("sha256", sah).update(b || "").digest();
    return crypto.timingSafeEqual(hmacA, hmacB);
}

/**
 * POST /api/auth/login
 * Verifies credentials and returns a JWT
 */
router.post("/login", loginLimiter, asyncHandler(async (req: Request, res: Response) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    const normalizedInput = String(password).trim();
    const normalizedSecret = String(env.ADMIN_PASSWORD).trim();

    let isValid = false;

    if (normalizedSecret.startsWith("$2")) {
        // Secret is a bcrypt hash — use bcrypt.compare (already constant-time)
        try {
            isValid = await bcrypt.compare(normalizedInput, normalizedSecret);
        } catch {
            isValid = false;
        }
    } else {
        // Secret is plain text — use constant-time comparison
        isValid = safeCompare(normalizedInput, normalizedSecret);
    }

    if (!isValid) {
        // Delay to further prevent brute-force attacks
        await new Promise(resolve => setTimeout(resolve, 1000));
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
        { role: "admin" }, // Minimal payload
        env.JWT_SECRET,
        { expiresIn: "24h" }
    );

    const isProd = process.env.NODE_ENV === "production";

    // Set HttpOnly cookie
    res.cookie("auth_token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({ success: true, message: "Login successful" });
}));

/**
 * GET /api/auth/status
 * Returns current auth status
 */
router.get("/status", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    res.json({
        authenticated: true
    });
}));

/**
 * POST /api/auth/logout
 * Blacklists current token and clears cookie
 */
router.post("/logout", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    // 1. Revoke token in blacklist (whether from header or cookie)
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
    }

    if (token) {
        const { revokeToken } = await import("../auth.js");
        await revokeToken(token);
    }

    const isProd = process.env.NODE_ENV === "production";

    // 2. Clear cookie (must match flags used when setting)
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict"
    });

    res.json({ message: "Logged out successfully" });
}));

export { router as authRoutes };
