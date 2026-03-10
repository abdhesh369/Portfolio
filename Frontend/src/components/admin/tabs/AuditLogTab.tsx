import { formatDate } from "../../../lib/utils/date";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api-helpers";
import { toast } from "react-hot-toast";
import { LoadingSkeleton, EmptyState, AdminButton, FormSelect } from "@/components/admin/AdminShared";
import { ChevronDown, ChevronRight, Filter, RefreshCw, Shield, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: number | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  createdAt: string;
}

interface AuditResponse {
  entries: AuditEntry[];
  total: number;
}

const ACTION_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  CREATE: { color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/20" },
  UPDATE: { color: "text-indigo-500", bg: "bg-indigo-500/5", border: "border-indigo-500/20" },
  DELETE: { color: "text-rose-500", bg: "bg-rose-500/5", border: "border-rose-500/20" },
};

const ENTITY_FILTERS = ["all", "project", "article", "skill", "experience", "service", "testimonial", "guestbook_entry", "message", "seo_settings", "email_template", "upload"];

export function AuditLogTab() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const limit = 50;

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (filter !== "all") params.set("entity", filter);
      const data: AuditResponse = await apiFetch(`/api/v1/admin/audit-log?${params}`);
      setEntries(data.entries);
      setTotal(data.total);
    } catch (_err: unknown) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [offset, filter]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 nm-flat rounded-2xl text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter" style={{ fontFamily: "var(--font-display)" }}>
                Audit_Log
              </h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
                Immutable Record &bull; {total} Entries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <FormSelect
              label=""
              value={filter}
              onChange={(val) => { setFilter(val); setOffset(0); }}
              options={ENTITY_FILTERS.map(f => ({
                label: f === "all" ? "All Entities" : f.replace(/_/g, " "),
                value: f
              }))}
              icon={<Filter size={14} />}
              className="!space-y-0 min-w-[180px]"
            />
            <AdminButton
              onClick={fetchEntries}
              variant="secondary"
              icon={RefreshCw}
              className="w-12 h-12 rounded-2xl"
              title="Refresh Logs"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton />
      ) : entries.length === 0 ? (
        <EmptyState icon={Shield} text="No audit log entries found" />
      ) : (
        <div className="nm-flat rounded-[2.5rem] overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[40px_90px_120px_80px_1fr] gap-4 px-8 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-black/5">
            <span />
            <span>Action</span>
            <span>Entity</span>
            <span>ID</span>
            <span>Timestamp</span>
          </div>

          {entries.map((entry, idx) => {
            const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.UPDATE;
            return (
              <div key={entry.id}>
                <button
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  className={cn(
                    "w-full grid grid-cols-[40px_90px_120px_80px_1fr] gap-4 px-8 py-4 text-left items-center cursor-pointer transition-all duration-300 border-b border-black/[0.03]",
                    expandedId === entry.id ? "nm-inset" : "hover:bg-black/[0.02]"
                  )}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="w-7 h-7 nm-inset rounded-lg flex items-center justify-center">
                    {expandedId === entry.id ? (
                      <ChevronDown size={12} className="text-primary" />
                    ) : (
                      <ChevronRight size={12} className="text-muted-foreground" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl text-center border",
                    config.color, config.bg, config.border
                  )}>
                    {entry.action}
                  </span>
                  <span className="text-sm font-bold tracking-tight capitalize">{entry.entity.replace(/_/g, " ")}</span>
                  <span className="text-xs text-muted-foreground font-mono nm-inset px-2 py-1 rounded-lg text-center">
                    {entry.entityId ?? "—"}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {formatDate(entry.createdAt, { month: 'short', day: 'numeric', year: 'numeric', includeTime: true })}
                  </span>
                </button>

                {/* Expandable diff view */}
                {expandedId === entry.id && (
                  <div className="px-8 py-6 grid grid-cols-2 gap-6 nm-inset mx-4 mb-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em]">Previous State</span>
                      </div>
                      <pre className="text-[11px] text-muted-foreground overflow-x-auto nm-flat p-4 rounded-2xl max-h-[300px] font-mono leading-relaxed">
                        {entry.oldValues
                          ? JSON.stringify(entry.oldValues, null, 2)
                          : "null"}
                      </pre>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">New State</span>
                      </div>
                      <pre className="text-[11px] text-muted-foreground overflow-x-auto nm-flat p-4 rounded-2xl max-h-[300px] font-mono leading-relaxed">
                        {entry.newValues
                          ? JSON.stringify(entry.newValues, null, 2)
                          : "null"}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 pt-8">
          <AdminButton
            onClick={() => setOffset(prev => Math.max(0, prev - limit))}
            disabled={offset === 0}
            variant="secondary"
            icon={ChevronLeft}
            className="nm-button pl-4 pr-6 py-3 rounded-2xl"
          >
            Previous
          </AdminButton>

          <div className="nm-inset px-6 py-3 rounded-2xl">
            <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground">
              PHASE <span className="text-primary">{currentPage}</span> / {totalPages}
            </p>
          </div>

          <AdminButton
            onClick={() => setOffset(prev => prev + limit)}
            disabled={currentPage >= totalPages}
            variant="secondary"
            icon={ChevronRight}
            className="nm-button pl-6 pr-4 py-3 rounded-2xl"
          >
            Next
          </AdminButton>
        </div>
      )}
    </div>
  );
}
