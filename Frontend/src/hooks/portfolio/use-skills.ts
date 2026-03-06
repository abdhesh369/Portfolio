import { api } from "@portfolio/shared/routes";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";

export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: () =>
      fetchAndParse(
        api.skills.list.path,
        api.skills.list.responses[200],
        "Failed to fetch skills"
      ),
  });
}

export function useSkillConnections() {
  return useQuery({
    queryKey: ["skill-connections"],
    queryFn: () =>
      fetchAndParse(
        api.skills.connections.path,
        api.skills.connections.responses[200],
        "Failed to fetch skill connections"
      ),
  });
}

export function useMindset() {
  return useQuery({
    queryKey: ["mindset"],
    queryFn: () =>
      fetchAndParse(
        api.mindset.list.path,
        api.mindset.list.responses[200],
        "Failed to fetch mindset principles"
      ),
  });
}
