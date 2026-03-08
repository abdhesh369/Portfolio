import { Router, Request, Response } from "express";
import { aiReviewService } from "../services/ai-review.service.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { recordAudit } from "../lib/audit.js";

const router = Router();

export function registerReviewRoutes(app: Router) {
    // POST /projects/:id/review — trigger AI review (admin only)
    app.post(
        "/projects/:id/review",
        isAuthenticated,
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid project ID" });
                return;
            }
            const review = await aiReviewService.triggerReview(id);
            recordAudit("CREATE", "code_review", review.id, null, { projectId: id });
            res.status(202).json({ success: true, data: review });
        })
    );

    // GET /projects/:id/review — get latest review
    app.get(
        "/projects/:id/review",
        asyncHandler(async (req: Request, res: Response) => {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid project ID" });
                return;
            }
            const review = await aiReviewService.getLatestReview(id);
            if (!review) {
                res.status(404).json({ success: false, message: "No review found" });
                return;
            }
            res.json({ success: true, data: review });
        })
    );
}
