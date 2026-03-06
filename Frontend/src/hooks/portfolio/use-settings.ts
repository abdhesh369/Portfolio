import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@portfolio/shared/routes";
import { apiFetch } from "@/lib/api-helpers";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to fetch site settings
 */
export function useSiteSettings() {
    return useQuery({
        queryKey: ["site-settings"],
        queryFn: async () => {
            const data = await apiFetch(api.settings.get.path);
            return api.settings.get.responses[200].parse(data);
        },
    });
}

/**
 * Hook to update site settings
 */
export function useUpdateSiteSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: any) => {
            const data = await apiFetch(api.settings.update.path, {
                method: api.settings.update.method,
                body: JSON.stringify(input),
            });

            return api.settings.update.responses[200].parse(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["site-settings"] });
            toast({
                title: "Success",
                description: "Site settings updated successfully",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}
