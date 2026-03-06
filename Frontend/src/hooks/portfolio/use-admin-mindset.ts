import { api } from "@portfolio/shared/routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-helpers";
import type { InsertMindset, Mindset } from "@portfolio/shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCreateMindset() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationKey: ["create-mindset"],
        mutationFn: async (data: InsertMindset) => {
            const res = await apiFetch(api.mindset.create.path, {
                method: api.mindset.create.method,
                body: JSON.stringify(data),
            });
            return api.mindset.create.responses[201].parse(res);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mindset"] });
            toast({
                title: "Principle created",
                description: "The mindset principle has been added successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to create principle",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

export function useUpdateMindset() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationKey: ["update-mindset"],
        mutationFn: async ({ id, data }: { id: number; data: Partial<InsertMindset> }) => {
            const res = await apiFetch(api.mindset.update.path.replace(":id", id.toString()), {
                method: api.mindset.update.method,
                body: JSON.stringify(data),
            });
            return api.mindset.update.responses[200].parse(res);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mindset"] });
            toast({
                title: "Principle updated",
                description: "The mindset principle has been updated successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to update principle",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

export function useDeleteMindset() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationKey: ["delete-mindset"],
        mutationFn: async (id: number) => {
            await apiFetch(api.mindset.delete.path.replace(":id", id.toString()), {
                method: api.mindset.delete.method,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mindset"] });
            toast({
                title: "Principle deleted",
                description: "The mindset principle has been removed.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to delete principle",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}
