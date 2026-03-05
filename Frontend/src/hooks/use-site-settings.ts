import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { SiteSettings, InsertSiteSettings } from "../../shared/schema";

export function useSiteSettings() {
    return useQuery<SiteSettings>({
        queryKey: ["/api/v1/settings"],
    });
}

export function useUpdateSiteSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: InsertSiteSettings) => {
            const res = await apiRequest("PATCH", "/api/v1/settings", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/v1/settings"] });
        },
    });
}
