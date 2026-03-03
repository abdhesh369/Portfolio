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

        // Set Cache-Control header
        res.setHeader(
            "Cache-Control",
            `public, max-age=${maxAgeSeconds}, stale-while-revalidate=60`
        );

        next();
    };
};
