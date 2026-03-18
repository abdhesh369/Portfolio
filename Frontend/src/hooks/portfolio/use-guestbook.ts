import { api } from "@portfolio/shared";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-helpers";
import { fetchAndParse } from "./_fetch-helper";
import type { InsertGuestbookEntry, GuestbookEntry } from "@portfolio/shared/schema";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useGuestbook() {
    return useQuery<GuestbookEntry[]>({
        queryKey: QUERY_KEYS.guestbook.all,
        queryFn: () =>
            fetchAndParse(
                api.guestbook.list.path,
                api.guestbook.list.responses[200],
                "Failed to fetch guestbook entries"
            ),
        staleTime: 0, // Real-time
    });
}

export function useSubmitGuestbook() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationKey: ["submit-guestbook"],
        mutationFn: async (data: InsertGuestbookEntry) => {
            const res = await apiFetch(api.guestbook.create.path, {
                method: api.guestbook.create.method,
                body: JSON.stringify(data),
            });
            const result = api.guestbook.create.responses[201].parse(res);
            return result.data;
        },
        onMutate: async (newEntry) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.guestbook.all });
            const previousEntries = queryClient.getQueryData<GuestbookEntry[]>(QUERY_KEYS.guestbook.all);

            if (previousEntries) {
                const optimisticEntry: GuestbookEntry = {
                    id: Math.random(), // Temporary ID
                    name: newEntry.name,
                    content: newEntry.content,
                    isApproved: true, // Show it immediately for the user
                    createdAt: new Date(),
                    reactions: {},
                };
                queryClient.setQueryData<GuestbookEntry[]>(QUERY_KEYS.guestbook.all, [optimisticEntry, ...previousEntries]);
            }

            return { previousEntries };
        },
        onError: (err: unknown, _newEntry, context) => {
            if (context?.previousEntries) {
                queryClient.setQueryData(QUERY_KEYS.guestbook.all, context.previousEntries);
            }
            const error = err as Error;
            toast({
                title: "Failed to submit entry",
                description: error.message || "Something went wrong",
                variant: "destructive",
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guestbook.all });
        },
        onSuccess: () => {
            toast({
                title: "Entry submitted",
                description: "Your message has been sent for approval.",
            });
        },
    });
}
export function useAdminGuestbook() {
    return useQuery<GuestbookEntry[]>({
        queryKey: QUERY_KEYS.guestbook.admin,
        queryFn: () =>
            fetchAndParse(
                api.guestbook.adminList.path,
                api.guestbook.adminList.responses[200],
                "Failed to fetch admin guestbook entries"
            ),
        staleTime: 0,
    });
}

export function useApproveGuestbook() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationKey: ["approve-guestbook"],
        mutationFn: async (id: number) => {
            const res = await apiFetch(api.guestbook.approve.path.replace(":id", id.toString()), {
                method: api.guestbook.approve.method,
            });
            return api.guestbook.approve.responses[200].parse(res);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guestbook.all });
            toast({
                title: "Entry approved",
                description: "The guestbook entry is now visible on the site.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to approve entry",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

export function useDeleteGuestbook() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationKey: ["delete-guestbook"],
        mutationFn: async (id: number) => {
            await apiFetch(api.guestbook.delete.path.replace(":id", id.toString()), {
                method: api.guestbook.delete.method,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guestbook.all });
            toast({
                title: "Entry deleted",
                description: "The guestbook entry has been removed.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to delete entry",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}


export function useReactToGuestbook() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["react-guestbook"],
        mutationFn: async ({ id, emoji }: { id: number; emoji: string }) => {
            const res = await apiFetch(api.guestbook.react.path.replace(":id", id.toString()), {
                method: api.guestbook.react.method,
                body: JSON.stringify({ emoji }),
            });
            const result = api.guestbook.react.responses[200].parse(res);
            return result.data;
        },
        onMutate: async ({ id, emoji }) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.guestbook.all });
            const previousEntries = queryClient.getQueryData<GuestbookEntry[]>(QUERY_KEYS.guestbook.all);

            if (previousEntries) {
                queryClient.setQueryData<GuestbookEntry[]>(
                    QUERY_KEYS.guestbook.all,
                    previousEntries.map((entry) => {
                        if (entry.id === id) {
                            const reactions = { ...(entry.reactions as Record<string, number> || {}) };
                            reactions[emoji] = (reactions[emoji] || 0) + 1;
                            return { ...entry, reactions };
                        }
                        return entry;
                    })
                );
            }

            return { previousEntries };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousEntries) {
                queryClient.setQueryData(QUERY_KEYS.guestbook.all, context.previousEntries);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guestbook.all });
        },
    });
}
