import { api } from "@shared/routes";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";
import type { Article } from "@shared/schema";

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

export function useArticleSearch(query: string) {
  return useQuery<Article[]>({
    queryKey: ["articles", "search", query],
    queryFn: async () => {
      const { API_BASE_URL } = await import("@/lib/api-helpers");
      const res = await fetch(`${API_BASE_URL}/api/v1/articles/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: query.trim().length >= 2,
    placeholderData: (prev) => prev,
  });
}
