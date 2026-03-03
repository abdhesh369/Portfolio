import { useServerStatus, type ServerStatus } from "@/hooks/use-server-status";
import { m, AnimatePresence } from "framer-motion";

const MESSAGES: Record<Exclude<ServerStatus, "online" | "checking">, { text: string; icon: string }> = {
  waking: {
    text: "Server is waking up — hang tight, this usually takes ~30 seconds…",
    icon: "⏳",
  },
  offline: {
    text: "Server is currently offline. Retrying automatically…",
    icon: "⚠️",
  },
};

/**
 * Fixed-top banner that shows while the backend is cold-starting or unreachable.
 * Automatically disappears with a smooth exit when /health returns 200 OK.
 */
export function ServerStatusBanner() {
  const status = useServerStatus();

  const visible = status === "waking" || status === "offline";

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          key="server-status"
          role="status"
          aria-live="polite"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={`server-status-banner ${status === "offline" ? "server-status-banner--offline" : "server-status-banner--waking"}`}
        >
          <span className="server-status-banner__icon">{MESSAGES[status].icon}</span>
          <span className="server-status-banner__text">{MESSAGES[status].text}</span>
          <span className="server-status-banner__pulse" />
        </m.div>
      )}
    </AnimatePresence>
  );
}
