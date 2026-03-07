import { api } from "@portfolio/shared";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";
import type { Article } from "@portfolio/shared/schema";

export function useArticles(status?: string) {
  return useQuery({
    queryKey: ["articles", status],
    queryFn: () =>
      fetchAndParse(
        api.articles.list.path + (status ? `?status=${status}` : ""),
        api.articles.list.responses[200],
        "Failed to fetch articles"
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useArticleSearch(query: string) {
  return useQuery<Article[]>({
    queryKey: ["articles", "search", query],
    queryFn: async () => {
      const { apiFetch } = await import("@/lib/api-helpers");
      return await apiFetch(`/api/v1/articles/search?q=${encodeURIComponent(query)}`);
    },
    enabled: query.trim().length >= 2,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

