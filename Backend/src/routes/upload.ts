import { Router, type Express } from "express";
import { upload } from "../lib/cloudinary.js";
import { isAuthenticated } from "../auth.js";

export function registerUploadRoutes(app: Router) {
    // POST /upload - Upload file to Cloudinary
    app.post(
        "/upload",
        isAuthenticated,
        (req, res, next) => {
            upload.single("image")(req, res, (err) => {
                if (err) {
                    console.error("Multer/Cloudinary Error:", err);
                    return res.status(500).json({
                        message: "Upload service error",
                        details: err.message || String(err),
                    });
                }

                const file = req.file as Express.Multer.File & { path?: string };
                if (!file) {
                    console.error("Upload Failed: No file provided in request");
                    return res.status(400).json({ message: "No file uploaded" });
                }

                console.log(`Upload Successful: ${file.originalname} -> ${file.path}`);
                res.json({ url: file.path });
            });
        }
    );
}
