import { useAdminMutation } from "./use-admin-mutation";
import { api, interpolatePath, type Service } from "#shared";
import { apiFetch } from "#src/lib/api-helpers";
import { useServices } from "../portfolio";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "#src/lib/query-keys";

export function useAdminServices() {
    const { refetch } = useServices();
    const queryClient = useQueryClient();

    const createMutation = useAdminMutation({
        route: api.services.create,
        queryKeyToInvalidate: QUERY_KEYS.services.all,
        successTitle: "Service created",
        successDescription: "The service has been added successfully.",
        mutationFn: async (data: Partial<Service>) => {
            const res = await apiFetch(api.services.create.path, {
                method: api.services.create.method,
                body: JSON.stringify(data),
            });
            return api.services.create.responses[201].parse(res);
        },
    });

    const updateMutation = useAdminMutation({
        route: api.services.update,
        queryKeyToInvalidate: QUERY_KEYS.services.all,
        successTitle: "Service updated",
        successDescription: "The service details have been saved.",
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.services.all });
            const previousServices = queryClient.getQueryData<Service[]>(QUERY_KEYS.services.all);
            queryClient.setQueryData<Service[]>(QUERY_KEYS.services.all, (old) =>
                old ? old.map((s) => (s.id === id ? { ...s, ...data } : s)) : []
            );
            return { previousServices };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousServices) {
                queryClient.setQueryData(QUERY_KEYS.services.all, context.previousServices);
            }
        },
        mutationFn: async ({ id, data }: { id: number; data: Partial<Service> }) => {
            const res = await apiFetch(interpolatePath(api.services.update.path, { id }), {
                method: api.services.update.method,
                body: JSON.stringify(data),
            });
            return api.services.update.responses[200].parse(res);
        },
    });

    const deleteMutation = useAdminMutation({
        route: api.services.delete,
        queryKeyToInvalidate: QUERY_KEYS.services.all,
        successTitle: "Service deleted",
        successDescription: "The service has been removed.",
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.services.all });
            const previousServices = queryClient.getQueryData<Service[]>(QUERY_KEYS.services.all);
            queryClient.setQueryData<Service[]>(QUERY_KEYS.services.all, (old) =>
                old ? old.filter((s) => s.id !== id) : []
            );
            return { previousServices };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousServices) {
                queryClient.setQueryData(QUERY_KEYS.services.all, context.previousServices);
            }
        },
        mutationFn: async (id: number) => {
            await apiFetch(interpolatePath(api.services.delete.path, { id }), {
                method: api.services.delete.method,
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
