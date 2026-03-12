import { api } from "@portfolio/shared";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";

export function useProjects(sortBy: string = "default") {
  return useQuery({
    queryKey: ["projects", sortBy],
    queryFn: () =>
      fetchAndParse(
        `${api.projects.list.path}${sortBy !== "default" ? `?sort=${sortBy}` : ""}`,
        api.projects.list.responses[200],
        "Failed to fetch projects"
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useProjectById(id: number | null) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () =>
      fetchAndParse(
        api.projects.get.path.replace(":id", id?.toString() || ""),
        api.projects.get.responses[200],
        "Failed to fetch project"
      ),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5,
  });
}
