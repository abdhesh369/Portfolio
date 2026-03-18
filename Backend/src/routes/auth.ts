import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { env } from "../env.js";
import { createAccessToken, createRefreshToken, validateRefreshToken, revokeRefreshToken, revokeToken } from "../auth.js";
import { asyncHandler } from "../lib/async-handler.js";
import { recordAudit } from "../lib/audit.js";
import { logger } from "../lib/logger.js";
import { getIsProd } from "../lib/is-prod.js";
import { generateCsrfToken } from "../middleware/csrf.js";

import { authLimiter } from "../lib/rate-limit.js";

const router = Router();

/** DRY cookie options generator (Finding #6) */
function getCookieOptions(isProd: boolean, maxAge: number): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "none" | "lax";
    path: string;
    maxAge: number;
} {
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge,
    };
}

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;         // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days


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
router.post("/login", authLimiter, asyncHandler(async (req: Request, res: Response, __next: NextFunction) => { // eslint-disable-line @typescript-eslint/no-unused-vars
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
        } catch (_err) { // eslint-disable-line @typescript-eslint/no-unused-vars
            isValid = false;
        }
    } else {
        // Secret is plain text — use constant-time comparison
        isValid = safeCompare(normalizedInput, normalizedSecret);
    }

    if (!isValid) {
        // Delay to further prevent brute-force attacks
        await new Promise(resolve => setTimeout(resolve, 1000));
        logger.warn({ context: "auth", ip: req.ip }, "Failed login attempt");
        recordAudit("LOGIN_FAILED", "auth", undefined, null, { ip: req.ip });
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT access token
    const accessToken = createAccessToken();

    // Generate stateless JWT refresh token (validated by signature, not Redis)
    const refreshToken = createRefreshToken();
    // await storeRefreshToken(refreshToken); // REMOVED: P0 Logic fix. Stateless JWTs don't need "tracking" in Redis.

    const isProd = getIsProd(req);

    // Set HttpOnly access token cookie (15 min)
    res.cookie("auth_token", accessToken, getCookieOptions(isProd, ACCESS_TOKEN_MAX_AGE));

    // Set HttpOnly refresh token cookie (7 days)
    res.cookie("refresh_token", refreshToken, getCookieOptions(isProd, REFRESH_TOKEN_MAX_AGE));

    // Set readable CSRF cookie (NOT httpOnly so frontend JS can read it)
    const csrfToken = generateCsrfToken();
    res.cookie("csrf_token", csrfToken, {
        ...getCookieOptions(isProd, REFRESH_TOKEN_MAX_AGE),
        httpOnly: false,
    });

    logger.info({ context: "auth", ip: req.ip }, "Admin login");
    recordAudit("LOGIN_SUCCESS", "auth", undefined, null, { ip: req.ip });

    res.json({ success: true, message: "Login successful", csrfToken });
}));

/**
 * GET /api/auth/status
 * Returns current auth status. Returns 200 regardless of auth to avoid console error noise.
 */
router.get("/status", asyncHandler(async (req: Request, res: Response) => {
    // Return existing CSRF token from cookie if present, otherwise generate a new one
    // to ensure frontend memory store is always populated after reload
    let csrfToken = req.cookies?.csrf_token;

    if (!csrfToken) {
        csrfToken = generateCsrfToken();
        const isProd = getIsProd(req);
        res.cookie("csrf_token", csrfToken, {
            httpOnly: false,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    // Check if user is actually authenticated
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
    }

    if (!token) {
        return res.json({
            success: true,
            authenticated: false,
            csrfToken
        });
    }

    try {
        jwt.verify(token, env.JWT_SECRET);
        return res.json({
            success: true,
            authenticated: true,
            csrfToken
        });
    } catch (__err) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return res.json({
            success: true,
            authenticated: false,
            csrfToken
        });
    }
}));


/**
 * POST /api/auth/refresh
 * Validates refresh token cookie and issues new access token.
 * Returns 200 OK even on failure (with success: false) to avoid console error noise.
 */
router.post("/refresh", asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
        return res.json({ success: false, message: "No refresh token provided" });
    }

    // 1. Validate the old token (verifies signature and checks Redis blacklist)
    const isValid = await validateRefreshToken(refreshToken);

    if (!isValid) {
        // SECURITY: If a valid-looking JWT is reused after revocation, 
        // it might indicate a theft. In high-sec apps, we might revoke the 
        // entire family here. For now, we just reject.
        return res.json({ success: false, message: "Invalid or expired refresh token" });
    }

    // 2. ROTATE: Revoke the old refresh token immediately (A3)
    await revokeRefreshToken(refreshToken);
    
    // 3. Issue a new pair, keeping the family ID (fid) for continued rotation tracking
    const decodedToken = jwt.decode(refreshToken) as { fid?: string } | null;
    const newAccessToken = createAccessToken();
    const newRefreshToken = createRefreshToken(decodedToken?.fid);
    
    const isProd = getIsProd(req);

    // 4. Set new cookies
    res.cookie("auth_token", newAccessToken, getCookieOptions(isProd, ACCESS_TOKEN_MAX_AGE));
    res.cookie("refresh_token", newRefreshToken, getCookieOptions(isProd, REFRESH_TOKEN_MAX_AGE));

    const newCsrfToken = generateCsrfToken();
    res.cookie("csrf_token", newCsrfToken, {
        ...getCookieOptions(isProd, REFRESH_TOKEN_MAX_AGE),
        httpOnly: false,
    });

    res.json({ 
        success: true, 
        message: "Token refreshed successfully", 
        csrfToken: newCsrfToken 
    });
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
        try { await revokeRefreshToken(refreshToken); } catch { /* best-effort */ }
    }

    const isProd = getIsProd(req);

    // Always clear all cookies regardless of token validity
    res.clearCookie("auth_token", getCookieOptions(isProd, 0));
    res.clearCookie("refresh_token", getCookieOptions(isProd, 0));
    res.clearCookie("csrf_token", { ...getCookieOptions(isProd, 0), httpOnly: false });

    res.json({
        success: true,
        message: "Logged out successfully"
    });
}));

export { router as authRoutes };
