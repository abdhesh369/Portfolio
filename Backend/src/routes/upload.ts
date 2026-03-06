import { Router } from "express";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { recordAudit } from "../lib/audit.js";
import multer from "multer";
import { fileTypeFromBuffer } from 'file-type';
import { cloudinary } from "../lib/cloudinary.js";

const storage = multer.memoryStorage();
const uploadMem = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1
    }
}).single("file");


export function registerUploadRoutes(app: Router) {
    // POST /upload - Upload file to Cloudinary
    app.post(
        "/upload",
        isAuthenticated,
        asyncHandler(async (req, res) => {
            // We use the 'upload' middleware from cloudinary.ts directly in the route if possible,
            // or call it manually. The previous edit mixed them up.
            // Let's use it as a manual call to have full control over the buffer.

            // Use the hoisted upload middleware


            uploadMem(req, res, async (err: any) => {
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
                const type = await fileTypeFromBuffer(file.buffer);

                if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
                    return res.status(400).json({
                        message: `Invalid file content. Expected image, got "${type?.mime || 'unknown'}".`
                    });
                }

                // SECURE STREAM TO CLOUDINARY
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'portfolio_uploads',
                        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'avif'],
                        public_id: `project_${Date.now()}_${file.originalname.split('.')[0].replace(/[^\w-]/g, '')}`
                    },
                    (error: any, result: any) => {
                        if (error || !result) {
                            return res.status(500).json({
                                success: false,
                                message: "Cloudinary upload failed",
                                details: error?.message
                            });
                        }

                        // Audit log (A5)
                        recordAudit("CREATE", "upload", undefined, null, {
                            url: result.secure_url,
                            publicId: result.public_id,
                            format: result.format,
                            originalName: file.originalname
                        });

                        res.json({
                            success: true,
                            message: "File uploaded successfully",
                            data: { url: result.secure_url }
                        });
                    }
                );

                uploadStream.end(file.buffer);
            });
        })
    );
}
