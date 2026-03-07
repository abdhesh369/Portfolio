import { api } from "@portfolio/shared";
import { apiFetch } from "@/lib/api-helpers";
import type { InsertMindset } from "@portfolio/shared/schema";
import { useAdminMutation } from "../admin/use-admin-mutation";

export function useCreateMindset() {
    return useAdminMutation({
        mutationKey: ["create-mindset"],
        queryKeyToInvalidate: ["mindset"],
        successTitle: "Principle created",
        successDescription: "The mindset principle has been added successfully.",
        mutationFn: async (data: InsertMindset) => {
            const res = await apiFetch(api.mindset.create.path, {
                method: api.mindset.create.method,
                body: JSON.stringify(data),
            });
            return api.mindset.create.responses[201].parse(res);
        },
    });
}

export function useUpdateMindset() {
    return useAdminMutation({
        mutationKey: ["update-mindset"],
        queryKeyToInvalidate: ["mindset"],
        successTitle: "Principle updated",
        successDescription: "The mindset principle has been updated successfully.",
        mutationFn: async ({ id, data }: { id: number; data: Partial<InsertMindset> }) => {
            const res = await apiFetch(api.mindset.update.path.replace(":id", id.toString()), {
                method: api.mindset.update.method,
                body: JSON.stringify(data),
            });
            return api.mindset.update.responses[200].parse(res);
        },
    });
}

export function useDeleteMindset() {
    return useAdminMutation({
        mutationKey: ["delete-mindset"],
        queryKeyToInvalidate: ["mindset"],
        successTitle: "Principle deleted",
        successDescription: "The mindset principle has been removed.",
        mutationFn: async (id: number) => {
            await apiFetch(api.mindset.delete.path.replace(":id", id.toString()), {
                method: api.mindset.delete.method,
            });
        },
    });
}
