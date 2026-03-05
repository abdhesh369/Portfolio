import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-helpers";

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics-summary"],
    queryFn: async () => {
      const res = await apiFetch("/api/v1/analytics/summary");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errData.message || `Failed to fetch analytics summary (${res.status})`);
      }
      return res.json();
    },
  });
}

export function useVitalsSummary(days: number = 7) {
  return useQuery({
    queryKey: ["vitals-summary", days],
    queryFn: async () => {
      const res = await apiFetch(`/api/v1/analytics/vitals?days=${days}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errData.message || `Failed to fetch vitals summary (${res.status})`);
      }
      return res.json();
    },
  });
}

