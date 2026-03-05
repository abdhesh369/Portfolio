import { Router } from "express";
import { settingsService } from "../services/settings.service.js";
import { insertSiteSettingsApiSchema } from "../../shared/schema.js";
import { isAuthenticated, asyncHandler } from "../auth.js";
import { validateBody } from "../middleware/validate.js";
import { recordAudit } from "../lib/audit.js";

const router = Router();

export function registerSettingsRoutes(app: Router) {
    // GET /settings - Publicly get site settings
    app.get(
        "/settings",
        asyncHandler(async (_req, res) => {
            const settings = await settingsService.getSettings();
            res.json(settings);
        })
    );

    // PATCH /settings - Update site settings (Admin only)
    app.patch(
        "/settings",
        isAuthenticated,
        validateBody(insertSiteSettingsApiSchema),
        asyncHandler(async (req, res) => {
            const oldSettings = await settingsService.getSettings();
            const newSettings = await settingsService.updateSettings(req.body);

            recordAudit("UPDATE", "site_settings", newSettings.id, oldSettings, req.body);

            res.json({
                success: true,
                message: "Site settings updated successfully",
                data: newSettings
            });
        })
    );
}
