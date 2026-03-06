import { api } from "@portfolio/shared/routes";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () =>
      fetchAndParse(
        api.services.list.path,
        api.services.list.responses[200],
        "Failed to fetch services"
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
