import { useEffect } from "react";
import { useLocation } from "wouter";
import { API_BASE_URL } from "@/lib/api-helpers";

export function AnalyticsTracker() {
    const [location] = useLocation();

    useEffect(() => {
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
        // GTM script is loaded once by index.html via requestIdleCallback — no duplicate here
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
