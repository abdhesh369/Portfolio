import { useAdminMutation } from "./use-admin-mutation";
import { api, interpolatePath, type Project } from "@portfolio/shared";
import { apiFetch } from "@/lib/api-helpers";
import { useProjects } from "../portfolio";
import { useQueryClient } from "@tanstack/react-query";

export function useAdminProjects() {
    const { refetch } = useProjects();
    const queryClient = useQueryClient();

    const createMutation = useAdminMutation({
        route: api.projects.create,
        queryKeyToInvalidate: ["projects"],
        successTitle: "Project created",
        successDescription: "The project has been added successfully.",
        mutationFn: async (data: Partial<Project>) => {
            const res = await apiFetch(api.projects.create.path, {
                method: api.projects.create.method,
                body: JSON.stringify(data),
            });
            return api.projects.create.responses[201].parse(res);
        },
    });

    const updateMutation = useAdminMutation({
        route: api.projects.update,
        queryKeyToInvalidate: ["projects"],
        successTitle: "Project updated",
        successDescription: "The project details have been saved.",
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ["projects"] });
            const previousProjects = queryClient.getQueryData<Project[]>(["projects"]);
            queryClient.setQueryData<Project[]>(["projects"], (old) =>
                old ? old.map((p) => (p.id === id ? { ...p, ...data } : p)) : []
            );
            return { previousProjects };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousProjects) {
                queryClient.setQueryData(["projects"], context.previousProjects);
            }
        },
        mutationFn: async ({ id, data }: { id: number; data: Partial<Project> }) => {
            const res = await apiFetch(interpolatePath(api.projects.update.path, { id }), {
                method: api.projects.update.method,
                body: JSON.stringify(data),
            });
            return api.projects.update.responses[200].parse(res);
        },
    });

    const deleteMutation = useAdminMutation({
        route: api.projects.delete,
        queryKeyToInvalidate: ["projects"],
        successTitle: "Project deleted",
        successDescription: "The project has been removed.",
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["projects"] });
            const previousProjects = queryClient.getQueryData<Project[]>(["projects"]);
            queryClient.setQueryData<Project[]>(["projects"], (old) =>
                old ? old.filter((p) => p.id !== id) : []
            );
            return { previousProjects };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousProjects) {
                queryClient.setQueryData(["projects"], context.previousProjects);
            }
        },
        mutationFn: async (id: number) => {
            await apiFetch(interpolatePath(api.projects.delete.path, { id }), {
                method: api.projects.delete.method,
            });
        },
    });

    const reorderMutation = useAdminMutation({
        route: api.projects.reorder,
        queryKeyToInvalidate: ["projects"],
        successTitle: "Projects reordered",
        successDescription: "The new order has been saved.",
        mutationFn: async (orderedIds: number[]) => {
            await apiFetch(api.projects.reorder.path, {
                method: api.projects.reorder.method,
                body: JSON.stringify({ orderedIds }),
            });
        },
    });

    const bulkDeleteMutation = useAdminMutation({
        route: api.projects.bulkDelete,
        queryKeyToInvalidate: ["projects"],
        successTitle: "Projects deleted",
        successDescription: "Selected projects have been removed.",
        mutationFn: async (ids: number[]) => {
            await apiFetch(api.projects.bulkDelete.path, {
                method: api.projects.bulkDelete.method,
                body: JSON.stringify({ ids }),
            });
        },
    });

    const bulkStatusMutation = useAdminMutation({
        route: api.projects.bulkStatus,
        queryKeyToInvalidate: ["projects"],
        successTitle: "Status updated",
        successDescription: "The status of selected projects has been updated.",
        mutationFn: async ({ ids, status }: { ids: number[]; status: string }) => {
            await apiFetch(api.projects.bulkStatus.path, {
                method: api.projects.bulkStatus.method,
                body: JSON.stringify({ ids, status }),
            });
        },
    });

    return {
        create: createMutation.mutateAsync,
        update: updateMutation.mutateAsync,
        remove: deleteMutation.mutateAsync,
        reorder: reorderMutation.mutateAsync,
        bulkDelete: bulkDeleteMutation.mutateAsync,
        bulkStatus: bulkStatusMutation.mutateAsync,
        isPending:
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending ||
            reorderMutation.isPending ||
            bulkDeleteMutation.isPending ||
            bulkStatusMutation.isPending,
        refetch,
    };
}
