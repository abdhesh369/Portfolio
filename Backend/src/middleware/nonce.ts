import { type Request, type Response, type NextFunction } from "express";
import { randomBytes } from "crypto";

export function nonceMiddleware(req: Request, res: Response, next: NextFunction) {
    // Generate a random 16-byte nonce and encode it as base64
    const nonce = randomBytes(16).toString("base64");

    // Store it in res.locals for use in downstream middleware and templates
    res.locals.nonce = nonce;

    // Also optionally add it to a custom header for debugging or edge cases
    res.setHeader("X-CSP-Nonce", nonce);

    next();
}

/**
 * Accessor for the nonce in the current request context
 */
export function getNonce(res: Response): string {
    return res.locals.nonce || "";
}
