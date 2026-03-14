import { api } from "@portfolio/shared";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";
import { QUERY_KEYS } from "@/lib/query-keys";
import { API_BASE_URL } from "@/lib/api-helpers";

export function useSkills() {
  return useQuery({
    queryKey: QUERY_KEYS.skills.all,
    queryFn: () =>
      fetchAndParse(
        api.skills.list.path,
        api.skills.list.responses[200],
        "Failed to fetch skills"
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useEndorseSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (skillId: number) => {
      const res = await fetch(`${API_BASE_URL}/api/v1/skills/${skillId}/endorse`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to endorse skill");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.skills.all });
    },
  });
}

export function useSkillConnections() {
  return useQuery({
    queryKey: QUERY_KEYS.skills.connections,
    queryFn: () =>
      fetchAndParse(
        api.skills.connections.path,
        api.skills.connections.responses[200],
        "Failed to fetch skill connections"
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMindset() {
  return useQuery({
    queryKey: QUERY_KEYS.mindset.all,
    queryFn: () =>
      fetchAndParse(
        api.mindset.list.path,
        api.mindset.list.responses[200],
        "Failed to fetch mindset principles"
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
