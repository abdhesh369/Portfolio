import { useAdminMutation } from "./use-admin-mutation";
import { api, interpolatePath, type Mindset } from "@portfolio/shared";
import { apiFetch } from "@/lib/api-helpers";
import { useMindset } from "../portfolio";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useAdminMindset() {
    const { refetch } = useMindset();
    const queryClient = useQueryClient();

    const createMutation = useAdminMutation({
        route: api.mindset.create,
        queryKeyToInvalidate: QUERY_KEYS.mindset.all,
        successTitle: "Principle created",
        successDescription: "The mindset principle has been added successfully.",
        mutationFn: async (data: Partial<Mindset>) => {
            const res = await apiFetch(api.mindset.create.path, {
                method: api.mindset.create.method,
                body: JSON.stringify(data),
            });
            return api.mindset.create.responses[201].parse(res);
        },
    });

    const updateMutation = useAdminMutation({
        route: api.mindset.update,
        queryKeyToInvalidate: ["mindset"],
        successTitle: "Principle updated",
        successDescription: "The mindset principle has been updated successfully.",
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.mindset.all });
            const previousMindset = queryClient.getQueryData<Mindset[]>(QUERY_KEYS.mindset.all);
            queryClient.setQueryData<Mindset[]>(QUERY_KEYS.mindset.all, (old) =>
                old ? old.map((m) => (m.id === id ? { ...m, ...data } : m)) : []
            );
            return { previousMindset };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousMindset) {
                queryClient.setQueryData(QUERY_KEYS.mindset.all, context.previousMindset);
            }
        },
        mutationFn: async ({ id, data }: { id: number; data: Partial<Mindset> }) => {
            const res = await apiFetch(interpolatePath(api.mindset.update.path, { id }), {
                method: api.mindset.update.method,
                body: JSON.stringify(data),
            });
            return api.mindset.update.responses[200].parse(res);
        },
    });

    const deleteMutation = useAdminMutation({
        route: api.mindset.delete,
        queryKeyToInvalidate: QUERY_KEYS.mindset.all,
        successTitle: "Principle deleted",
        successDescription: "The mindset principle has been removed.",
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.mindset.all });
            const previousMindset = queryClient.getQueryData<Mindset[]>(QUERY_KEYS.mindset.all);
            queryClient.setQueryData<Mindset[]>(QUERY_KEYS.mindset.all, (old) =>
                old ? old.filter((m) => m.id !== id) : []
            );
            return { previousMindset };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousMindset) {
                queryClient.setQueryData(QUERY_KEYS.mindset.all, context.previousMindset);
            }
        },
        mutationFn: async (id: number) => {
            await apiFetch(interpolatePath(api.mindset.delete.path, { id }), {
                method: api.mindset.delete.method,
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
