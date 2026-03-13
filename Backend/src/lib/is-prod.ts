import { Request } from "express";

/**
 * Returns true when the current request is operating in a production-like
 * environment. Used to set secure cookie flags.
 *
 * Checks both the environment variable and request-level signals because
 * Render staging deployments use NODE_ENV=production but some local
 * HTTPS setups do not.
 */
export function getIsProd(req?: Request): boolean {
  if (process.env.NODE_ENV === "production") return true;
  if (process.env.RENDER === "true") return true;
  if (!req) return false;
  const origin = req.headers.origin ?? "";
  return (
    req.secure ||
    req.headers["x-forwarded-proto"] === "https" ||
    (origin.startsWith("https://") && !origin.includes("localhost"))
  );
}
