import { api } from "#shared";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";
import { QUERY_KEYS } from "#src/lib/query-keys";

export function useTestimonials() {
  return useQuery({
    queryKey: QUERY_KEYS.testimonials.all,
    queryFn: () =>
      fetchAndParse(
        api.testimonials.list.path,
        api.testimonials.list.responses[200],
        "Failed to fetch testimonials"
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
