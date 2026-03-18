import { api } from "@portfolio/shared";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";
import type { Article } from "@portfolio/shared/schema";
import { QUERY_KEYS } from "@/lib/query-keys";
import { usePersona } from "../use-persona";

export function useArticles(status?: string) {
  const { isDevMode } = usePersona();

  return useQuery({
    queryKey: [...QUERY_KEYS.articles.list(status), isDevMode],
    queryFn: async () => {
      const articles: Article[] = await fetchAndParse(
        api.articles.list.path + (status ? `?status=${status}` : "") + (isDevMode ? `${status ? "&" : "?"}secret=revealed` : ""),
        api.articles.list.responses[200],
        "Failed to fetch articles"
      );
      return articles;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.articles.detail(slug),
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
    queryKey: QUERY_KEYS.articles.search(query),
    queryFn: async () => {
      const { apiFetch } = await import("@/lib/api-helpers");
      return await apiFetch(`/api/v1/articles/search?q=${encodeURIComponent(query)}`);
    },
    enabled: query.trim().length >= 2,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
export function useArticleReactions(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.articles.reactions(slug),
    queryFn: async () => {
      const article = await fetchAndParse(
        api.articles.get.path.replace(":slug", slug),
        api.articles.get.responses[200],
        "Failed to fetch reactions"
      );
      return (article as Article).reactions;
    },
    enabled: !!slug,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useReactToArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, emoji }: { id: number; emoji: string }) => {
      const { apiFetch } = await import("@/lib/api-helpers");
      return await apiFetch(`/api/v1/articles/${id}/react`, {
        method: "POST",
        body: JSON.stringify({ emoji }),
      });
    },
    onSuccess: () => {
      // Invalidate both reactions and the main article query
      queryClient.invalidateQueries({ queryKey: ["adminArticles"] });
    },
  });
}
