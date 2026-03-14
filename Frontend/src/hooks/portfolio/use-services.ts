import { api } from "@portfolio/shared";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useServices() {
  return useQuery({
    queryKey: QUERY_KEYS.services.all,
    queryFn: () =>
      fetchAndParse(
        api.services.list.path,
        api.services.list.responses[200],
        "Failed to fetch services"
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
