import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-helpers";

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics-summary"],
    queryFn: async () => {
      const url = `${API_BASE_URL}/api/v1/analytics/summary`;
      const res = await fetch(url, {
        credentials: 'include',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errData.message || `Failed to fetch analytics summary (${res.status})`);
      }
      return res.json();
    },
  });
}
