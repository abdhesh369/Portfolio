import { api, type Project } from "@portfolio/shared";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";
import { QUERY_KEYS } from "@/lib/query-keys";
import { usePersona } from "../use-persona";

export function useProjects(sortBy: string = "default") {
  const { isDevMode } = usePersona();

  return useQuery({
    queryKey: [...QUERY_KEYS.projects.list(sortBy), isDevMode],
    queryFn: async () => {
      const projects = await fetchAndParse(
        `${api.projects.list.path}${sortBy !== "default" ? `?sort=${sortBy}` : ""}${isDevMode ? `${sortBy !== "default" ? "&" : "?"}secret=revealed` : ""}`,
        api.projects.list.responses[200],
        "Failed to fetch projects"
      ) as Project[];
      return projects;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useProjectById(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.detail(id),
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
