import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-helpers";

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics-summary"],
    queryFn: async () => {
      return await apiFetch("/api/v1/analytics/summary");
    },
  });
}

export function useVitalsSummary(days: number = 7) {
  return useQuery({
    queryKey: ["vitals-summary", days],
    queryFn: async () => {
      return await apiFetch(`/api/v1/analytics/vitals?days=${days}`);
    },
  });
}

