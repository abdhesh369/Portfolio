import { Response } from "express";

/**
 * Safely parses an ID parameter from a request and handles invalid values.
 * Returns the parsed integer or sends a 400 response and returns null.
 */
export function parseIntParam(res: Response, param: string | string[] | undefined, name: string = "ID"): number | null {
    const raw = Array.isArray(param) ? param[0] : param;
    const id = parseInt(raw || "", 10);
    if (isNaN(id)) {
        res.status(400).json({ success: false, message: `Invalid ${name}` });
        return null;
    }
    return id;
}
