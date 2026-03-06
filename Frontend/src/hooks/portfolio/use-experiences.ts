import { api } from "@portfolio/shared/routes";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";

export function useExperiences() {
  return useQuery({
    queryKey: ["experiences"],
    queryFn: () =>
      fetchAndParse(
        api.experiences.list.path,
        api.experiences.list.responses[200],
        "Failed to fetch experiences"
      ),
  });
}
