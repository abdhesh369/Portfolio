import { useEffect } from "react";
import { useLocation } from "wouter";
import { API_BASE_URL } from "@/lib/api-helpers";

// Local cache to prevent double-tracking across remounts within the same session
let lastTrackedPath: string | null = null;

export function AnalyticsTracker() {
    const [location] = useLocation();

    useEffect(() => {
        // Prevent duplicate tracking for the same path in strict mode or rapid navigation
        if (lastTrackedPath === location) return;
        lastTrackedPath = location;

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

                await fetch(`${API_BASE_URL}/api/v1/analytics/track`, {
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
        const win = window as unknown as { gtag?: (event: string, action: string, params: Record<string, unknown>) => void };
        if (win.gtag) {
            win.gtag("event", "page_view", {
                page_path: location,
            });
        }
    }, [location]);

    return null;
}

// Simple helpers for tracking
function getBrowser(ua: string) {
    if (ua.includes("Edg")) return "Edge"; // Edge UA contains "Edg" (not "Edge") — must check before Chrome
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
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
