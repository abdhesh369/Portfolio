import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@portfolio/shared";
import { toast } from "react-hot-toast";

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
      toast.success("Thanks for subscribing!");
      queryClient.invalidateQueries({ queryKey: ["subscribers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
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
      toast.success("Successfully unsubscribed");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
