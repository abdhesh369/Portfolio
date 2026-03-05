import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { env } from "../env.js";
import { isAuthenticated, asyncHandler, storeRefreshToken, validateRefreshToken, revokeRefreshToken, revokeToken } from "../auth.js";
import { generateCsrfToken, csrfProtection } from "../middleware/csrf.js";

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
        return res.status(400).json({ success: false, message: "Password is required" });
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
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate short-lived access token (15 minutes)
    const token = jwt.sign(
        { role: "admin" },
        env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    // Generate refresh token (random, not JWT) — 7 days
    const refreshToken = crypto.randomBytes(32).toString("hex");
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    // Store hashed refresh token in Redis with 7-day TTL
    await storeRefreshToken(refreshTokenHash);

    const isProd = process.env.NODE_ENV === "production";

    // Set HttpOnly access token cookie (15 min)
    res.cookie("auth_token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set HttpOnly refresh token cookie (7 days)
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set readable CSRF cookie (NOT httpOnly so frontend JS can read it)
    const csrfToken = generateCsrfToken();
    res.cookie("csrf_token", csrfToken, {
        httpOnly: false,
        secure: isProd,
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches refresh token)
    });

    res.json({ success: true, message: "Login successful" });
}));

/**
 * GET /api/auth/status
 * Returns current auth status
 */
router.get("/status", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    res.json({
        success: true,
        authenticated: true
    });
}));

/**
 * POST /api/auth/refresh
 * Validates refresh token cookie and issues new access token
 */
router.post("/refresh", asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
        return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const isValid = await validateRefreshToken(refreshTokenHash);

    if (!isValid) {
        return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    // Issue new short-lived access token
    const accessToken = jwt.sign(
        { role: "admin" },
        env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("auth_token", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    const newCsrfToken = generateCsrfToken();
    res.cookie("csrf_token", newCsrfToken, {
        httpOnly: false,
        secure: isProd,
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (match login TTL)
    });

    res.json({ success: true, message: "Token refreshed" });
}));

/**
 * POST /api/auth/logout
 * Blacklists current token and clears cookie
 */
router.post("/logout", asyncHandler(async (req: Request, res: Response) => {
    // Best-effort: revoke access token if present and valid
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
    }

    if (token) {
        try { await revokeToken(token); } catch { /* best-effort */ }
    }

    // Best-effort: revoke refresh token from Redis
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        try { await revokeRefreshToken(refreshTokenHash); } catch { /* best-effort */ }
    }

    const isProd = process.env.NODE_ENV === "production";

    // Always clear all cookies regardless of token validity
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/"
    });
    res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/"
    });
    res.clearCookie("csrf_token", {
        httpOnly: false,
        secure: isProd,
        sameSite: "strict",
        path: "/"
    });

    res.json({
        success: true,
        message: "Logged out successfully"
    });
}));

export { router as authRoutes };
