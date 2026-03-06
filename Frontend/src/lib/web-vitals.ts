/**
 * Core Web Vitals collection & reporting
 * Collects LCP, CLS, INP, FCP, TTFB and sends to backend.
 */
import { onLCP, onCLS, onINP, onFCP, onTTFB, type Metric } from 'web-vitals';

const VITALS_ENDPOINT = '/api/v1/analytics/vitals';

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    LCP: [2500, 4000],
    CLS: [0.1, 0.25],
    INP: [200, 500],
    FCP: [1800, 3000],
    TTFB: [800, 1800],
  };
  const [good, poor] = thresholds[name] || [Infinity, Infinity];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

function sendVital(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    rating: getRating(metric.name, metric.value),
    path: window.location.pathname,
  });

  // Use sendBeacon for reliability, fall back to fetch
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(VITALS_ENDPOINT, blob);
  } else {
    fetch(VITALS_ENDPOINT, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {
      // Silently fail — vitals reporting is best-effort
    });
  }
}

export function initWebVitals() {
  onLCP(sendVital);
  onCLS(sendVital);
  onINP(sendVital);
  onFCP(sendVital);
  onTTFB(sendVital);
}
