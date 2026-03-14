import { api } from "@portfolio/shared";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useExperiences() {
  return useQuery({
    queryKey: QUERY_KEYS.experiences.all,
    queryFn: () =>
      fetchAndParse(
        api.experiences.list.path,
        api.experiences.list.responses[200],
        "Failed to fetch experiences"
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
