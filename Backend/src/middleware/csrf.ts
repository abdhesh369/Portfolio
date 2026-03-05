import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * CSRF Protection — Double Submit Cookie Pattern
 *
 * How it works:
 * 1. On login, server sets a readable `csrf_token` cookie (NOT HttpOnly)
 * 2. The frontend reads this cookie and sends it as `X-CSRF-Token` header
 * 3. This middleware compares the header value against the cookie value
 *    using `crypto.timingSafeEqual` to prevent timing attacks
 *
 * Only enforced when:
 * - The request method is state-changing (not GET/HEAD/OPTIONS)
 * - The request has an `auth_token` cookie (authenticated session)
 *
 * Public POST routes (e.g. /chat, /messages) are unaffected since they
 * don't carry an auth_token cookie.
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Generate a cryptographically random CSRF token
 */
export function generateCsrfToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Middleware that validates the CSRF token on state-changing authenticated requests.
 * Apply AFTER cookie-parser.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
    // Skip safe (read-only) methods
    if (SAFE_METHODS.has(req.method)) {
        next();
        return;
    }

    // Skip auth entry-point routes — login and refresh must work even when
    // a stale auth_token cookie exists from a previous session
    if (req.path === "/auth/login" || req.path === "/auth/refresh" || req.path === "/auth/logout") {
        next();
        return;
    }

    // Skip unauthenticated requests (public endpoints like /chat, /messages)
    if (!req.cookies?.auth_token) {
        next();
        return;
    }

    const cookieToken = req.cookies?.csrf_token;
    const headerToken = req.headers["x-csrf-token"] as string | undefined;

    if (!cookieToken || !headerToken) {
        res.status(403).json({ message: "Invalid CSRF token" });
        return;
    }

    // Constant-time comparison to prevent timing attacks
    try {
        const cookieBuf = Buffer.from(cookieToken, "utf8");
        const headerBuf = Buffer.from(headerToken, "utf8");

        if (cookieBuf.length !== headerBuf.length || !crypto.timingSafeEqual(cookieBuf, headerBuf)) {
            res.status(403).json({ message: "Invalid CSRF token" });
            return;
        }
    } catch {
        res.status(403).json({ message: "Invalid CSRF token" });
        return;
    }

    next();
}
