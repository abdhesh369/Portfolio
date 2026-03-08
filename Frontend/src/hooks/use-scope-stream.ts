import { useEffect, useRef, useState } from "react";

export interface ScopeEstimation {
    summary: string;
    hours: { min: number; max: number };
    cost: { min: number; max: number; currency: string };
    milestones: Array<{
        title: string;
        description: string;
        duration: string;
    }>;
    techSuggestions: string[];
}

export interface ScopeStreamEvent {
    status: "processing" | "completed" | "failed";
    progress?: number;
    message?: string;
    estimation?: ScopeEstimation;
    error?: string;
}

/**
 * Hook for subscribing to Scope Estimation SSE stream.
 */
export function useScopeStream(id: string | null) {
    const [status, setStatus] = useState<"idle" | "connecting" | "processing" | "completed" | "failed">("idle");
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("");
    const [estimation, setEstimation] = useState<ScopeEstimation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (!id) {
            // Reset if ID is cleared
            setStatus("idle");
            setProgress(0);
            setMessage("");
            setEstimation(null);
            setError(null);
            return;
        }

        setStatus("connecting");
        setError(null);

        const backendUrl = import.meta.env.VITE_API_URL || "";
        const streamUrl = `${backendUrl.replace(/\/$/, "")} /api/v1 / scope / stream / ${id} `;

        const eventSource = new EventSource(streamUrl, {
            withCredentials: true,
        });
        eventSourceRef.current = eventSource;

        eventSource.addEventListener("progress", (event) => {
            const data = JSON.parse(event.data);
            setStatus("processing");
            if (data.progress !== undefined) setProgress(data.progress);
            if (data.message) setMessage(data.message);
        });

        eventSource.addEventListener("completed", (event) => {
            const data = JSON.parse(event.data);
            setStatus("completed");
            setProgress(100);
            if (data.estimation) setEstimation(data.estimation);
            eventSource.close();
        });

        eventSource.addEventListener("failed", (event) => {
            const data = JSON.parse(event.data);
            setStatus("failed");
            setError(data.error || "Estimation failed");
            eventSource.close();
        });

        eventSource.onerror = (err) => {
            console.error("SSE Error:", err);
            // Don't immediately fail, let the browser handle reconnections unless it's a 404/terminal error
            // However, for this specific flow, a disconnect might mean we should show an error
            if (status !== "completed" && status !== "failed") {
                setStatus("failed");
                setError("Connection lost. Please check your internet and try again.");
            }
            eventSource.close();
        };

        return () => {
            eventSource.close();
            eventSourceRef.current = null;
        };
    }, [id]);

    return { status, progress, message, estimation, error };
}
