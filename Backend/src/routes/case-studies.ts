import { Router, Request, Response } from "express";
import { caseStudyService } from "../services/case-study.service.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { recordAudit } from "../lib/audit.js";
import { cachePublic } from "../middleware/cache.js";
import { aiLimiter } from "../lib/rate-limit.js";

export function registerCaseStudyRoutes(app: Router) {
    // GET /case-studies — public list
    app.get(
        "/case-studies",
        cachePublic(600),
        asyncHandler(async (_req: Request, res: Response) => {
            const studies = await caseStudyService.getPublished();
            res.json(studies);
        })
    );

    // GET /case-studies/:slug — public detail
    app.get(
        "/case-studies/:slug",
        cachePublic(600),
        asyncHandler(async (req: Request, res: Response) => {
            const study = await caseStudyService.getBySlug(req.params.slug);
            if (!study) {
                res.status(404).json({ success: false, message: "Case study not found" });
                return;
            }
            res.json({ success: true, data: study });
        })
    );

    // GET /admin/case-studies — admin list (all)
    app.get(
        "/admin/case-studies",
        isAuthenticated,
        asyncHandler(async (_req: Request, res: Response) => {
            const studies = await caseStudyService.getAll();
            res.json(studies);
        })
    );

    // POST /case-studies/generate/:projectId — admin: trigger generation
    app.post(
        "/case-studies/generate/:projectId",
        isAuthenticated,
        aiLimiter,
        asyncHandler(async (req: Request, res: Response) => {
            const projectId = parseInt(req.params.projectId, 10);
            if (isNaN(projectId)) {
                res.status(400).json({ success: false, message: "Invalid project ID" });
                return;
            }
            const study = await caseStudyService.generate(projectId);
            recordAudit("CREATE", "case_study", study.id, null, { projectId });
            res.status(201).json({ success: true, data: study });
        })
    );

    // PUT /case-studies/:id — admin: update
    app.put(
        "/case-studies/:id",
        isAuthenticated,
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid ID" });
                return;
            }
            const study = await caseStudyService.update(id, req.body);
            recordAudit("UPDATE", "case_study", id, null, req.body);
            res.json({ success: true, data: study });
        })
    );

    // DELETE /case-studies/:id — admin
    app.delete(
        "/case-studies/:id",
        isAuthenticated,
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid ID" });
                return;
            }
            await caseStudyService.delete(id);
            recordAudit("DELETE", "case_study", id, null, null);
            res.status(204).send();
        })
    );
}
