import { useServerStatus, type ServerStatus } from "@/hooks/use-server-status";

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
 * Automatically disappears when /health returns 200 OK.
 */
export function ServerStatusBanner() {
  const status = useServerStatus();

  // Nothing to show when the server is online or during the initial check
  if (status === "online" || status === "checking") return null;

  const { text, icon } = MESSAGES[status];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`server-status-banner ${status === "offline" ? "server-status-banner--offline" : "server-status-banner--waking"}`}
    >
      <span className="server-status-banner__icon">{icon}</span>
      <span className="server-status-banner__text">{text}</span>
      <span className="server-status-banner__pulse" />
    </div>
  );
}
