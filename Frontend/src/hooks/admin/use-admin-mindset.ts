import { useAdminMutation } from "./use-admin-mutation";
import { api } from "@portfolio/shared/routes";
import { apiFetch } from "@/lib/api-helpers";
import { useMindset } from "../portfolio/use-skills";
import { useQueryClient } from "@tanstack/react-query";
import type { Mindset } from "@portfolio/shared/schema";

export function useAdminMindset() {
    const { refetch } = useMindset();
    const queryClient = useQueryClient();

    const createMutation = useAdminMutation({
        route: api.mindset.create,
        queryKeyToInvalidate: ["mindset"],
        successTitle: "Principle created",
        successDescription: "The mindset principle has been added successfully.",
        mutationFn: async (data: any) => {
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
            await queryClient.cancelQueries({ queryKey: ["mindset"] });
            const previousMindset = queryClient.getQueryData<Mindset[]>(["mindset"]);
            queryClient.setQueryData<Mindset[]>(["mindset"], (old) =>
                old ? old.map((m) => (m.id === id ? { ...m, ...data } : m)) : []
            );
            return { previousMindset };
        },
        onError: (_err, _vars, context: any) => {
            if (context?.previousMindset) {
                queryClient.setQueryData(["mindset"], context.previousMindset);
            }
        },
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            const res = await apiFetch(api.mindset.update.path.replace(":id", id.toString()), {
                method: api.mindset.update.method,
                body: JSON.stringify(data),
            });
            return api.mindset.update.responses[200].parse(res);
        },
    });

    const deleteMutation = useAdminMutation({
        route: api.mindset.delete,
        queryKeyToInvalidate: ["mindset"],
        successTitle: "Principle deleted",
        successDescription: "The mindset principle has been removed.",
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["mindset"] });
            const previousMindset = queryClient.getQueryData<Mindset[]>(["mindset"]);
            queryClient.setQueryData<Mindset[]>(["mindset"], (old) =>
                old ? old.filter((m) => m.id !== id) : []
            );
            return { previousMindset };
        },
        onError: (_err, _vars, context: any) => {
            if (context?.previousMindset) {
                queryClient.setQueryData(["mindset"], context.previousMindset);
            }
        },
        mutationFn: async (id: number) => {
            await apiFetch(api.mindset.delete.path.replace(":id", id.toString()), {
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
