import { useAdminMutation } from "./use-admin-mutation";
import { api, interpolatePath, type Experience } from "@portfolio/shared";
import { apiFetch } from "@/lib/api-helpers";
import { useExperiences } from "../portfolio";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useAdminExperiences() {
    const { refetch } = useExperiences();
    const queryClient = useQueryClient();

    const createMutation = useAdminMutation({
        route: api.experiences.create,
        queryKeyToInvalidate: QUERY_KEYS.experiences.all,
        successTitle: "Experience created",
        successDescription: "The experience has been added successfully.",
        mutationFn: async (data: Partial<Experience>) => {
            const res = await apiFetch(api.experiences.create.path, {
                method: api.experiences.create.method,
                body: JSON.stringify(data),
            });
            return api.experiences.create.responses[201].parse(res);
        },
    });

    const updateMutation = useAdminMutation({
        route: api.experiences.update,
        queryKeyToInvalidate: ["experiences"],
        successTitle: "Experience updated",
        successDescription: "The experience details have been saved.",
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.experiences.all });
            const previousExperiences = queryClient.getQueryData<Experience[]>(QUERY_KEYS.experiences.all);
            queryClient.setQueryData<Experience[]>(QUERY_KEYS.experiences.all, (old) =>
                old ? old.map((e) => (e.id === id ? { ...e, ...data } : e)) : []
            );
            return { previousExperiences };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousExperiences) {
                queryClient.setQueryData(QUERY_KEYS.experiences.all, context.previousExperiences);
            }
        },
        mutationFn: async ({ id, data }: { id: number; data: Partial<Experience> }) => {
            const res = await apiFetch(interpolatePath(api.experiences.update.path, { id }), {
                method: api.experiences.update.method,
                body: JSON.stringify(data),
            });
            return api.experiences.update.responses[200].parse(res);
        },
    });

    const deleteMutation = useAdminMutation({
        route: api.experiences.delete,
        queryKeyToInvalidate: QUERY_KEYS.experiences.all,
        successTitle: "Experience deleted",
        successDescription: "The experience has been removed.",
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.experiences.all });
            const previousExperiences = queryClient.getQueryData<Experience[]>(QUERY_KEYS.experiences.all);
            queryClient.setQueryData<Experience[]>(QUERY_KEYS.experiences.all, (old) =>
                old ? old.filter((e) => e.id !== id) : []
            );
            return { previousExperiences };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousExperiences) {
                queryClient.setQueryData(QUERY_KEYS.experiences.all, context.previousExperiences);
            }
        },
        mutationFn: async (id: number) => {
            await apiFetch(interpolatePath(api.experiences.delete.path, { id }), {
                method: api.experiences.delete.method,
            });
        },
    });

    const bulkDeleteMutation = useAdminMutation({
        route: api.experiences.bulkDelete,
        queryKeyToInvalidate: QUERY_KEYS.experiences.all,
        successTitle: "Experiences deleted",
        successDescription: "Selected experiences have been removed.",
        mutationFn: async (ids: number[]) => {
            await apiFetch(api.experiences.bulkDelete.path, {
                method: api.experiences.bulkDelete.method,
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
