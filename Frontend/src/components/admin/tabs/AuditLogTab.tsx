import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api-helpers";
import { LoadingSkeleton, EmptyState } from "@/components/admin/AdminShared";
import { ChevronDown, ChevronRight, Filter, RefreshCw } from "lucide-react";

interface AuditEntry {
  id: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entity_id: number | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
}

interface AuditResponse {
  entries: AuditEntry[];
  total: number;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "var(--color-cyan)",
  UPDATE: "var(--color-purple-light)",
  DELETE: "var(--color-destructive, #f87171)",
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
      const res = await apiFetch(`/api/v1/admin/audit-log?${params}`);
      if (res.ok) {
        const data: AuditResponse = await res.json();
        setEntries(data.entries);
        setTotal(data.total);
      }
    } catch {
      // Silently fail
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-100" style={{ letterSpacing: "0.04em" }}>
            Audit Log
          </h2>
          <p className="text-xs text-slate-400 mt-1" style={{ letterSpacing: "0.06em" }}>
            Append-only record of all admin actions ({total} total)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Entity filter */}
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-400" />
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setOffset(0); }}
              className="text-xs rounded-md px-3 py-1.5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: 'var(--foreground-hex, #e2e8f0)',
                fontFamily: "inherit",
              }}
            >
              {ENTITY_FILTERS.map((f) => (
                <option key={f} value={f} style={{ background: "#0a0a12" }}>
                  {f === "all" ? "All Entities" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchEntries}
            className="rounded-md p-2 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#94a3b8",
            }}
            title="Refresh"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton />
      ) : entries.length === 0 ? (
        <EmptyState icon="📋" text="No audit log entries found" />
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Header row */}
          <div
            className="grid grid-cols-[40px_80px_100px_80px_1fr] gap-3 px-4 py-2.5 text-[10px] text-slate-400 uppercase"
            style={{ letterSpacing: "0.1em", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span />
            <span>Action</span>
            <span>Entity</span>
            <span>ID</span>
            <span>Timestamp</span>
          </div>

          {entries.map((entry) => (
            <div key={entry.id}>
              <button
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                className="w-full grid grid-cols-[40px_80px_100px_80px_1fr] gap-3 px-4 py-3 text-xs text-left items-center cursor-pointer"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  transition: "background 0.15s ease",
                  fontFamily: "inherit",
                  background: expandedId === entry.id ? "rgba(34,211,238,0.04)" : "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(34,211,238,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = expandedId === entry.id ? "rgba(34,211,238,0.04)" : "transparent")}
              >
                {expandedId === entry.id ? (
                  <ChevronDown size={13} className="text-cyan-400" />
                ) : (
                  <ChevronRight size={13} className="text-slate-500" />
                )}
                <span
                  className="rounded text-[10px] font-bold px-2 py-0.5 text-center"
                  style={{
                    background: `${ACTION_COLORS[entry.action]}20`,
                    color: ACTION_COLORS[entry.action],
                    border: `1px solid ${ACTION_COLORS[entry.action]}40`,
                    letterSpacing: "0.06em",
                  }}
                >
                  {entry.action}
                </span>
                <span className="text-slate-300">{entry.entity}</span>
                <span className="text-slate-400 font-mono">
                  {entry.entity_id ?? "—"}
                </span>
                <span className="text-slate-400">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
              </button>

              {/* Expandable diff view */}
              {expandedId === entry.id && (
                <div
                  className="px-8 py-4 grid grid-cols-2 gap-4"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(0,0,0,0.2)",
                  }}
                >
                  <div>
                    <div
                      className="text-[10px] text-red-400 mb-2 uppercase font-bold"
                      style={{ letterSpacing: "0.1em" }}
                    >
                      Old Values
                    </div>
                    <pre
                      className="text-[11px] text-slate-400 overflow-x-auto rounded p-3"
                      style={{
                        background: "rgba(248,113,113,0.05)",
                        border: "1px solid rgba(248,113,113,0.1)",
                        maxHeight: 300,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {entry.old_values
                        ? JSON.stringify(entry.old_values, null, 2)
                        : "null"}
                    </pre>
                  </div>
                  <div>
                    <div
                      className="text-[10px] text-green-400 mb-2 uppercase font-bold"
                      style={{ letterSpacing: "0.1em" }}
                    >
                      New Values
                    </div>
                    <pre
                      className="text-[11px] text-slate-400 overflow-x-auto rounded p-3"
                      style={{
                        background: "rgba(34,211,238,0.05)",
                        border: "1px solid rgba(34,211,238,0.1)",
                        maxHeight: 300,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {entry.new_values
                        ? JSON.stringify(entry.new_values, null, 2)
                        : "null"}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="text-xs px-3 py-1.5 rounded-md cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#94a3b8",
              fontFamily: "inherit",
            }}
          >
            Previous
          </button>
          <span className="text-xs text-slate-400" style={{ letterSpacing: "0.06em" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={currentPage >= totalPages}
            className="text-xs px-3 py-1.5 rounded-md cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#94a3b8",
              fontFamily: "inherit",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
