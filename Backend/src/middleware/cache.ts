import { Request, Response, NextFunction } from "express";

/**
 * Middleware to set HTTP caching headers for public GET endpoints.
 * 
 * Cache settings:
 * - public: Allow caching by browsers and CDNs
 * - max-age=300: 5 minutes of browser caching
 * - stale-while-revalidate=60: Serve stale content for up to 60s while refreshing in the background
 */
export const cachePublic = (maxAgeSeconds: number = 300) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== "GET") {
            return next();
        }

        // Skip caching if authenticated (prevents leaking admin/draft content to CDNs)
        if (req.cookies?.auth_token || req.headers.authorization || req.headers["x-api-key"]) {
            return next();
        }

        // Set Cache-Control header
        res.set(
            "Cache-Control",
            `public, max-age=${maxAgeSeconds}, stale-while-revalidate=60`
        );

        next();
    };
};
