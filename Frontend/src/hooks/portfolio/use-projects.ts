import { api } from "@portfolio/shared/routes";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () =>
      fetchAndParse(
        api.projects.list.path,
        api.projects.list.responses[200],
        "Failed to fetch projects"
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
