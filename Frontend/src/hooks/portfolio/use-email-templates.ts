import { api } from "#shared";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParse } from "./_fetch-helper";
import { apiFetch } from "#src/lib/api-helpers";
import type { EmailTemplate } from "#shared/schema";
import { useAdminMutation } from "../admin/use-admin-mutation";

export function useEmailTemplates() {
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

    const createMutation = useAdminMutation({
        mutationKey: ["create-email-template"],
        queryKeyToInvalidate: queryKey,
        successTitle: "Template created",
        successDescription: "The email template has been created successfully.",
        mutationFn: async (data: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">) => {
            return apiFetch(api.emailTemplates.list.path, {
                method: "POST",
                body: JSON.stringify(data),
            });
        },
    });

    const updateMutation = useAdminMutation({
        mutationKey: ["update-email-template"],
        queryKeyToInvalidate: queryKey,
        successTitle: "Template updated",
        successDescription: "The email template has been updated successfully.",
        mutationFn: async ({ id, data }: { id: number; data: Partial<EmailTemplate> }) => {
            return apiFetch(`${api.emailTemplates.list.path}/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
        },
    });

    const deleteMutation = useAdminMutation({
        mutationKey: ["delete-email-template"],
        queryKeyToInvalidate: queryKey,
        successTitle: "Template deleted",
        successDescription: "The email template has been removed.",
        mutationFn: async (id: number) => {
            return apiFetch(`${api.emailTemplates.list.path}/${id}`, {
                method: "DELETE",
            });
        },
    });

    return {
        ...query,
        createMutation,
        updateMutation,
        deleteMutation,
    };
}
