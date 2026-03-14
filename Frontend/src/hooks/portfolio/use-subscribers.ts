import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@portfolio/shared";
import { toast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; source?: string }) => {
      const { apiFetch } = await import("@/lib/api-helpers");
      return await apiFetch(api.subscribers.subscribe.path, {
        method: api.subscribers.subscribe.method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Thanks for subscribing!" });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscribers.all });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: error.message });
    },
  });
}

export function useUnsubscribe() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { apiFetch } = await import("@/lib/api-helpers");
      return await apiFetch(api.subscribers.unsubscribe.path, {
        method: api.subscribers.unsubscribe.method,
        body: JSON.stringify({ email }),
      });
    },
    onSuccess: () => {
      toast({ title: "Successfully unsubscribed" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: error.message });
    },
  });
}
