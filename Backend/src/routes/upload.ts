import { Router } from "express";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { recordAudit } from "../lib/audit.js";
import multer from "multer";
import { fileTypeFromBuffer } from 'file-type';
import { cloudinary } from "../lib/cloudinary.js";
import { UploadService } from "../services/upload.service.js";

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
                    if (err.code === "LIMIT_FILE_SIZE") {
                        return res.status(413).json({ message: "File too large. Maximum size is 5MB." });
                    }
                    return res.status(500).json({ message: "Upload service error", details: err.message });
                }

                const file = req.file;
                if (!file || !file.buffer) {
                    return res.status(400).json({ message: "No file uploaded or buffer missing" });
                }

                try {
                    const result = await UploadService.uploadImage(file.buffer, file.originalname);
                    res.json({
                        success: true,
                        message: "File uploaded successfully",
                        data: { url: result.url }
                    });
                } catch (error: any) {
                    res.status(400).json({
                        success: false,
                        message: error.message || "Upload failed"
                    });
                }
            });
        })
    );
}
