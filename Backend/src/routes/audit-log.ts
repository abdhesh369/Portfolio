import { Router } from "express";
import { isAuthenticated } from "../auth.js";
import { auditLogService } from "../services/audit-log.service.js";

const router = Router();

/**
 * GET /api/v1/admin/audit-log
 * Admin only, paginated, filterable by entity and days.
 * Append-only — no DELETE endpoint.
 */
router.get("/audit-log", isAuthenticated, async (req: any, res: any, next: any) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const entity = typeof req.query.entity === "string" ? req.query.entity : undefined;
    const days = req.query.days ? Number(req.query.days) : undefined;

    const result = await auditLogService.list({ limit, offset, entity, days });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
