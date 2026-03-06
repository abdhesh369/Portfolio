import { api } from "@portfolio/shared/routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";
import { apiFetch } from "@/lib/api-helpers";
import type { EmailTemplate } from "@portfolio/shared/schema";

export function useEmailTemplates() {
    const queryClient = useQueryClient();
    const queryKey = ["email-templates"];

    const query = useQuery({
        queryKey,
        queryFn: () =>
            fetchAndParse(
                api.emailTemplates.list.path,
                api.emailTemplates.list.responses[200],
                "Failed to fetch email templates"
            ),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const createMutation = useMutation({
        mutationFn: async (data: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">) => {
            return apiFetch(api.emailTemplates.list.path, {
                method: "POST",
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<EmailTemplate> }) => {
            return apiFetch(`${api.emailTemplates.list.path}/${id}`, {
                method: "PATCH", // Using PATCH as per typical update, or PUT if the API requires that. Let's assume PATCH or PUT works since the original code used PUT
                // wait, original used PUT:
                // await apiFetch(`/api/v1/email-templates/${editing.id}`, { method: "PUT", body: JSON.stringify(editing) });
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // Redefining proper PUT
    const updateMutationFixed = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<EmailTemplate> }) => {
            return apiFetch(`${api.emailTemplates.list.path}/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });


    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return apiFetch(`${api.emailTemplates.list.path}/${id}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    return {
        ...query,
        createMutation,
        updateMutation: updateMutationFixed,
        deleteMutation,
    };
}
