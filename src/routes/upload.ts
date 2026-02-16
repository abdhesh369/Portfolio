import type { Express } from "express";
import { upload } from "../lib/cloudinary.js";
import { isAuthenticated } from "../auth.js";

export function registerUploadRoutes(app: Express) {
    app.post(
        "/api/upload",
        isAuthenticated,
        upload.single("image"),
        (req, res) => {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            res.json({ url: (req.file as any).path });
        }
    );
}
