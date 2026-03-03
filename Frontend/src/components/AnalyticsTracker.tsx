import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { API_BASE_URL } from "@/lib/api-helpers";

export function AnalyticsTracker() {
    const [location] = useLocation();

    const lastTrackedPath = useRef<string | null>(null);

    useEffect(() => {
        // Prevent duplicate tracking for the same path in strict mode or rapid navigation
        if (lastTrackedPath.current === location) return;
        lastTrackedPath.current = location;

        // 0. Bot Filtering: Don't track crawlers or automated tools
        if (/bot|crawler|spider|preview|lighthouse|googlebot|bingbot|yandex|slurp|duckduckgo/i.test(navigator.userAgent)) {
            return;
        }

        // 1. Log to our own backend
        const trackPageView = async () => {
            try {
                const userAgent = navigator.userAgent;
                const info = {
                    type: "page_view",
                    path: location,
                    browser: getBrowser(userAgent),
                    os: getOS(userAgent),
                    device: /Mobi|Android/i.test(userAgent) ? "mobile" : "desktop",
                };

                await fetch(`${API_BASE_URL}/api/analytics/track`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(info),
                });
            } catch (err) {
                console.warn("Analytics tracking failed:", err);
            }
        };

        trackPageView();

        // 2. Log to Google Analytics if gtag is available
        if ((window as any).gtag) {
            (window as any).gtag("event", "page_view", {
                page_path: location,
            });
        }
    }, [location]);

    return null;
}

// Simple helpers for tracking
function getBrowser(ua: string) {
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "Unknown";
}

function getOS(ua: string) {
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac OS")) return "MacOS";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
    if (ua.includes("Linux")) return "Linux";
    return "Unknown";
}
