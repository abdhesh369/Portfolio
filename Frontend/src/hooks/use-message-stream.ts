import { useEffect, useRef, useState, useCallback } from "react";
import { apiFetch } from "../lib/api-helpers";

interface SSEMessage {
  id: number;
  name: string;
  subject: string;
  createdAt: string;
}

/**
 * TICKET-031: Hook for subscribing to SSE message notifications.
 * Falls back to polling every 60s if SSE fails.
 */
export function useMessageStream(enabled: boolean = true) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const fallbackRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const resetUnread = useCallback(() => setUnreadCount(0), []);

  useEffect(() => {
    if (!enabled) return;

    let retryCount = 0;
    const maxRetries = 3;

    function connect() {
      try {
        const es = new EventSource("/api/v1/messages/stream", { withCredentials: true });
        eventSourceRef.current = es;

        es.addEventListener("new-message", (event) => {
          const data: SSEMessage = JSON.parse(event.data);
          setUnreadCount((c) => c + 1);
          setLastMessage(data);

          // Browser notification if permission granted
          if (Notification.permission === "granted") {
            new Notification("New Message", {
              body: `${data.name}: ${data.subject || "No subject"}`,
              icon: "/icons/pwa-192x192.png",
            });
          }
        });

        es.addEventListener("connected", () => {
          retryCount = 0; // Reset on successful connection
        });

        es.onerror = () => {
          es.close();
          eventSourceRef.current = null;

          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(connect, 5000 * retryCount);
          } else {
            // Fallback to polling
            startPolling();
          }
        };
      } catch {
        startPolling();
      }
    }

    function startPolling() {
      // Simple fallback: poll message count every 60s
      let lastKnownCount = 0;

      async function poll() {
        try {
          const messages = await apiFetch("/api/v1/messages");
          if (Array.isArray(messages) && messages.length > lastKnownCount) {
            const newCount = messages.length - lastKnownCount;
            if (lastKnownCount > 0) {
              setUnreadCount((c) => c + newCount);
            }
            lastKnownCount = messages.length;
          }
        } catch {
          // Silently fail
        }
      }

      poll();
      fallbackRef.current = setInterval(poll, 60_000);
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    connect();

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      if (fallbackRef.current) clearInterval(fallbackRef.current);
    };
  }, [enabled]);

  return { unreadCount, lastMessage, resetUnread };
}
