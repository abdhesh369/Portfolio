import { useAdminMutation } from "./use-admin-mutation";
import { api } from "@portfolio/shared/routes";
import { apiFetch } from "@/lib/api-helpers";
import { useSkills } from "../portfolio/use-skills";
import { useQueryClient } from "@tanstack/react-query";
import type { Skill } from "@portfolio/shared/schema";

export function useAdminSkills() {
    const queryClient = useQueryClient();
    const { refetch } = useSkills();

    const createMutation = useAdminMutation({
        route: api.skills.create,
        queryKeyToInvalidate: ["skills"],
        successTitle: "Skill created",
        successDescription: "The skill has been added successfully.",
        mutationFn: async (data: any) => {
            const res = await apiFetch(api.skills.create.path, {
                method: api.skills.create.method,
                body: JSON.stringify(data),
            });
            return api.skills.create.responses[201].parse(res);
        },
    });

    const updateMutation = useAdminMutation({
        route: api.skills.update,
        queryKeyToInvalidate: ["skills"],
        successTitle: "Skill updated",
        successDescription: "The skill details have been saved.",
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            const res = await apiFetch(api.skills.update.path.replace(":id", id.toString()), {
                method: api.skills.update.method,
                body: JSON.stringify(data),
            });
            return api.skills.update.responses[200].parse(res);
        },
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ["skills"] });
            const previous = queryClient.getQueryData<Skill[]>(["skills"]);
            queryClient.setQueryData<Skill[]>(["skills"], (old) =>
                old ? old.map((p) => (p.id === id ? { ...p, ...data } : p)) : []
            );
            return { previous };
        },
        onError: (_err, _vars, context: any) => {
            if (context?.previous) {
                queryClient.setQueryData(["skills"], context.previous);
            }
        },
    });

    const deleteMutation = useAdminMutation({
        route: api.skills.delete,
        queryKeyToInvalidate: ["skills"],
        successTitle: "Skill deleted",
        successDescription: "The skill has been removed.",
        mutationFn: async (id: number) => {
            await apiFetch(api.skills.delete.path.replace(":id", id.toString()), {
                method: api.skills.delete.method,
            });
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["skills"] });
            const previous = queryClient.getQueryData<Skill[]>(["skills"]);
            queryClient.setQueryData<Skill[]>(["skills"], (old) =>
                old ? old.filter((p) => p.id !== id) : []
            );
            return { previous };
        },
        onError: (_err, _vars, context: any) => {
            if (context?.previous) {
                queryClient.setQueryData(["skills"], context.previous);
            }
        },
    });

    const bulkDeleteMutation = useAdminMutation({
        route: api.skills.bulkDelete,
        queryKeyToInvalidate: ["skills"],
        successTitle: "Skills deleted",
        successDescription: "Selected skills have been removed.",
        mutationFn: async (ids: number[]) => {
            await apiFetch(api.skills.bulkDelete.path, {
                method: api.skills.bulkDelete.method,
                body: JSON.stringify({ ids }),
            });
        },
    });

    return {
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        bulkDelete: bulkDeleteMutation.mutateAsync,
        isPending:
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending ||
            bulkDeleteMutation.isPending,
        refetch,
    };
}
