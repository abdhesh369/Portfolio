import { useEffect, useRef, useState } from "react";

export function useVisitorCount() {
    const [count, setCount] = useState<number>(0);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 5;

        function connect() {
            const backendUrl = import.meta.env.VITE_API_URL;
            const streamUrl = backendUrl
                ? `${backendUrl.replace(/\/$/, "")}/api/v1/analytics/live-visitors`
                : "/api/v1/analytics/live-visitors";

            const eventSource = new EventSource(streamUrl, {
                withCredentials: true,
            });

            eventSourceRef.current = eventSource;

            eventSource.addEventListener("count", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (typeof data.count === "number") {
                        setCount(data.count);
                    }
                } catch (err) {
                    console.error("Error parsing visitor count:", err);
                }
            });

            eventSource.onerror = () => {
                eventSource.close();
                eventSourceRef.current = null;

                if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(connect, 2000 * retryCount);
                }
            };
        }

        connect();

        return () => {
            eventSourceRef.current?.close();
            eventSourceRef.current = null;
        };
    }, []);

    return count;
}
