import { auditLogRepository, type AuditAction } from "../repositories/audit-log.repository.js";

export const auditLogService = {
  /**
   * Records an audit log entry for an entity action.
   * @param action - The type of audit action performed
   * @param entity - The entity type being audited
   * @param entityId - Optional ID of the affected entity
   * @param oldValues - Optional previous values before the change
   * @param newValues - Optional new values after the change
   */
  async record(action: AuditAction, entity: string, entityId?: number, oldValues?: Record<string, unknown> | null, newValues?: Record<string, unknown> | null) {
    await auditLogRepository.record({ action, entity, entityId, oldValues, newValues });
  },

  /**
   * Retrieves a paginated list of audit log entries.
   * @param opts - Filter and pagination options (limit, offset, entity, days)
   * @returns Paginated audit log entries
   */
  async list(opts: { limit?: number; offset?: number; entity?: string; days?: number }) {
    return auditLogRepository.list(opts);
  },
};
