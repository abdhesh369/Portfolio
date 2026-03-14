import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-helpers";
import type { SiteSettings, InsertSiteSettings } from "@portfolio/shared";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useSiteSettings() {
    return useQuery<SiteSettings>({
        queryKey: QUERY_KEYS.settings(),
        queryFn: () => apiFetch("/api/v1/settings"),
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useUpdateSiteSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: InsertSiteSettings) => {
            return apiFetch("/api/v1/settings", {
                method: "PATCH",
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings() });
        },
    });
}
