import { auditLogRepository, type AuditAction } from "../repositories/audit-log.repository.js";

export const auditLogService = {
  async record(action: AuditAction, entity: string, entityId?: number, oldValues?: Record<string, unknown> | null, newValues?: Record<string, unknown> | null) {
    await auditLogRepository.record({ action, entity, entityId, oldValues, newValues });
  },

  async list(opts: { limit?: number; offset?: number; entity?: string; days?: number }) {
    return auditLogRepository.list(opts);
  },
};
