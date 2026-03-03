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

                // Validate MIME type — only allow safe image formats
                const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
                if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                    console.error(`Upload Rejected: Invalid MIME type "${file.mimetype}"`);
                    return res.status(400).json({
                        message: `Invalid file type "${file.mimetype}". Allowed: JPEG, PNG, WebP, GIF, AVIF.`
                    });
                }

                console.log(`Upload Successful: ${file.originalname} -> ${file.path}`);
                res.json({ url: file.path });
            });
        }
    );
}
