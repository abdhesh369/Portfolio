import { auditLogService } from "../services/audit-log.service.js";
import type { AuditAction } from "../repositories/audit-log.repository.js";

/**
 * Records an audit log entry for admin actions (create/update/delete).
 * Fire-and-forget to avoid blocking the main request.
 */
export function recordAudit(
  action: AuditAction,
  entity: string,
  entityId?: number,
  oldValues?: Record<string, unknown> | null,
  newValues?: Record<string, unknown> | null,
) {
  auditLogService.record(action, entity, entityId, oldValues, newValues).catch(() => {
    // Silently fail — audit should never break main flow
  });
}
