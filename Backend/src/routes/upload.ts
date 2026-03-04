import { Router, type Express } from "express";
import { upload } from "../lib/cloudinary.js";
import { isAuthenticated, asyncHandler } from "../auth.js";

export function registerUploadRoutes(app: Router) {
    // POST /upload - Upload file to Cloudinary
    app.post(
        "/upload",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            // We use the 'upload' middleware from cloudinary.ts directly in the route if possible,
            // or call it manually. The previous edit mixed them up.
            // Let's use it as a manual call to have full control over the buffer.

            // Use memory storage for validation before streaming to Cloudinary
            const multerModule = await import("multer");
            const multer = multerModule.default;
            const storage = multer.memoryStorage();
            const uploadMem = multer({
                storage,
                limits: {
                    fileSize: 5 * 1024 * 1024, // 5MB limit (BUG-02)
                    files: 1
                }
            }).single("file");

            uploadMem(req, res, async (err) => {
                if (err) {
                    // Multer errors (including fileSize limit)
                    if (err.code === "LIMIT_FILE_SIZE") {
                        return res.status(413).json({ message: "File too large. Maximum size is 5MB." });
                    }
                    return res.status(500).json({ message: "Upload service error", details: err.message });
                }

                const file = req.file;
                if (!file || !file.buffer) {
                    return res.status(400).json({ message: "No file uploaded or buffer missing" });
                }

                // MAGIC-BYTE VALIDATION
                const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
                const { fileTypeFromBuffer } = await import('file-type');
                const type = await fileTypeFromBuffer(file.buffer);

                if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
                    return res.status(400).json({
                        message: `Invalid file content. Expected image, got "${type?.mime || 'unknown'}".`
                    });
                }

                // SECURE STREAM TO CLOUDINARY
                const { cloudinary } = await import("../lib/cloudinary.js");
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'portfolio_uploads',
                        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'avif'],
                        public_id: `project_${Date.now()}_${file.originalname.split('.')[0].replace(/[^\w-]/g, '')}`
                    },
                    (error, result) => {
                        if (error || !result) {
                            return res.status(500).json({ message: "Cloudinary upload failed", details: error?.message });
                        }
                        res.json({ url: result.secure_url });
                    }
                );

                uploadStream.end(file.buffer);
            });
        })
    );
}
