import { api } from "@shared/routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-helpers";
import { fetchAndParse } from "./_fetch-helper";
import type { InsertGuestbookEntry, GuestbookEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useGuestbook() {
    return useQuery({
        queryKey: ["guestbook"],
        queryFn: () =>
            fetchAndParse(
                api.guestbook.list.path,
                api.guestbook.list.responses[200],
                "Failed to fetch guestbook entries"
            ),
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
            return api.guestbook.create.responses[201].parse(res);
        },
        onSuccess: () => {
            // Invalidate guestbook query to show new (approved) entry if applicable
            // Note: Backend might require approval, so invalidating might not show the entry immediately
            queryClient.invalidateQueries({ queryKey: ["guestbook"] });
            toast({
                title: "Entry submitted",
                description: "Your message has been sent for approval.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to submit entry",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}
