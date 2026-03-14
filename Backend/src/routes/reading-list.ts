import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { db } from "../db.js";
import { readingListTable, insertReadingListApiSchema } from "@portfolio/shared";
import { isAuthenticated } from "../auth.js";
import { validateBody } from "../middleware/validate.js";
import { desc, eq } from "drizzle-orm";
import { parseIntParam } from "../lib/params.js";
import { recordAudit } from "../lib/audit.js";

const router = Router();

// GET /api/reading-list - Get all reading list entries
router.get(
    "/",
    asyncHandler(async (_req, res) => {
        const entries = await db.select().from(readingListTable).orderBy(desc(readingListTable.createdAt));
        res.json(entries);
    })
);

// POST /api/reading-list - Add new entry (Admin only)
router.post(
    "/",
    isAuthenticated,
    validateBody(insertReadingListApiSchema),
    asyncHandler(async (req, res) => {
        const [entry] = await db.insert(readingListTable).values(req.body).returning();
        recordAudit("CREATE", "reading_list", entry.id, null, req.body);
        res.status(201).json({
            success: true,
            message: "Reading list entry added",
            data: entry
        });
    })
);

// DELETE /api/reading-list/:id - Delete entry (Admin only)
router.delete(
    "/:id",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const id = parseIntParam(res, req.params.id, "entry ID");
        if (id === null) return;
        
        await db.delete(readingListTable).where(eq(readingListTable.id, id));
        recordAudit("DELETE", "reading_list", id, null, null);
        res.status(204).send();
    })
);

export default router;
