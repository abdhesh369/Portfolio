import { db } from "../db.js";
import { auditLogTable } from "@portfolio/shared";
import { desc, eq, and, gte, sql, type InferInsertModel, type InferSelectModel } from "drizzle-orm";

type DbAuditLog = InferSelectModel<typeof auditLogTable>;
type DbInsertAuditLog = InferInsertModel<typeof auditLogTable>;

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "OTHER";

export interface AuditLogEntry {
  action: AuditAction;
  entity: string;
  entityId?: number;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

export const auditLogRepository = {
  /** Record an audit event (append-only) */
  async record(entry: AuditLogEntry) {
    const logData: DbInsertAuditLog = {
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId ?? null,
      oldValues: entry.oldValues ?? null,
      newValues: entry.newValues ?? null,
    };

    await db.insert(auditLogTable).values(logData);
  },

  /** Paginated list of audit log entries (newest first) */
  async list(opts: { limit?: number; offset?: number; entity?: string; days?: number }) {
    const { limit = 50, offset = 0, entity, days } = opts;

    const conditions = [];
    if (entity) conditions.push(eq(auditLogTable.entity, entity));
    if (days) {
      const since = new Date(Date.now() - days * 86400_000);
      conditions.push(gte(auditLogTable.createdAt, since));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(auditLogTable)
        .where(where)
        .orderBy(desc(auditLogTable.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(auditLogTable)
        .where(where),
    ]);

    return {
      entries: rows as DbAuditLog[],
      total: countResult[0]?.count ?? 0,
    };
  },
};
