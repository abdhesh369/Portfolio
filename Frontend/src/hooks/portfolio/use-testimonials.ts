import { api } from "@portfolio/shared/routes";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: () =>
      fetchAndParse(
        api.testimonials.list.path,
        api.testimonials.list.responses[200],
        "Failed to fetch testimonials"
      ),
  });
}
