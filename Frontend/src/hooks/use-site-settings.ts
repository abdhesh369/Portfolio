import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-helpers";
import type { SiteSettings, InsertSiteSettings } from "../../shared/schema";

export function useSiteSettings() {
    return useQuery<SiteSettings>({
        queryKey: ["/api/v1/settings"],
        queryFn: () => apiFetch("/api/v1/settings"),
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
            queryClient.invalidateQueries({ queryKey: ["/api/v1/settings"] });
        },
    });
}
