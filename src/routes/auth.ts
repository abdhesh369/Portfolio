import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../env.js";
import { asyncHandler } from "../auth.js";

const router = Router();

// Cache the hashed password for the session
let hashedAdminPassword = "";

async function getHashedPassword() {
    if (!hashedAdminPassword) {
        // In a real database, we'd fetch this from a users table.
        // For now, we hash the ADMIN_PASSWORD from env.
        hashedAdminPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
    }
    return hashedAdminPassword;
}

/**
 * POST /api/auth/login
 * Verifies credentials and returns a JWT
 */
router.post("/auth/login", asyncHandler(async (req: Request, res: Response) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    const adminHash = await getHashedPassword();
    const isValid = await bcrypt.compare(password, adminHash);

    if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
        { role: "admin", user: "abdhesh" },
        env.JWT_SECRET,
        { expiresIn: "24h" }
    );

    res.json({ token });
}));

export { router as authRoutes };
