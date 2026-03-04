import { Router, type Express } from "express";
import { upload } from "../lib/cloudinary.js";
import { isAdmin, asyncHandler } from "../auth.js";

export function registerUploadRoutes(app: Router) {
    // POST /upload - Upload file to Cloudinary
    app.post(
        "/upload",
        isAdmin,
        asyncHandler(async (req, res) => {
            // We use the 'upload' middleware from cloudinary.ts directly in the route if possible,
            // or call it manually. The previous edit mixed them up.
            // Let's use it as a manual call to have full control over the buffer.

            const uploadSingle = upload.single("file");

            uploadSingle(req, res, async (err) => {
                if (err) {
                    console.error("Multer/Cloudinary Error:", err);
                    return res.status(500).json({
                        message: "Upload service error",
                        details: err.message || String(err),
                    });
                }

                const file = req.file as Express.Multer.File & { path?: string; buffer: Buffer };
                if (!file) {
                    console.error("Upload Failed: No file provided in request");
                    return res.status(400).json({ message: "No file uploaded" });
                }

                // MAGIC-BYTE VALIDATION: Validate actual file content
                // Note: file.buffer is only available if using memoryStorage. 
                // Since multer-storage-cloudinary might not provide the buffer, we check if it's available.
                // If not, we might need to fetch it or change storage strategy, but usually, 
                // we can intercept before it goes to Cloudinary or use a custom filter.

                const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

                // If buffer is available (multer memoryStorage), we validate magic bytes
                if (file.buffer) {
                    const { fileTypeFromBuffer } = await import('file-type');
                    const type = await fileTypeFromBuffer(file.buffer);
                    if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
                        console.error(`Upload Rejected: Magic bytes mismatch or invalid type "${type?.mime}"`);
                        return res.status(400).json({
                            message: `Invalid file content. Expected image, got "${type?.mime || 'unknown'}".`
                        });
                    }
                } else {
                    // Fallback to declaring MIME type if buffer is not available (less secure but better than nothing)
                    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                        console.error(`Upload Rejected: Invalid MIME type "${file.mimetype}"`);
                        return res.status(400).json({
                            message: `Invalid file type "${file.mimetype}". Allowed: JPEG, PNG, WebP, GIF, AVIF.`
                        });
                    }
                }

                console.log(`Upload Successful: ${file.originalname} -> ${file.path}`);
                res.json({ url: file.path });
            });
        })
    );
}
