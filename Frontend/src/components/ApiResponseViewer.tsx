import { useState, useCallback, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
import { Code2, Copy, Check, Terminal, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { API_BASE_URL, apiFetch } from "#src/lib/api-helpers";

/* ------------------------------------------------------------------ */
/* Syntax-highlighted JSON renderer (no external deps)                 */
/* ------------------------------------------------------------------ */

function highlightJson(json: string): string {
  // Escape the full string first, then layer highlight spans on top.
  // After escapeHtml, double-quotes become &quot;
  const escaped = escapeHtml(json);
  return escaped
    // strings (keys + values) — match &quot; … &quot; allowing any safe content between
    .replace(/&quot;((?:[^&]|&(?!quot;))*)&quot;/g, (match) =>
      `<span class="json-string">${match}</span>`)
    // numbers (standalone, not inside a span tag)
    .replace(/(>|^|\s|,|\[)(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)(?=\s|,|\]|\}|<|$)/g,
      '$1<span class="json-number">$2</span>')
    // booleans & null
    .replace(/(>|^|\s|,|\[)(true|false|null)(?=\s|,|\]|\}|<|$)/g,
      '$1<span class="json-bool">$2</span>');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ApiResponseViewerProps {
  /** The API endpoint path, e.g. "/api/projects/3" */
  endpoint: string;
  /** HTTP method (default: GET) */
  method?: string;
  /** Preloaded data to display immediately (avoids a second fetch) */
  data?: unknown;
  /** Accent colour for theming */
  accentColor?: string;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function ApiResponseViewer({
  endpoint,
  method = "GET",
  data: preloadedData,
  accentColor = "#00d4ff",
}: ApiResponseViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [responseData, setResponseData] = useState<unknown | null>(preloadedData ?? null);
  const [statusCode, setStatusCode] = useState<number | null>(preloadedData ? 200 : null);
  const [latency, setLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchLive = useCallback(async () => {
    if (fetchedRef.current && responseData) return; // already fetched
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      // apiFetch automatically handles credentials and JSON parsing
      const json = await apiFetch(endpoint, {
        method,
      });
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      setStatusCode(200); // apiFetch throws on non-ok statuses
      setResponseData(json);
      fetchedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setStatusCode(500); // approximate if unknown
    } finally {
      setLoading(false);
    }
  }, [endpoint, method, responseData]);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && !responseData && !loading) {
      fetchLive();
    }
  };

  const handleCopy = async () => {
    if (!responseData) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API unavailable */
    }
  };

  const formattedJson = responseData ? JSON.stringify(responseData, null, 2) : null;

  const statusColor =
    statusCode && statusCode < 300
      ? "#22c55e"
      : statusCode && statusCode < 500
        ? "#f59e0b"
        : "#ef4444";

  return (
    <div className="api-viewer">
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
        style={{
          background: isOpen ? `${accentColor}15` : "rgba(25, 20, 45, 0.6)",
          border: `1px solid ${isOpen ? `${accentColor}50` : "rgba(100, 100, 140, 0.2)"}`,
          color: isOpen ? accentColor : "#a0a0b0",
        }}
      >
        <span className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          View API Response
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className="mt-3 rounded-xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(10, 8, 20, 0.95) 0%, rgba(15, 12, 30, 0.95) 100%)",
                border: `1px solid ${accentColor}25`,
              }}
            >
              {/* Header Bar — mimics a terminal */}
              <div
                className="flex items-center justify-between px-4 py-2.5 border-b"
                style={{ borderColor: "rgba(100, 100, 140, 0.15)" }}
              >
                <div className="flex items-center gap-3">
                  {/* Traffic lights */}
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>

                  {/* Method + Path */}
                  <code className="text-xs font-mono">
                    <span className="text-green-400 font-bold">{method}</span>{" "}
                    <span className="text-gray-400">{endpoint}</span>
                  </code>
                </div>

                <div className="flex items-center gap-2">
                  {/* Latency */}
                  {latency !== null && (
                    <span className="text-[10px] font-mono text-gray-500">{latency}ms</span>
                  )}

                  {/* Status badge */}
                  {statusCode !== null && (
                    <span
                      className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full"
                      style={{
                        background: `${statusColor}20`,
                        color: statusColor,
                        border: `1px solid ${statusColor}40`,
                      }}
                    >
                      {statusCode}
                    </span>
                  )}

                  {/* Copy button */}
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md transition-colors"
                    style={{ background: "rgba(100, 100, 140, 0.1)" }}
                    title="Copy JSON"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="relative">
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${accentColor}60`, borderTopColor: "transparent" }} />
                    <span className="ml-3 text-xs text-gray-500 font-mono">Fetching live response…</span>
                  </div>
                )}

                {error && (
                  <div className="px-4 py-4 text-xs font-mono text-red-400">
                    Error: {error}
                  </div>
                )}

                {formattedJson && !loading && (
                  <pre
                    className="px-4 py-4 text-xs font-mono leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-thin"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlightJson(formattedJson)) }}
                    style={{ color: 'var(--foreground-hex, #e2e8f0)' }}
                  />
                )}
              </div>

              {/* Footer — "Proof of Work" tagline */}
              <div
                className="flex items-center justify-between px-4 py-2 border-t text-[10px] font-mono"
                style={{ borderColor: "rgba(100, 100, 140, 0.15)" }}
              >
                <span className="flex items-center gap-1.5 text-gray-600">
                  <Code2 className="w-3 h-3" />
                  Live data from my REST API — not hard-coded
                </span>
                <a
                  href={`${API_BASE_URL}${endpoint}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 transition-colors"
                  style={{ color: accentColor }}
                >
                  Open raw
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
