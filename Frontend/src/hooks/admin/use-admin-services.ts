import { useAdminMutation } from "./use-admin-mutation";
import { api } from "@portfolio/shared/routes";
import { apiFetch } from "@/lib/api-helpers";
import { useServices } from "../portfolio";
import { useQueryClient } from "@tanstack/react-query";
import type { Service } from "@portfolio/shared/schema";

export function useAdminServices() {
    const { refetch } = useServices();
    const queryClient = useQueryClient();

    const createMutation = useAdminMutation({
        route: api.services.create,
        queryKeyToInvalidate: ["services"],
        successTitle: "Service created",
        successDescription: "The service has been added successfully.",
        mutationFn: async (data: any) => {
            const res = await apiFetch(api.services.create.path, {
                method: api.services.create.method,
                body: JSON.stringify(data),
            });
            return api.services.create.responses[201].parse(res);
        },
    });

    const updateMutation = useAdminMutation({
        route: api.services.update,
        queryKeyToInvalidate: ["services"],
        successTitle: "Service updated",
        successDescription: "The service details have been saved.",
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ["services"] });
            const previousServices = queryClient.getQueryData<Service[]>(["services"]);
            queryClient.setQueryData<Service[]>(["services"], (old) =>
                old ? old.map((s) => (s.id === id ? { ...s, ...data } : s)) : []
            );
            return { previousServices };
        },
        onError: (_err, _vars, context: any) => {
            if (context?.previousServices) {
                queryClient.setQueryData(["services"], context.previousServices);
            }
        },
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            const res = await apiFetch(api.services.update.path.replace(":id", id.toString()), {
                method: api.services.update.method,
                body: JSON.stringify(data),
            });
            return api.services.update.responses[200].parse(res);
        },
    });

    const deleteMutation = useAdminMutation({
        route: api.services.delete,
        queryKeyToInvalidate: ["services"],
        successTitle: "Service deleted",
        successDescription: "The service has been removed.",
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["services"] });
            const previousServices = queryClient.getQueryData<Service[]>(["services"]);
            queryClient.setQueryData<Service[]>(["services"], (old) =>
                old ? old.filter((s) => s.id !== id) : []
            );
            return { previousServices };
        },
        onError: (_err, _vars, context: any) => {
            if (context?.previousServices) {
                queryClient.setQueryData(["services"], context.previousServices);
            }
        },
        mutationFn: async (id: number) => {
            await apiFetch(api.services.delete.path.replace(":id", id.toString()), {
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
