import { useEffect } from "react";
import { useLocation } from "wouter";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

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

        // 2. Log to Google Analytics if configured
        if (GA_MEASUREMENT_ID) {
            // Load script if not already present
            if (!(window as any).gtag) {
                const script = document.createElement("script");
                script.async = true;
                script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
                document.head.appendChild(script);

                (window as any).dataLayer = (window as any).dataLayer || [];
                (window as any).gtag = function () {
                    (window as any).dataLayer.push(arguments);
                };
                (window as any).gtag("js", new Date());
            }

            // Track page view
            (window as any).gtag("config", GA_MEASUREMENT_ID, {
                page_path: location,
            });

            console.log(`[GA] Tracking page view: ${location}`);
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
