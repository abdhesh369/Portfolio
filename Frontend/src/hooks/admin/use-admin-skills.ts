import { useAdminMutation } from "./use-admin-mutation";
import { api, interpolatePath, type Skill } from "@portfolio/shared";
import { apiFetch } from "@/lib/api-helpers";
import { useSkills } from "../portfolio";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useAdminSkills() {
    const queryClient = useQueryClient();
    const { refetch } = useSkills();

    const createMutation = useAdminMutation({
        route: api.skills.create,
        queryKeyToInvalidate: QUERY_KEYS.skills.all,
        successTitle: "Skill created",
        successDescription: "The skill has been added successfully.",
        mutationFn: async (data: Partial<Skill>) => {
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
        mutationFn: async ({ id, data }: { id: number; data: Partial<Skill> }) => {
            const res = await apiFetch(interpolatePath(api.skills.update.path, { id }), {
                method: api.skills.update.method,
                body: JSON.stringify(data),
            });
            return api.skills.update.responses[200].parse(res);
        },
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.skills.all });
            const previous = queryClient.getQueryData<Skill[]>(QUERY_KEYS.skills.all);
            queryClient.setQueryData<Skill[]>(QUERY_KEYS.skills.all, (old) =>
                old ? old.map((p) => (p.id === id ? { ...p, ...data } : p)) : []
            );
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(QUERY_KEYS.skills.all, context.previous);
            }
        },
    });

    const deleteMutation = useAdminMutation({
        route: api.skills.delete,
        queryKeyToInvalidate: ["skills"],
        successTitle: "Skill deleted",
        successDescription: "The skill has been removed.",
        mutationFn: async (id: number) => {
            await apiFetch(interpolatePath(api.skills.delete.path, { id }), {
                method: api.skills.delete.method,
            });
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.skills.all });
            const previous = queryClient.getQueryData<Skill[]>(QUERY_KEYS.skills.all);
            queryClient.setQueryData<Skill[]>(QUERY_KEYS.skills.all, (old) =>
                old ? old.filter((p) => p.id !== id) : []
            );
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(QUERY_KEYS.skills.all, context.previous);
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
