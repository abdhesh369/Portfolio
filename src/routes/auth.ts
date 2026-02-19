import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../env.js";
import { isAuthenticated, asyncHandler } from "../auth.js";

import rateLimit from "express-rate-limit";

const router = Router();

// Hash once at module load time for efficiency
const adminHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);

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
 * POST /api/auth/login
 * Verifies credentials and returns a JWT
 */
router.post("/login", loginLimiter, asyncHandler(async (req: Request, res: Response) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    const isValid = await bcrypt.compare(password, adminHash);

    if (!isValid) {
        // Delay to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, 1000));
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
        { role: "admin", user: "abdhesh" },
        env.JWT_SECRET,
        { expiresIn: "24h" }
    );

    // Set HttpOnly cookie
    res.cookie("auth_token", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({ token, message: "Login successful" });
}));

/**
 * GET /api/auth/status
 * Returns current auth status
 */
router.get("/status", isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    res.json({
        authenticated: true,
        user: (req as any).user
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
        revokeToken(token);
    }

    // 2. Clear cookie
    res.clearCookie("auth_token");

    res.json({ message: "Logged out successfully" });
}));

export { router as authRoutes };
