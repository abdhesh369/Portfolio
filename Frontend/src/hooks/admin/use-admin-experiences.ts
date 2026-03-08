import { useAdminMutation } from "./use-admin-mutation";
import { api, interpolatePath, type Experience } from "@portfolio/shared";
import { apiFetch } from "@/lib/api-helpers";
import { useExperiences } from "../portfolio";
import { useQueryClient } from "@tanstack/react-query";

export function useAdminExperiences() {
    const { refetch } = useExperiences();
    const queryClient = useQueryClient();

    const createMutation = useAdminMutation({
        route: api.experiences.create,
        queryKeyToInvalidate: ["experiences"],
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
            await queryClient.cancelQueries({ queryKey: ["experiences"] });
            const previousExperiences = queryClient.getQueryData<Experience[]>(["experiences"]);
            queryClient.setQueryData<Experience[]>(["experiences"], (old) =>
                old ? old.map((e) => (e.id === id ? { ...e, ...data } : e)) : []
            );
            return { previousExperiences };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousExperiences) {
                queryClient.setQueryData(["experiences"], context.previousExperiences);
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
        queryKeyToInvalidate: ["experiences"],
        successTitle: "Experience deleted",
        successDescription: "The experience has been removed.",
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["experiences"] });
            const previousExperiences = queryClient.getQueryData<Experience[]>(["experiences"]);
            queryClient.setQueryData<Experience[]>(["experiences"], (old) =>
                old ? old.filter((e) => e.id !== id) : []
            );
            return { previousExperiences };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousExperiences) {
                queryClient.setQueryData(["experiences"], context.previousExperiences);
            }
        },
        mutationFn: async (id: number) => {
            await apiFetch(interpolatePath(api.experiences.delete.path, { id }), {
                method: api.experiences.delete.method,
            });
        },
    });

    return {
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        isPending:
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending,
        refetch,
    };
}
