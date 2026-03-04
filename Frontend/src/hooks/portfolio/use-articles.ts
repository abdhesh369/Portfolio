import { api } from "@shared/routes";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";

export function useArticles(status?: string) {
  return useQuery({
    queryKey: ["articles", status],
    queryFn: () =>
      fetchAndParse(
        api.articles.list.path + (status ? `?status=${status}` : ""),
        api.articles.list.responses[200],
        "Failed to fetch articles"
      ),
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: () =>
      fetchAndParse(
        api.articles.get.path.replace(":slug", slug),
        api.articles.get.responses[200],
        "Failed to fetch article"
      ),
    enabled: !!slug,
  });
}
