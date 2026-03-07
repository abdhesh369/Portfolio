import { API_BASE_URL } from "./api-helpers";

export type AnalyticsEvent = {
    type: string;
    path?: string;
    [key: string]: unknown;
};

declare global {
    interface Window {
        gtag?: (command: string, action: string, params?: unknown) => void;
    }
}

export async function trackEvent(event: AnalyticsEvent) {
    // Bot Filtering
    if (/bot|crawler|spider|preview|lighthouse|googlebot|bingbot|yandex|slurp|duckduckgo/i.test(navigator.userAgent)) {
        return;
    }

    try {
        const userAgent = navigator.userAgent;
        const info = {
            path: window.location.pathname,
            browser: getBrowser(userAgent),
            os: getOS(userAgent),
            device: /Mobi|Android/i.test(userAgent) ? "mobile" : "desktop",
            ...event,
        };

        await fetch(`${API_BASE_URL}/api/v1/analytics/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(info),
        });

        // Also log to Google Analytics if available
        if (window.gtag) {
            window.gtag("event", event.type, event);
        }
    } catch (err) {
        console.warn("Analytics tracking failed:", err);
    }
}

function getBrowser(ua: string) {
    if (ua.includes("Edg")) return "Edge";
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
